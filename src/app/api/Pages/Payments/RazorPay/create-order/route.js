import Razorpay from "razorpay";
import { NextResponse } from "next/server";

const razorPay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
    try {
        const { amount, currency = "INR", receipt } = await req.json();

        const options = {
            amount: amount * 100,
            currency,
            receipt: receipt || `rcpt_${Date.now()}`,
        };

        const order = await razorPay.orders.create(options);

        return NextResponse.json(order, { status: 200 });
    } catch (error) {
        console.error("Error Paying With RazorPay:", error);
        return NextResponse.json({messge: "Error In Backend API Route"}, { status: 500 });
    }
}