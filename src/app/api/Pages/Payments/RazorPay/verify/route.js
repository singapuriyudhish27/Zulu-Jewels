import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { processOrderSuccess } from "@/lib/orderUtils";

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

export async function POST(req) {
    try {
        const user = await getUserFromCookie();
        if (!user) {
            return NextResponse.json({ message: "Unauthorized. Please login first." }, { status: 401 });
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, specificItem } = await req.json();

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto.
        createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return NextResponse.json({message: "No Signature By RazorPay"}, { status: 400 });
        }

        // Process the order in the database
        await processOrderSuccess(user.userId, {
            payment_method: "RazorPay",
            receipt_url: `https://dashboard.razorpay.com/app/payments/${razorpay_payment_id}`,
            specificItem: specificItem || null
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error Verifying RazorPay Payment:", error);
        return NextResponse.json({message: "Error In Backend API Route (Order creation failed)"}, { status: 500 });
    }
}