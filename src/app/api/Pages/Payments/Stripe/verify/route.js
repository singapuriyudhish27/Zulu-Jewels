import { NextResponse } from "next/server";
import Stripe from "stripe";
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

        const { paymentIntentId } = await req.json();
        if (!paymentIntentId) {
            return NextResponse.json({ message: "Missing paymentIntentId" }, { status: 400 });
        }

        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ message: "Stripe is not configured on the server." }, { status: 500 });
        }

        await connectDB();
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        // 1. Server-side retrieve payment intent from Stripe API directly
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status !== "succeeded") {
            return NextResponse.json({ message: "Payment has not succeeded" }, { status: 400 });
        }

        const { userId, specificItem: specificItemStr, checkout_id } = paymentIntent.metadata || {};

        // 2. Security: Verify that the payment intent belongs to the logged-in user
        if (userId && userId !== user.userId) {
            return NextResponse.json({ message: "Payment intent user mismatch" }, { status: 403 });
        }

        // 3. Server-authoritative CheckoutSession verification (amount & currency match)
        if (checkout_id) {
            const checkoutSession = await CheckoutSession.findOne({ checkout_id }).lean();
            if (checkoutSession) {
                if (paymentIntent.amount !== checkoutSession.pricing.total_paise) {
                    console.error(`[Stripe Verify] Amount mismatch: received ${paymentIntent.amount}, expected ${checkoutSession.pricing.total_paise}`);
                    return NextResponse.json({ message: "Payment amount mismatch with checkout session" }, { status: 400 });
                }
                if (paymentIntent.currency.toUpperCase() !== checkoutSession.pricing.currency.toUpperCase()) {
                    console.error(`[Stripe Verify] Currency mismatch: received ${paymentIntent.currency}, expected ${checkoutSession.pricing.currency}`);
                    return NextResponse.json({ message: "Payment currency mismatch with checkout session" }, { status: 400 });
                }
            }
        }

        let specificItem = null;
        if (specificItemStr && specificItemStr !== "null") {
            try {
                specificItem = JSON.parse(specificItemStr);
            } catch (_) {}
        }

        const receipt_url = paymentIntent.charges?.data?.[0]?.receipt_url || `https://dashboard.stripe.com/payments/${paymentIntent.id}`;
        
        // 4. Process order creation through crash-safe state machine
        const result = await processOrderSuccess(user.userId, {
            provider: "stripe",
            payment_method: "Stripe",
            payment_id: paymentIntent.id,
            checkout_id: checkout_id || null,
            receipt_url,
            specificItem,
            amount_paise: paymentIntent.amount,
            currency: paymentIntent.currency.toUpperCase()
        });

        return NextResponse.json({ success: true, orderId: result.orderId }, { status: 200 });

    } catch (error) {
        console.error("Error Verifying Stripe Payment:", error);
        return NextResponse.json({ message: error.message || "Order creation failed" }, { status: 500 });
    }
}
