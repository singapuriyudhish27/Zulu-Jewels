import { NextResponse } from "next/server";
import Stripe from "stripe";
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

        const { paymentIntentId } = await req.json();
        if (!paymentIntentId) {
            return NextResponse.json({ message: "Missing paymentIntentId" }, { status: 400 });
        }

        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ message: "Stripe is not configured on the server." }, { status: 500 });
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        // Retrieve payment intent from Stripe to check status and metadata
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status !== "succeeded") {
            return NextResponse.json({ message: "Payment has not succeeded" }, { status: 400 });
        }

        const { userId, specificItem: specificItemStr } = paymentIntent.metadata;

        // Verify that the payment intent belongs to the logged-in user
        if (userId !== user.userId) {
            return NextResponse.json({ message: "Payment intent user mismatch" }, { status: 403 });
        }

        let specificItem = null;
        if (specificItemStr && specificItemStr !== "null") {
            specificItem = JSON.parse(specificItemStr);
        }

        // Process order creation (with duplicate prevention inside orderUtils)
        const receipt_url = paymentIntent.charges?.data?.[0]?.receipt_url || `https://dashboard.stripe.com/payments/${paymentIntent.id}`;
        
        const result = await processOrderSuccess(userId, {
            payment_method: "Stripe",
            receipt_url,
            specificItem
        });

        return NextResponse.json({ success: true, orderId: result.orderId }, { status: 200 });

    } catch (error) {
        console.error("Error Verifying Stripe Payment:", error);
        return NextResponse.json({ message: "Error In Backend API Route (Order creation failed)" }, { status: 500 });
    }
}
