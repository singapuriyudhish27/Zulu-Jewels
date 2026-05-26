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

/**
 * Handles the database transaction for creating an order after a successful payment.
 * @param {string} userId - The ID of the user placing the order.
 * @param {object} details - Object containing payment_method, shipping_address, receipt_url, and optional specificItem.
 */
export async function processOrderSuccess(userId, details) {
    const { payment_method, receipt_url, specificItem = null } = details;
    const shipping_address = specificItem?.shippingAddress || details.shipping_address || "N/A";
    await connectDB();

    const session = await mongoose.startSession();
    session.startTransaction();

    let finalAmount = 0;
    try {
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

        await session.commitTransaction();
        return { success: true, orderId };
    } catch (error) {
        await session.abortTransaction();
        console.error("Critical: Order Processing Transaction Failed:", error);
        throw error;
    } finally {
        session.endSession();
    }
}
