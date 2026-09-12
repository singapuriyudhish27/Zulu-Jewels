export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import OrderItem from "@/lib/models/OrderItem";
import Customer from "@/lib/models/Customer";
import User from "@/lib/models/User";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import ProductVariant from "@/lib/models/ProductVariant";
import { sendOrderEmail } from "@/lib/emailService";
import { buildOrderEmailData } from "@/lib/orderUtils";
import { verifyAdminFromRequest } from "@/lib/adminAuth";
import InventoryJournal from "@/lib/models/InventoryJournal";
import RefundRecord from "@/lib/models/RefundRecord";
import OrderSideEffect from "@/lib/models/OrderSideEffect";
import { dispatchOutboxJob } from "@/lib/orderOutbox";
import Stripe from "stripe";
import Razorpay from "razorpay";

// Maps order status values to email event types
const STATUS_EMAIL_MAP = {
    Shipped:   'order_shipped',
    Delivered: 'order_delivered',
    Cancelled: 'order_cancelled',
};

//Get The Orders Data
export async function GET(req) {
    const auth = await verifyAdminFromRequest(req);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        await connectDB();

        const url = new URL(req.url);
        const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
        const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "20", 10), 1), 100);
        const skip = (page - 1) * limit;

        const totalOrders = await Order.countDocuments();
        const orders = await Order.find()
            .select('_id customer_id order_date payment_method is_paid status created_at is_refunded shipping_partner tracking_url expected_delivery_date delivery_received delivery_confirmed_at receipt_url shipping_address')
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .lean();


        const customerIds = orders.map(o => o.customer_id).filter(Boolean);

        // Fetch customers in bulk
        const customers = await Customer.find({ _id: { $in: customerIds } })
            .select('_id user_id customer_name location')
            .lean();
        const customersMap = {};
        for (const c of customers) {
            customersMap[c._id.toString()] = c;
        }

        const userIds = customers.map(c => c.user_id).filter(Boolean);

        // Fetch users in bulk
        const users = await User.find({ _id: { $in: userIds } })
            .select('firstName lastName email phone')
            .lean();
        
        const usersMap = {};
        for (const u of users) {
            usersMap[u._id.toString()] = u;
        }

        const orderIds = orders.map(o => o._id);

        // Fetch order items in bulk
        const orderItems = await OrderItem.find({ order_id: { $in: orderIds } })
            .select('_id order_id product_id variant_id quantity price')
            .sort({ _id: 1 })
            .lean();

        const productIds = orderItems.map(oi => oi.product_id).filter(Boolean);

        // Fetch products in bulk
        const products = await Product.find({ _id: { $in: productIds } })
            .select('_id name price category_id')
            .lean();
        const productsMap = {};
        for (const p of products) {
            productsMap[p._id.toString()] = p;
        }

        const categoryIds = products.map(p => p.category_id).filter(Boolean);

        // Fetch categories in bulk
        const categories = await Category.find({ _id: { $in: categoryIds } })
            .select('_id name')
            .lean();
        const categoriesMap = {};
        for (const cat of categories) {
            categoriesMap[cat._id.toString()] = { id: cat._id, name: cat.name };
        }

        const variantIds = orderItems.map(oi => oi.variant_id).filter(Boolean);

        // Fetch variants in bulk
        const variants = await ProductVariant.find({ _id: { $in: variantIds } })
            .select('_id material')
            .lean();
        const variantsMap = {};
        for (const v of variants) {
            variantsMap[v._id.toString()] = v.material;
        }

        // Map order items by order ID
        const orderItemsMap = {};
        for (const oi of orderItems) {
            const oid = oi.order_id.toString();
            if (!orderItemsMap[oid]) {
                orderItemsMap[oid] = [];
            }

            const product = oi.product_id ? productsMap[oi.product_id.toString()] : null;
            const category = product?.category_id ? categoriesMap[product.category_id.toString()] : null;
            const variant_material = oi.variant_id ? variantsMap[oi.variant_id.toString()] : null;

            orderItemsMap[oid].push({
                order_item_id: oi._id,
                product_id: product?._id || null,
                product_name: product?.name || null,
                product_price: product?.price || null,
                quantity: oi.quantity,
                item_price: oi.price,
                category,
                variant_id: oi.variant_id || null,
                variant_material,
            });
        }

        const recentOrders = orders.map(o => {
            const customer = o.customer_id ? customersMap[o.customer_id.toString()] : null;
            const user = customer?.user_id ? usersMap[customer.user_id.toString()] : null;
            const items = orderItemsMap[o._id.toString()] || [];

            return {
                order_id: o._id,
                order_date: o.order_date,
                payment_method: o.payment_method,
                shipping_address: o.shipping_address,
                is_paid: o.is_paid,
                receipt_url: o.receipt_url,
                order_status: o.status,
                order_created_at: o.created_at,
                shipping_partner: o.shipping_partner || null,
                tracking_url: o.tracking_url || null,
                expected_delivery_date: o.expected_delivery_date || null,
                delivery_received: o.delivery_received !== undefined ? o.delivery_received : null,
                delivery_remarks: o.delivery_remarks || null,
                delivery_feedback: o.delivery_feedback || null,
                delivery_confirmed_at: o.delivery_confirmed_at || null,
                is_refunded: Boolean(o.is_refunded),
                customer: customer ? {
                    id: customer._id,
                    customer_name: customer.customer_name,
                    location: customer.location,
                } : { id: null, customer_name: null, location: null },
                user: user ? {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                } : { id: null, firstName: null, lastName: null, email: null, phone: null },
                items,
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                recent_orders: recentOrders,
            },
            pagination: {
                totalOrders,
                totalPages: Math.ceil(totalOrders / limit),
                currentPage: page,
                limit
            }
        }, { status: 200 });
    } catch (error) {
        console.error("Error Getting Orders Data:", error);
        return NextResponse.json({ message: "Error In Backend API Call" }, { status: 500 });
    }
}

