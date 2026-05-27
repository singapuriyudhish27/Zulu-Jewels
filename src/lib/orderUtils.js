import mongoose from 'mongoose';
import { connectDB } from './db';
import Customer from './models/Customer';
import User from './models/User';
import Order from './models/Order';
import OrderItem from './models/OrderItem';
import CartItem from './models/CartItem';
import ProductVariant from './models/ProductVariant';
import Product from './models/Product';
import Transaction from './models/Transaction';
import UserAddress from './models/UserAddress';
import { sendOrderEmail } from './emailService';

/**
 * Builds the full enriched data object needed by email templates & the PDF invoice.
 * @param {string|object} orderId
 * @returns {Promise<object|null>}
 */
export async function buildOrderEmailData(orderId) {
    try {
        const order = await Order.findById(orderId);
        if (!order) return null;

        const customer = order.customer_id ? await Customer.findById(order.customer_id) : null;
        const user = customer?.user_id
            ? await User.findById(customer.user_id).select('firstName lastName email phone')
            : null;

        const rawItems = await OrderItem.find({ order_id: orderId }).sort({ _id: 1 });
        const items = [];
        for (const oi of rawItems) {
            const product = await Product.findById(oi.product_id);
            let variant_material = null;
            if (oi.variant_id) {
                const variant = await ProductVariant.findById(oi.variant_id);
                variant_material = variant?.material || null;
            }
            items.push({
                product_name:     product?.name || 'Product',
                product_id:       oi.product_id,
                variant_id:       oi.variant_id || null,
                quantity:         oi.quantity,
                price:            oi.price,
                variant_material,
            });
        }

        const transaction = await Transaction.findOne({ order_id: orderId });

        return { order, customer, user, items, transaction };
    } catch (err) {
        console.error('[EmailService] buildOrderEmailData error:', err.message);
        return null;
    }
}

/**
 * Handles the database transaction for creating an order after a successful payment.
 * @param {string} userId - The ID of the user placing the order.
 * @param {object} details - Object containing payment_method, shipping_address, receipt_url, and optional specificItem.
 */
export async function processOrderSuccess(userId, details) {
    const { payment_method, receipt_url, specificItem = null } = details;
    let shipping_address = specificItem?.shippingAddress || details.shipping_address;
    await connectDB();

    let session = null;
    try {
        const hello = await mongoose.connection.db.command({ hello: 1 });
        const supportsTransactions = !!(hello.setName || hello.isreplicaset);
        if (supportsTransactions) {
            session = await mongoose.startSession();
            session.startTransaction();
        } else {
            console.warn("⚠️ MongoDB is running as a standalone instance (no replica set). Proceeding without transactions.");
        }
    } catch (e) {
        console.warn("⚠️ Failed to check replica set capabilities. Proceeding without transactions:", e.message);
        session = null;
    }

    let finalAmount = 0;
    try {
        // Resolve shipping address if not provided or N/A
        if (!shipping_address || shipping_address === "N/A") {
            const defaultAddr = await UserAddress.findOne({ user_id: userId, is_default: true }).session(session);
            if (defaultAddr) {
                shipping_address = defaultAddr.address_line;
            } else {
                const anyAddr = await UserAddress.findOne({ user_id: userId }).session(session);
                shipping_address = anyAddr ? anyAddr.address_line : "N/A";
            }
        }

        // Prevent duplicate order creation for the same payment receipt URL
        const existingOrder = await Order.findOne({ receipt_url }).session(session);
        if (existingOrder) {
            console.log(`⚠️ Order already processed for receipt/payment identifier: ${receipt_url}`);
            if (session) await session.commitTransaction();
            return { success: true, orderId: existingOrder._id };
        }

        // 1. Get or Create Customer ID link
        let customer = await Customer.findOne({ user_id: userId }).session(session);

        let customerId;
        if (customer) {
            customerId = customer._id;
        } else {
            // Need to fetch user details to create a minimal customer entry
            const user = await User.findById(userId).session(session);
            if (!user) throw new Error("User not found");
            
            const newCustomer = await Customer.create([{
                user_id: userId,
                customer_name: `${user.firstName} ${user.lastName}`,
                location: shipping_address
            }], { session });
            customerId = newCustomer[0]._id;
        }

        // 2. Insert the main Order record
        const newOrder = await Order.create([{
            customer_id: customerId,
            payment_method,
            shipping_address,
            is_paid: true,
            receipt_url,
            status: "Processing"
        }], { session });
        const orderId = newOrder[0]._id;

        // 3. Insert Order Items
        if (specificItem) {
            // Case A: Single Item Purchase (e.g., from Product Details "Checkout Now")
            await OrderItem.create([{
                order_id: orderId,
                product_id: specificItem.productId,
                variant_id: specificItem.variantId || null,
                quantity: specificItem.quantity || 1,
                price: specificItem.price
            }], { session });
            finalAmount = specificItem.price;
        } else {
            // Case B: Whole Cart Purchase
            const cartItems = await CartItem.find({ user_id: userId }).session(session);

            if (cartItems.length === 0) {
                // If the cart is empty but a payment was made, something is wrong
                // but we should still record the order if money was received.
                console.warn(`Payment received but cart is empty for user ${userId}`);
            }

            let totalCartAmount = 0;
            for (const item of cartItems) {
                // Resolve the price: variant price or product price
                let unitPrice;
                if (item.variant_id) {
                    const variant = await ProductVariant.findById(item.variant_id).session(session);
                    unitPrice = variant ? variant.price : null;
                }
                if (!unitPrice) {
                    const product = await Product.findById(item.product_id).session(session);
                    unitPrice = product ? product.price : 0;
                }

                const itemTotal = unitPrice * item.quantity;
                totalCartAmount += itemTotal;
                await OrderItem.create([{
                    order_id: orderId,
                    product_id: item.product_id,
                    variant_id: item.variant_id || null,
                    quantity: item.quantity,
                    price: unitPrice
                }], { session });
            }

            // 4. Clear the User's Cart now that order is placed
            await CartItem.deleteMany({ user_id: userId }).session(session);

            // Set amount for transaction record 
            finalAmount = totalCartAmount;
        }

        // 5. Duplicate the record into Transactions table for record keeping
        await Transaction.create([{
            order_id: orderId,
            customer_id: customerId,
            amount: finalAmount,
            payment_method,
            status: "Success"
        }], { session });

        if (session) await session.commitTransaction();

        // ── Fire Order Placed Email (non-blocking) ────────────────────────────
        buildOrderEmailData(orderId).then((emailData) => {
            if (emailData) {
                return sendOrderEmail('order_placed', emailData);
            }
        }).catch((err) => {
            console.error('[EmailService] Order placed email failed (non-critical):', err.message);
        });

        return { success: true, orderId };
    } catch (error) {
        if (session) await session.abortTransaction();
        console.error("Critical: Order Processing Transaction Failed:", error);
        throw error;
    } finally {
        if (session) session.endSession();
    }
}
