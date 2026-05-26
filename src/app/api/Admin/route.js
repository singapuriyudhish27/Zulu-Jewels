import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import OrderItem from "@/lib/models/OrderItem";
import Transaction from "@/lib/models/Transaction";
import Product from "@/lib/models/Product";
import Inquiry from "@/lib/models/Inquiry";
import Review from "@/lib/models/Review";

//Get The Dashboard Data
export async function GET() {
    try {
        await connectDB();

        // Database Collections
        const orders = await Order.find().sort({ created_at: -1 });
        const orderItems = await OrderItem.find().sort({ created_at: -1 });
        const transactions = await Transaction.find().sort({ created_at: -1 });
        const inquiries = await Inquiry.find().sort({ _id: -1 });
        const reviews = await Review.find().sort({ rating: -1, created_at: -1 });

        // Calculate product order counts
        const productsRaw = await Product.find();
        
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

        console.log("Backend API To Get Orders, Inquiries, Reviews, Products & Transactions.");
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
        }, { status: 200 });
    } catch (error) {
        console.error("Error Getting Dashboard Data:", error);
        return NextResponse.json({ message: "Error In Backend API Call" });
    }
}