//Edit Orders
export async function PUT(request) {
    const auth = await verifyAdminFromRequest(request);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        //Database Connection
        await connectDB();
        const body = await request.json();

        const {
            order_id,
            status,
            is_paid,
            shipping_address,
            receipt_url,
            payment_method,
            shipping_partner,
            tracking_url,
            expected_delivery_date,
            is_refunded
        } = body;

        //Basic Validation Check
        if (!order_id) {
            return NextResponse.json({
                success: false,
                message: "Order ID is required"
            }, { status: 400 });
        }

        if (!/^[0-9a-fA-F]{24}$/.test(order_id)) {
            return NextResponse.json({ success: false, message: "Invalid Order ID format" }, { status: 400 });
        }

        // Build dynamic update fields
        const updateFields = {};
        if (status !== undefined) updateFields.status = status;
        if (is_paid !== undefined) updateFields.is_paid = is_paid;
        if (shipping_address !== undefined) updateFields.shipping_address = shipping_address;
        if (receipt_url !== undefined) updateFields.receipt_url = receipt_url;
        if (payment_method !== undefined) updateFields.payment_method = payment_method;
        if (shipping_partner !== undefined) updateFields.shipping_partner = shipping_partner;
        if (tracking_url !== undefined) updateFields.tracking_url = tracking_url;
        if (expected_delivery_date !== undefined) updateFields.expected_delivery_date = expected_delivery_date;
        if (is_refunded !== undefined) updateFields.is_refunded = is_refunded;

        if (Object.keys(updateFields).length === 0) {
            return NextResponse.json(
                { success: false, message: "No fields provided to update." },
                { status: 400 }
            );
        }

        // Fetch current order to enforce legal state machine transitions
        const currentOrder = await Order.findById(order_id);
        if (!currentOrder) {
            return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
        }

        // 1. Enforce Legal State Transitions
        if (status && status !== currentOrder.status) {
            const LEGAL_TRANSITIONS = {
                'Pending': ['Paid', 'Cancelled'],
                'Paid': ['Processing', 'Cancelled', 'RefundPending'],
                'Processing': ['Shipped', 'Cancelled', 'RefundPending'],
                'Shipped': ['Delivered'],
                'Delivered': [],
                'Cancelled': [],
                'RefundPending': ['Refunded', 'Cancelled'],
                'Refunded': []
            };

            const allowed = LEGAL_TRANSITIONS[currentOrder.status] || [];
            if (!allowed.includes(status)) {
                return NextResponse.json({
                    success: false,
                    message: `Illegal order transition from "${currentOrder.status}" to "${status}"`
                }, { status: 400 });
            }
        }

        // 2. Cancellation and Idempotent Stock Restoration via InventoryJournal
        let shouldRestoreStock = false;
        let result;

        if (status === 'Cancelled') {
            result = await Order.updateOne(
                { _id: order_id, status: { $ne: 'Cancelled' } },
                updateFields
            );
            if (result.modifiedCount === 1) {
                shouldRestoreStock = true;
            } else {
                result = await Order.updateOne({ _id: order_id }, updateFields);
            }
        } else {
            result = await Order.updateOne({ _id: order_id }, updateFields);
        }

        // 3. Durable Inventory Restoration (Guaranteed Exact-Once via InventoryJournal)
        if (shouldRestoreStock) {
            const cancelOpId = `inv_cancel_${order_id}`;
            const journalRecord = await InventoryJournal.findOneAndUpdate(
                { operation_id: cancelOpId },
                {
                    $setOnInsert: {
                        operation_id: cancelOpId,
                        checkout_id: currentOrder.checkout_id || `chk_${order_id}`,
                        status: 'APPLYING',
                        items: []
                    }
                },
                { upsert: true, new: true }
            );

            if (journalRecord.status !== 'ROLLED_BACK') {
                const orderItems = await OrderItem.find({ order_id }).lean();
                for (const item of orderItems) {
                    if (item.variant_id && item.quantity > 0) {
                        try {
                            await ProductVariant.updateOne(
                                { _id: item.variant_id },
                                { $inc: { stock: item.quantity } }
                            );
                        } catch (stockErr) {
                            console.error(`[OrderManagement] Failed to restore stock for variant ${item.variant_id}:`, stockErr.message);
                        }
                    }
                }
                await InventoryJournal.updateOne(
                    { operation_id: cancelOpId },
                    { $set: { status: 'ROLLED_BACK' } }
                );
            }

            // 4. Automated Provider Refund on Paid Cancellation
            if (currentOrder.is_paid && currentOrder.refund_status !== 'REFUNDED') {
                const refundAmountPaise = currentOrder.total_paise || Math.round(Number(currentOrder.amount || 0) * 100);
                const refundOpId = `ref_${order_id}_cancel`;

                if (currentOrder.provider === 'stripe' && currentOrder.payment_id && process.env.STRIPE_SECRET_KEY) {
                    try {
                        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
                        const refund = await stripe.refunds.create({
                            payment_intent: currentOrder.payment_id
                        }, {
                            idempotencyKey: refundOpId
                        });

                        await Order.updateOne({ _id: order_id }, {
                            $set: {
                                is_refunded: true,
                                refund_status: 'REFUNDED',
                                refund_id: refund.id,
                                refund_amount_paise: refundAmountPaise
                            }
                        });
                    } catch (refErr) {
                        console.error("[OrderManagement] Stripe refund error:", refErr.message);
                        await Order.updateOne({ _id: order_id }, { $set: { refund_status: 'REFUND_FAILED' } });
                    }
                } else if (currentOrder.provider === 'razorpay' && currentOrder.payment_id && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
                    try {
                        const razorPay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
                        const receiptId = refundOpId.slice(-40);

                        // 1. Pre-flight idempotency verification: check if refund already exists on Razorpay ledger
                        let existingRefund = null;
                        try {
                            const pastRefunds = await razorPay.payments.fetchRefunds(currentOrder.payment_id);
                            if (pastRefunds && pastRefunds.items && pastRefunds.items.length > 0) {
                                existingRefund = pastRefunds.items.find(r => r.receipt === receiptId || r.notes?.refundOpId === refundOpId);
                            }
                        } catch (fetchRefErr) {
                            console.warn('[OrderManagement] Razorpay fetchRefunds pre-check note:', fetchRefErr.message);
                        }

                        let refund = existingRefund;
                        if (!refund) {
                            refund = await razorPay.payments.refund(currentOrder.payment_id, {
                                receipt: receiptId,
                                notes: { refundOpId }
                            });
                        }

                        await Order.updateOne({ _id: order_id }, {
                            $set: {
                                is_refunded: true,
                                refund_status: 'REFUNDED',
                                refund_id: refund.id,
                                refund_amount_paise: refundAmountPaise
                            }
                        });
                    } catch (refErr) {
                        console.error("[OrderManagement] Razorpay refund error:", refErr.message);
                        await Order.updateOne({ _id: order_id }, { $set: { refund_status: 'REFUND_FAILED' } });
                    }
                }
            }
        }

        // Fetch updated order
        const updatedOrder = await Order.findById(order_id);

        // 5. Enqueue Status Side Effects to Durable Outbox
        const emailType = STATUS_EMAIL_MAP[status] || (is_refunded === true ? 'order_refunded' : null);
        if (emailType) {
            const outboxKey = `email_${emailType}_${order_id}_${status || 'refund'}`;
            await OrderSideEffect.findOneAndUpdate(
                { operation_key: outboxKey },
                {
                    $setOnInsert: {
                        operation_key: outboxKey,
                        type: emailType,
                        order_id,
                        status: 'PENDING',
                        next_attempt_at: new Date()
                    }
                },
                { upsert: true }
            );

            // Trigger non-blocking outbox processing
            dispatchOutboxJob().catch(err => console.error('[OrderManagement] Outbox dispatch error:', err.message));
        }

        return NextResponse.json({
            success: true,
            message: "Order updated successfully",
            data: updatedOrder
        }, { status: 200 });
    } catch (error) {
        console.error("Error Editing Orders:", error);
        return NextResponse.json({ message: error.message || "Error In Backend API Call" }, { status: 500 });
    }
}

