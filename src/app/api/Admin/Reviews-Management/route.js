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

        const reviews = await Review.find().sort({ created_at: -1 }).limit(100).lean();

        const userIds = reviews.map(r => r.user_id).filter(Boolean);

        // Fetch users in bulk
        const users = await User.find({ _id: { $in: userIds } })
            .select('firstName lastName email phone is_active is_verified')
            .lean();
        
        const usersMap = {};
        for (const u of users) {
            usersMap[u._id.toString()] = {
                id: u._id,
                firstName: u.firstName,
                lastName: u.lastName,
                email: u.email,
                phone: u.phone,
                is_active: u.is_active,
                is_verified: u.is_verified,
                created_at: null,
                reviews: [],
            };
        }

        const orderIds = reviews.map(r => r.order_id).filter(Boolean);

        // Fetch order items in bulk
        const orderItems = await OrderItem.find({ order_id: { $in: orderIds } }).lean();

        const productIds = orderItems.map(oi => oi.product_id).filter(Boolean);

        // Fetch products in bulk
        const products = await Product.find({ _id: { $in: productIds } }).select('name').lean();
        const productsMap = {};
        for (const p of products) {
            productsMap[p._id.toString()] = p;
        }

        const orderItemsMap = {};
        for (const oi of orderItems) {
            const oid = oi.order_id.toString();
            if (!orderItemsMap[oid]) {
                orderItemsMap[oid] = [];
            }
            const product = oi.product_id ? productsMap[oi.product_id.toString()] : null;
            orderItemsMap[oid].push({
                id: product?._id || null,
                name: product?.name || null,
            });
        }

        const guestUser = {
            id: "guest",
            firstName: "Guest/Deleted",
            lastName: "User",
            email: "N/A",
            phone: "N/A",
            is_active: true,
            is_verified: false,
            created_at: null,
            reviews: [],
        };
        usersMap["guest"] = guestUser;

        for (const r of reviews) {
            const userId = r.user_id?.toString();
            const userKey = (userId && usersMap[userId]) ? userId : "guest";

            const productsList = orderItemsMap[r.order_id?.toString()] || [];
            if (productsList.length === 0) {
                usersMap[userKey].reviews.push({
                    id: r._id,
                    order_id: r.order_id,
                    rating: r.rating,
                    comment: r.review_message,
                    created_at: r.created_at,
                    product: { id: null, name: "Unknown Product" },
                });
            } else {
                for (const prod of productsList) {
                    usersMap[userKey].reviews.push({
                        id: r._id,
                        order_id: r.order_id,
                        rating: r.rating,
                        comment: r.review_message,
                        created_at: r.created_at,
                        product: prod,
                    });
                }
            }
        }

        // Clean up guest bucket if empty
        if (usersMap["guest"].reviews.length === 0) {
            delete usersMap["guest"];
        }



        return NextResponse.json({
            success: true,
            data: Object.values(usersMap)
        }, { status: 200 });
    } catch (error) {
        console.error("Error Getting Reviews Data:", error);
        return NextResponse.json({ message: "Error In Backend API Call" }, { status: 500 });
    }
}

//Edit Reviews
export async function PUT(req) {
    const auth = await verifyAdminFromRequest(req);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        await connectDB();
        const { id, rating, review_message } = await req.json();

        if (!id) {
            return NextResponse.json({ success: false, message: "Review ID is required" }, { status: 400 });
        }

        const updateFields = {};
        if (rating !== undefined) updateFields.rating = rating;
        if (review_message !== undefined) updateFields.review_message = review_message;

        const result = await Review.updateOne({ _id: id }, updateFields);
        if (result.matchedCount === 0) {
            return NextResponse.json({ success: false, message: "Review not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Review updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error Editing Reviews:", error);
        return NextResponse.json({ message: "Error In Backend API Call" }, { status: 500 });
    }
}