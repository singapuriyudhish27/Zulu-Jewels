import { NextResponse } from "next/server";
import Stripe from "stripe";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { calculateOrderPricing } from "@/lib/pricing";

const ALLOWED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD', 'JPY', 'CHF', 'NZD', 'MYR', 'HKD', 'ZAR', 'SAR', 'THB'];

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
        return NextResponse.json({ error: "Unauthorized: Please login first." }, { status: 401 });
    }

    const { currency = "INR", specificItem, totalPayable, promoCode } = await req.json();
    const safeCurrency = ALLOWED_CURRENCIES.includes((currency || '').toUpperCase())
        ? currency.toUpperCase()
        : 'INR';

    // Calculate server-authoritative order pricing (subtotal, promo, GST, shipping)
    let pricing;
    try {
        pricing = await calculateOrderPricing({
            userId: user.userId,
            specificItem,
            promoCode
        });
    } catch (calcError) {
        return NextResponse.json(
            { error: calcError.message || "Failed to calculate order pricing" },
            { status: 400 }
        );
    }

    const finalAmount = pricing.total;

    // If client passed totalPayable, verify it is not significantly less than authoritative amount
    if (totalPayable !== undefined && totalPayable !== null) {
        const payableNum = Number(totalPayable);
        const minAcceptable = specificItem ? Math.floor(pricing.subtotal) : Math.floor(finalAmount);
        if (isNaN(payableNum) || payableNum < minAcceptable) {
            return NextResponse.json(
                { error: "Invalid payment amount" },
                { status: 400 }
            );
        }
    }

    if (finalAmount <= 0) {
        return NextResponse.json({ error: "Invalid payment amount calculated" }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json({ error: "Stripe is not configured on the server." }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalAmount * 100),
      currency: safeCurrency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: user.userId,
        specificItem: pricing.verifiedSpecificItem ? JSON.stringify(pricing.verifiedSpecificItem) : null
      }
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret, amount: finalAmount });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: "Payment service temporarily unavailable. Please try again." }, { status: 500 });
  }
}
