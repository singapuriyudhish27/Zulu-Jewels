import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/db";
import { processOrderSuccess } from "@/lib/orderUtils";
import WebhookEvent from "@/lib/models/WebhookEvent";

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
      webhookSecret
    );
  } catch (err) {
    console.error("Stripe Webhook Signature Verification Failed:", err.message);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  await connectDB();

  // 1. Durable Webhook Deduplication via WebhookEvent (compound unique index: provider + event_id)
  let existingEvent;
  try {
    existingEvent = await WebhookEvent.findOne({ provider: 'stripe', event_id: event.id }).lean();
    if (existingEvent && (existingEvent.processing_status === 'PROCESSED' || existingEvent.processing_status === 'PROCESSING')) {
      console.log(`[Stripe Webhook] Duplicate event ${event.id} already received. Acknowledging immediately.`);
      return NextResponse.json({ received: true });
    }

    await WebhookEvent.findOneAndUpdate(
      { provider: 'stripe', event_id: event.id },
      {
        $setOnInsert: {
          provider: 'stripe',
          event_id: event.id,
          event_type: event.type,
          processing_status: 'PROCESSING'
        }
      },
      { upsert: true }
    );
  } catch (dupErr) {
    if (dupErr.code === 11000) {
      console.log(`[Stripe Webhook] Caught concurrent event ${event.id}. Acknowledging.`);
      return NextResponse.json({ received: true });
    }
  }

  // 2. Handle payment_intent.succeeded
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const { userId, specificItem: specificItemStr, checkout_id } = paymentIntent.metadata || {};

    if (userId) {
      try {
        let specificItem = null;
        if (specificItemStr && specificItemStr !== "null") {
          try {
            specificItem = JSON.parse(specificItemStr);
          } catch (_) {}
        }

        const receipt_url = paymentIntent.charges?.data?.[0]?.receipt_url || `https://dashboard.stripe.com/payments/${paymentIntent.id}`;

        await processOrderSuccess(userId, {
          provider: "stripe",
          payment_method: "Stripe",
          payment_id: paymentIntent.id,
          checkout_id: checkout_id || null,
          receipt_url,
          specificItem,
          amount_paise: paymentIntent.amount,
          currency: paymentIntent.currency.toUpperCase()
        });

        await WebhookEvent.updateOne(
          { provider: 'stripe', event_id: event.id },
          { $set: { processing_status: 'PROCESSED', processed_at: new Date(), last_error: null } }
        );

      } catch (error) {
        console.error("❌ Failed to process order in Stripe Webhook:", error.message);
        await WebhookEvent.updateOne(
          { provider: 'stripe', event_id: event.id },
          { $set: { processing_status: 'FAILED', last_error: error.message } }
        );
      }
    } else {
      console.warn("⚠️ Stripe Webhook: Received payment without userId in metadata.");
      await WebhookEvent.updateOne(
        { provider: 'stripe', event_id: event.id },
        { $set: { processing_status: 'IGNORED', last_error: 'Missing userId in metadata' } }
      );
    }
  }

  return NextResponse.json({ received: true });
}
