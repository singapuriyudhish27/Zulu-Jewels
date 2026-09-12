import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { processOrderSuccess } from "@/lib/orderUtils";
import WebhookEvent from "@/lib/models/WebhookEvent";

export async function POST(req) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error("[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET is not configured");
        return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
        return NextResponse.json({ error: "Missing signature header" }, { status: 400 });
    }

    // 1. Verify Razorpay webhook signature
    const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");

    if (expectedSignature !== signature) {
        console.error("[Razorpay Webhook] Signature verification failed");
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    let payload;
    try {
        payload = JSON.parse(body);
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const eventId = payload.event_id || payload.payload?.payment?.entity?.id || `rzp_evt_${Date.now()}`;
    const eventType = payload.event;

    await connectDB();

    // 2. Durable Webhook Deduplication via WebhookEvent
    try {
        const existingEvent = await WebhookEvent.findOne({ provider: 'razorpay', event_id: eventId }).lean();
        if (existingEvent && (existingEvent.processing_status === 'PROCESSED' || existingEvent.processing_status === 'PROCESSING')) {
            console.log(`[Razorpay Webhook] Duplicate event ${eventId} already handled. Acknowledging.`);
            return NextResponse.json({ status: "ok" });
        }

        await WebhookEvent.findOneAndUpdate(
            { provider: 'razorpay', event_id: eventId },
            {
                $setOnInsert: {
                    provider: 'razorpay',
                    event_id: eventId,
                    event_type: eventType,
                    processing_status: 'PROCESSING'
                }
            },
            { upsert: true }
        );
    } catch (dupErr) {
        if (dupErr.code === 11000) {
            console.log(`[Razorpay Webhook] Concurrent duplicate event ${eventId}. Acknowledging.`);
            return NextResponse.json({ status: "ok" });
        }
    }

    // 3. Process 'payment.captured' or 'order.paid'
    if (eventType === "payment.captured" || eventType === "order.paid") {
        const payment = payload.payload?.payment?.entity;
        if (payment && payment.status === 'captured') {
            const userId = payment.notes?.userId;
            const checkoutId = payment.notes?.checkout_id;

            if (userId) {
                try {
                    await processOrderSuccess(userId, {
                        provider: "razorpay",
                        payment_method: "RazorPay",
                        payment_id: payment.id,
                        checkout_id: checkoutId || null,
                        receipt_url: `https://dashboard.razorpay.com/app/payments/${payment.id}`,
                        amount_paise: payment.amount,
                        currency: payment.currency.toUpperCase()
                    });

                    await WebhookEvent.updateOne(
                        { provider: 'razorpay', event_id: eventId },
                        { $set: { processing_status: 'PROCESSED', processed_at: new Date(), last_error: null } }
                    );
                } catch (procErr) {
                    console.error("[Razorpay Webhook] Order fulfillment error:", procErr.message);
                    await WebhookEvent.updateOne(
                        { provider: 'razorpay', event_id: eventId },
                        { $set: { processing_status: 'FAILED', last_error: procErr.message } }
                    );
                }
            } else {
                console.warn("[Razorpay Webhook] Received captured payment without userId in notes");
            }
        }
    }

    return NextResponse.json({ status: "ok" });
}
