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

        // Execute all dashboard queries concurrently with lean + field selection
        const [
            orders,
            orderItems,
            transactions,
            inquiries,
            reviews,
            productsRaw,
            productOrderCounts
        ] = await Promise.all([
            Order.find()
                .select('_id status is_paid customer_id payment_method created_at is_refunded')
                .sort({ created_at: -1 })
                .limit(100)
                .lean(),
            OrderItem.find()
                .select('_id order_id product_id quantity price created_at')
                .sort({ created_at: -1 })
                .limit(200)
                .lean(),
            Transaction.find()
                .select('_id order_id customer_id amount payment_method status created_at')
                .sort({ created_at: -1 })
                .limit(100)
                .lean(),
            Inquiry.find()
                .select('_id name email phone message created_at')
                .sort({ _id: -1 })
                .limit(100)
                .lean(),
            Review.find()
                .select('_id user_id order_id rating review_message created_at')
                .sort({ rating: -1, created_at: -1 })
                .limit(100)
                .lean(),
            Product.find()
                .select('_id name price material gender category_id is_active is_deleted created_at')
                .limit(200)
                .lean(),
            OrderItem.aggregate([
                { $group: { _id: "$product_id", count: { $sum: 1 } } }
            ])
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
        }, {
            status: 200,
            headers: {
                // Serve stale dashboard data for up to 60s while revalidating in the background.
                // Eliminates repeated DB hits on every page refresh.
                'Cache-Control': 's-maxage=60, stale-while-revalidate=120',
            }
        });
    } catch (error) {
        console.error("Error Getting Dashboard Data:", error);
        return NextResponse.json({ message: "Error In Backend API Call" }, { status: 500 });
    }
}