// Delete Order (Only Allowed When Status = Cancelled)
export async function DELETE(request) {
    const auth = await verifyAdminFromRequest(request);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        await connectDB();
        const body = await request.json();
        const { order_id } = body;

        if (!order_id) {
            return NextResponse.json(
                { success: false, message: "Order ID is required." },
                { status: 400 }
            );
        }

        if (!/^[0-9a-fA-F]{24}$/.test(order_id)) {
            return NextResponse.json({ success: false, message: "Invalid Order ID format" }, { status: 400 });
        }

        // Fetch the order to validate status
        const order = await Order.findById(order_id);

        if (!order) {
            return NextResponse.json(
                { success: false, message: "Order not found." },
                { status: 404 }
            );
        }

        if (order.status !== 'Cancelled') {
            return NextResponse.json(
                { success: false, message: "Only Cancelled orders can be deleted." },
                { status: 403 }
            );
        }

        // Delete child order_items first
        await OrderItem.deleteMany({ order_id });

        // Delete the order
        await Order.deleteOne({ _id: order_id });



        return NextResponse.json({
            success: true,
            message: "Order deleted successfully."
        }, { status: 200 });
    } catch (error) {
        console.error("Error Deleting Order:", error);
        return NextResponse.json(
            { success: false, message: "Error In Backend API Call" },
            { status: 500 }
        );
    }
}