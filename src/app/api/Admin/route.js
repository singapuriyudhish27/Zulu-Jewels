import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import OrderItem from "@/lib/models/OrderItem";
import Transaction from "@/lib/models/Transaction";
import Product from "@/lib/models/Product";
import Inquiry from "@/lib/models/Inquiry";
import Review from "@/lib/models/Review";

import { verifyAdminFromRequest } from "@/lib/adminAuth";

//Get The Dashboard Data
export async function GET(req) {
    const auth = await verifyAdminFromRequest(req);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }

    try {
        await connectDB();

        // Database Collections (limit query results to avoid memory exhaustion)
        const orders = await Order.find().sort({ created_at: -1 }).limit(100);
        const orderItems = await OrderItem.find().sort({ created_at: -1 }).limit(200);
        const transactions = await Transaction.find().sort({ created_at: -1 }).limit(100);
        const inquiries = await Inquiry.find().sort({ _id: -1 }).limit(100);
        const reviews = await Review.find().sort({ rating: -1, created_at: -1 }).limit(100);

        // Calculate product order counts
        const productsRaw = await Product.find().limit(200);
        
        // Count how many order items reference each product
        // Using aggregation for better performance
        const productOrderCounts = await OrderItem.aggregate([
            { $group: { _id: "$product_id", count: { $sum: 1 } } }
        ]);
        
        const countMap = {};
        for (const count of productOrderCounts) {
            countMap[count._id.toString()] = count.count;
        }

        const products = productsRaw.map(p => ({
            _id: p._id,
            id: p._id, // For backward compatibility
            name: p.name,
            description: p.description,
            price: p.price,
            material: p.material,
            gender: p.gender,
            category_id: p.category_id,
            is_active: p.is_active,
            is_deleted: p.is_deleted,
            created_at: p.created_at,
            order_count: countMap[p._id.toString()] || 0
        })).sort((a, b) => b.order_count - a.order_count);


        return NextResponse.json({
            success: true,
            data: {
                orders,
                order_items: orderItems,
                products,
                transactions,
                inquiries,
                reviews,
            }
        }, { status: 200, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } });
    } catch (error) {
        console.error("Error Getting Dashboard Data:", error);
        return NextResponse.json({ message: "Error In Backend API Call" }, { status: 500 });
    }
}