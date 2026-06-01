import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Customer from "@/lib/models/Customer";
import User from "@/lib/models/User";
import Order from "@/lib/models/Order";
import OrderItem from "@/lib/models/OrderItem";

import { verifyAdminFromRequest } from "@/lib/adminAuth";

export async function GET(req) {
    const auth = await verifyAdminFromRequest(req);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        await connectDB();

        const customers = await Customer.find().sort({ _id: -1 }).limit(100).lean();


        const userIds = customers.map(c => c.user_id).filter(Boolean);
        const customerIds = customers.map(c => c._id);

        // Fetch users in bulk
        const users = await User.find({ _id: { $in: userIds } })
            .select('firstName lastName email phone is_active is_verified')
            .lean();
        
        const usersMap = {};
        for (const u of users) {
            usersMap[u._id.toString()] = u;
        }

        // Fetch orders in bulk
        const orders = await Order.find({ customer_id: { $in: customerIds } })
            .sort({ created_at: -1 })
            .lean();
        
        const ordersMap = {};
        for (const o of orders) {
            const cid = o.customer_id.toString();
            if (!ordersMap[cid]) {
                ordersMap[cid] = [];
            }
            ordersMap[cid].push(o);
        }

        const orderIds = orders.map(o => o._id);

        // Fetch order items in bulk
        const orderItems = await OrderItem.find({ order_id: { $in: orderIds } })
            .sort({ created_at: -1 })
            .lean();

        const orderItemsMap = {};
        for (const oi of orderItems) {
            const oid = oi.order_id.toString();
            if (!orderItemsMap[oid]) {
                orderItemsMap[oid] = [];
            }
            orderItemsMap[oid].push(oi);
        }

        const data = customers.map(c => {
            const user = c.user_id ? usersMap[c.user_id.toString()] : null;
            const cOrders = ordersMap[c._id.toString()] || [];
            
            const orderList = cOrders.map(o => {
                const items = orderItemsMap[o._id.toString()] || [];
                return {
                    id: o._id,
                    order_date: o.order_date,
                    payment_method: o.payment_method,
                    shipping_address: o.shipping_address,
                    is_paid: o.is_paid,
                    status: o.status,
                    receipt_url: o.receipt_url,
                    created_at: o.created_at,
                    items: items.map(oi => ({
                        id: oi._id,
                        product_id: oi.product_id,
                        quantity: oi.quantity,
                        price: oi.price,
                        created_at: oi.created_at,
                    })),
                };
            });

            return {
                id: c._id,
                customer_name: c.customer_name,
                location: c.location,
                created_at: c.created_at,
                user: user ? {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    is_active: user.is_active,
                    is_verified: user.is_verified,
                } : null,
                orders: orderList,
            };
        });

        return NextResponse.json({
            success: true,
            data
        }, { status: 200 });
    } catch (error) {
        console.error("Error Getting Customers Data:", error);
        return NextResponse.json({ message: "Error In Backend API Call" }, { status: 500 });
    }
}