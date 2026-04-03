import { NextResponse } from "next/server";
import Stripe from "stripe";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

    const { amount, currency = "INR", specificItem } = await req.json();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: user.userId,
        // specificItem only accepts string values, so we stringify it
        specificItem: specificItem ? JSON.stringify(specificItem) : null
      }
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
