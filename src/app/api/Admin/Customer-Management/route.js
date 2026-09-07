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

        const url = new URL(req.url);
        const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
        const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "20", 10), 1), 100);
        const skip = (page - 1) * limit;

        const totalCustomers = await Customer.countDocuments();
        const customers = await Customer.find().sort({ _id: -1 }).skip(skip).limit(limit).lean();

        const userIds = customers.map(c => c.user_id).filter(Boolean);
        const customerIds = customers.map(c => c._id);

        // Fetch users in bulk — only the fields the UI needs
        const users = await User.find({ _id: { $in: userIds } })
            .select('firstName lastName email phone is_active is_verified')
            .lean();
        
        const usersMap = {};
        for (const u of users) {
            usersMap[u._id.toString()] = u;
        }

        // Fetch orders in bulk — only fields needed by the UI list
        const orders = await Order.find({ customer_id: { $in: customerIds } })
            .select('_id customer_id order_date payment_method is_paid status created_at')
            .sort({ created_at: -1 })
            .lean();
        
        const ordersMap = {};
        for (const o of orders) {
            const cid = o.customer_id.toString();
            if (!ordersMap[cid]) ordersMap[cid] = [];
            ordersMap[cid].push(o);
        }

        const orderIds = orders.map(o => o._id);

        // Aggregate total_spent and item_count per order in a SINGLE DB round-trip.
        // This replaces the previous bulk OrderItem.find() that fetched every row for every order,
        // which could be thousands of records for 100 customers.
        const orderTotals = await OrderItem.aggregate([
            { $match: { order_id: { $in: orderIds } } },
            {
                $group: {
                    _id: '$order_id',
                    total: { $sum: { $multiply: ['$price', '$quantity'] } },
                    item_count: { $sum: '$quantity' },
                }
            }
        ]);

        const orderTotalsMap = {};
        for (const ot of orderTotals) {
            orderTotalsMap[ot._id.toString()] = { total: ot.total, item_count: ot.item_count };
        }

        const data = customers.map(c => {
            const user = c.user_id ? usersMap[c.user_id.toString()] : null;
            const cOrders = ordersMap[c._id.toString()] || [];
            
            const orderList = cOrders.map(o => {
                const totals = orderTotalsMap[o._id.toString()] || { total: 0, item_count: 0 };
                return {
                    id: o._id,
                    order_date: o.order_date,
                    payment_method: o.payment_method,
                    is_paid: o.is_paid,
                    status: o.status,
                    created_at: o.created_at,
                    // Pre-computed from aggregation — eliminates the need for items[] in UI
                    total_spent: totals.total,
                    item_count: totals.item_count,
                    // Keep items as empty array so any existing UI spread/map doesn't break
                    items: [],
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
            data,
            pagination: {
                totalCustomers,
                totalPages: Math.ceil(totalCustomers / limit),
                currentPage: page,
                limit
            }
        }, { status: 200 });
    } catch (error) {
        console.error("Error Getting Customers Data:", error);
        return NextResponse.json({ message: "Error In Backend API Call" }, { status: 500 });
    }
}