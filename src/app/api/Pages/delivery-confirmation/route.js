import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import OrderItem from "@/lib/models/OrderItem";
import Product from "@/lib/models/Product";
import Customer from "@/lib/models/Customer";
import User from "@/lib/models/User";

// Get Order details for confirmation page
export async function GET(request) {
    try {
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

        // Fetch items in the order
        const items = await OrderItem.find({ order_id: order._id });
        const itemsWithDetails = [];

        for (const item of items) {
            const product = await Product.findById(item.product_name ? null : item.product_id); // check if product exists
            itemsWithDetails.push({
                product_name: item.product_name || product?.name || "Premium Jewelry Item",
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
        await connectDB();
        const body = await request.json();
        const { orderId, received, remarks, feedback } = body;

        if (!orderId || !/^[0-9a-fA-F]{24}$/.test(orderId)) {
            return NextResponse.json({ success: false, message: "Invalid or missing Order ID" }, { status: 400 });
        }

        if (received === undefined || received === null) {
            return NextResponse.json({ success: false, message: "Receipt confirmation is required" }, { status: 400 });
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

        if (!updatedOrder) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }

        console.log(`✅ Delivery Feedback Saved for Order #${orderId}`);
        return NextResponse.json({ success: true, message: "Feedback submitted successfully" }, { status: 200 });

    } catch (error) {
        console.error("Error in Delivery Confirmation POST:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
