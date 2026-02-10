import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto.
        createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return NextResponse.json({message: "No Signature By RazorPay"}, { status: 400 });
        }

        //Store The Order In Database

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error Verifying PazorPay Payment:", error);
        return NextResponse.json({message: "Error In Backend API Route"}, { status: 500 });
    }
}