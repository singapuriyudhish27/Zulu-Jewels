import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import OrderItem from "@/lib/models/OrderItem";
import Product from "@/lib/models/Product";
import Customer from "@/lib/models/Customer";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Helper function to extract user from session cookie
async function getUserFromCookie() {
    const cookieStore = await cookies();
    const cookie = cookieStore.get("zulu_jewels")?.value;
    if (!cookie) return null;
    try {
        const decoded = jwt.verify(cookie, process.env.JWT_SECRET);
        return decoded;
    } catch (err) {
        return null;
    }
}

// Get Order details for confirmation page
export async function GET(request) {
    try {
        const user = await getUserFromCookie();
        if (!user) {
            return NextResponse.json({ success: false, message: "Unauthorized. Please login first." }, { status: 401 });
        }

        await connectDB();
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get("orderId");

        if (!orderId || !/^[0-9a-fA-F]{24}$/.test(orderId)) {
            return NextResponse.json({ success: false, message: "Invalid or missing Order ID" }, { status: 400 });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }

        // Enforce ownership or admin check
        const isAdmin = user.role === 'admin';
        const customer = await Customer.findOne({ user_id: user.userId });
        const isOwner = customer && String(order.customer_id) === String(customer._id);
        if (!isAdmin && !isOwner) {
            return NextResponse.json({ success: false, message: "Forbidden: You do not have permission to view this order" }, { status: 403 });
        }

        // Fetch items in the order
        const items = await OrderItem.find({ order_id: order._id });
        const itemsWithDetails = [];

        for (const item of items) {
            const product = item.product_id
                ? await Product.findById(item.product_id).select('name').lean()
                : null;
            itemsWithDetails.push({
                product_name: product?.name || "Premium Jewelry Item",
                quantity: item.quantity,
                price: item.price
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                order_id: order._id,
                order_date: order.order_date || order.created_at,
                shipping_address: order.shipping_address,
                shipping_partner: order.shipping_partner,
                status: order.status,
                delivery_received: order.delivery_received,
                delivery_remarks: order.delivery_remarks,
                delivery_feedback: order.delivery_feedback,
                items: itemsWithDetails
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Error in Delivery Confirmation GET:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}

// Save customer delivery confirmation & feedback
export async function POST(request) {
    try {
        const user = await getUserFromCookie();
        if (!user) {
            return NextResponse.json({ success: false, message: "Unauthorized. Please login first." }, { status: 401 });
        }

        await connectDB();
        const body = await request.json();
        const { orderId, received, remarks, feedback } = body;

        if (!orderId || !/^[0-9a-fA-F]{24}$/.test(orderId)) {
            return NextResponse.json({ success: false, message: "Invalid or missing Order ID" }, { status: 400 });
        }

        if (received === undefined || received === null) {
            return NextResponse.json({ success: false, message: "Receipt confirmation is required" }, { status: 400 });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }

        // Enforce ownership or admin check
        const isAdmin = user.role === 'admin';
        const customer = await Customer.findOne({ user_id: user.userId });
        const isOwner = customer && String(order.customer_id) === String(customer._id);
        if (!isAdmin && !isOwner) {
            return NextResponse.json({ success: false, message: "Forbidden: You do not have permission to modify this order" }, { status: 403 });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
                delivery_received: Boolean(received),
                delivery_remarks: remarks || "",
                delivery_feedback: feedback || "",
                delivery_confirmed_at: new Date()
            },
            { new: true }
        );


        return NextResponse.json({ success: true, message: "Feedback submitted successfully" }, { status: 200 });

    } catch (error) {
        console.error("Error in Delivery Confirmation POST:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
