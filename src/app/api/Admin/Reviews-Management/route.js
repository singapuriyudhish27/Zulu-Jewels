import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Review from "@/lib/models/Review";
import User from "@/lib/models/User";
import OrderItem from "@/lib/models/OrderItem";
import Product from "@/lib/models/Product";
import { verifyAdminFromRequest } from "@/lib/adminAuth";

//Get The Reviews Data
export async function GET(req) {
    const auth = await verifyAdminFromRequest(req);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        await connectDB();

        const reviews = await Review.find().sort({ created_at: -1 });

        //Group Reviews Under Each User
        const usersMap = {};

        for (const r of reviews) {
            const userId = r.user_id?.toString();
            if (!userId) continue;

            if (!usersMap[userId]) {
                const user = await User.findById(userId).select('firstName lastName email phone is_active is_verified');
                usersMap[userId] = {
                    id: user?._id || null,
                    firstName: user?.firstName || null,
                    lastName: user?.lastName || null,
                    email: user?.email || null,
                    phone: user?.phone || null,
                    is_active: user?.is_active ?? null,
                    is_verified: user?.is_verified ?? null,
                    created_at: null,
                    reviews: [],
                };
            }

            // Find products linked to this order
            const orderItems = await OrderItem.find({ order_id: r.order_id });
            for (const oi of orderItems) {
                const product = await Product.findById(oi.product_id);

                usersMap[userId].reviews.push({
                    id: r._id,
                    order_id: r.order_id,
                    rating: r.rating,
                    comment: r.review_message,
                    created_at: r.created_at,
                    product: {
                        id: product?._id || null,
                        name: product?.name || null,
                    },
                });
            }
        }
        console.log("Backend API To Get Users & Reviews.");

        return NextResponse.json({
            success: true,
            data: Object.values(usersMap),
            adminEmail: process.env.SMTP_USER
        }, { status: 200 });
    } catch (error) {
        console.error("Error Getting Reviews Data:", error);
        return NextResponse.json({ message: "Error In Backend API Call" });
    }
}

//Edit Reviews
export async function PUT(req) {
    const auth = await verifyAdminFromRequest(req);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {

    } catch (error) {
        console.error("Error Editing Reviews:", error);
        return NextResponse.json({ message: "Error In Backend API Call" });
    }
}