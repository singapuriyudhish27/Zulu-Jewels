import { NextResponse } from "next/server";
import Stripe from "stripe";
import { processOrderSuccess } from "@/lib/orderUtils";

export async function POST(req) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    console.error("[Stripe Webhook] STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET is not configured.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const stripe = new Stripe(secretKey);
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Stripe Webhook Signature Verification Failed:", err.message);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  // Handle the event
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    
    // Extract metadata we attached in create-intent
    const { userId, specificItem: specificItemStr } = paymentIntent.metadata;

    if (userId) {
        try {
            // Parse specificItem if it exists
            let specificItem = null;
            if (specificItemStr && specificItemStr !== "null") {
                specificItem = JSON.parse(specificItemStr);
            }

            await processOrderSuccess(userId, {
                payment_method: "Stripe",
                receipt_url: paymentIntent.charges?.data?.[0]?.receipt_url || `https://dashboard.stripe.com/payments/${paymentIntent.id}`,
                specificItem
            });
        } catch (error) {
            console.error("❌ Failed to process order in Stripe Webhook:", error);
            // We return a 200 even on processing failure to stop Stripe from retrying infinitely,
            // as the payment itself was successful.
        }
    } else {
        console.warn("⚠️ Stripe Webhook: Received successful payment but no userId was found in metadata.");
    }
  }

  return NextResponse.json({ received: true });
}
