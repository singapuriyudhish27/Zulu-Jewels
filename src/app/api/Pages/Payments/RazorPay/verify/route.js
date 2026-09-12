import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { processOrderSuccess } from "@/lib/orderUtils";
import CheckoutSession from "@/lib/models/CheckoutSession";

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

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, specificItem, checkoutId } = await req.json();

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ message: "Missing required Razorpay payment credentials" }, { status: 400 });
        }

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return NextResponse.json({ message: "Razorpay is not configured on the server" }, { status: 500 });
        }

        // 1. Verify Razorpay HMAC signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            console.error("[Razorpay Verify] Invalid signature for payment:", razorpay_payment_id);
            return NextResponse.json({ message: "Invalid payment signature" }, { status: 400 });
        }

        await connectDB();
        const razorPay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // 2. Fetch payment from Razorpay API to verify status and amount server-side
        const payment = await razorPay.payments.fetch(razorpay_payment_id);

        // Security: Require 'captured' state (do NOT fulfill merely on 'authorized')
        if (payment.status !== 'captured') {
            console.error(`[Razorpay Verify] Payment status not captured: ${payment.status}`);
            return NextResponse.json({ message: `Payment not captured. Current status: ${payment.status}` }, { status: 400 });
        }

        // 3. Verify order linkage
        if (payment.order_id !== razorpay_order_id) {
            console.error(`[Razorpay Verify] Order ID mismatch: ${payment.order_id} vs ${razorpay_order_id}`);
            return NextResponse.json({ message: "Order ID mismatch" }, { status: 400 });
        }

        // 4. Verify against immutable CheckoutSession
        const sessionQuery = [];
        if (checkoutId) sessionQuery.push({ checkout_id: checkoutId });
        sessionQuery.push({ provider_order_id: razorpay_order_id });

        const checkoutSession = await CheckoutSession.findOne({ $or: sessionQuery }).lean();
        if (checkoutSession) {
            if (payment.amount !== checkoutSession.pricing.total_paise) {
                console.error(`[Razorpay Verify] Amount mismatch: received ${payment.amount}, expected ${checkoutSession.pricing.total_paise}`);
                return NextResponse.json({ message: "Payment amount mismatch with checkout session" }, { status: 400 });
            }
            if (payment.currency.toUpperCase() !== checkoutSession.pricing.currency.toUpperCase()) {
                console.error(`[Razorpay Verify] Currency mismatch: received ${payment.currency}, expected ${checkoutSession.pricing.currency}`);
                return NextResponse.json({ message: "Payment currency mismatch with checkout session" }, { status: 400 });
            }
        }

        const receipt_url = `https://dashboard.razorpay.com/app/payments/${razorpay_payment_id}`;

        // 5. Process order in durable state machine
        const result = await processOrderSuccess(user.userId, {
            provider: "razorpay",
            payment_method: "RazorPay",
            payment_id: razorpay_payment_id,
            checkout_id: checkoutSession?.checkout_id || checkoutId || null,
            receipt_url,
            specificItem,
            amount_paise: payment.amount,
            currency: payment.currency.toUpperCase()
        });

        return NextResponse.json({ success: true, orderId: result.orderId }, { status: 200 });

    } catch (error) {
        console.error("Error Verifying RazorPay Payment:", error);
        return NextResponse.json({ message: error.message || "Order creation failed" }, { status: 500 });
    }
}