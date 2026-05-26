import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Customer from "@/lib/models/Customer";
import User from "@/lib/models/User";
import Order from "@/lib/models/Order";
import OrderItem from "@/lib/models/OrderItem";

export async function GET() {
    try {
        await connectDB();

        const customers = await Customer.find().sort({ _id: 1 });
        console.log("Backend API To Get Users, Customers, Orders & Order Items.");

        const data = [];

        for (const c of customers) {
            const user = c.user_id ? await User.findById(c.user_id).select('firstName lastName email phone is_active is_verified') : null;
            const orders = await Order.find({ customer_id: c._id }).sort({ created_at: -1 });

            const orderList = [];
            for (const o of orders) {
                const items = await OrderItem.find({ order_id: o._id }).sort({ created_at: -1 });

                orderList.push({
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
                });
            }

            data.push({
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
            });
        }

        return NextResponse.json({
            success: true,
            data,
            adminEmail: process.env.SMTP_USER
        }, { status: 200 });
    } catch (error) {
        console.error("Error Getting Customers Data:", error);
        return NextResponse.json({ message: "Error In Backend API Call" });
    }
}