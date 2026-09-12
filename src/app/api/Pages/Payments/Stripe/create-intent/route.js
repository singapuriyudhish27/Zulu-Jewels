import { NextResponse } from "next/server";
import Stripe from "stripe";
import crypto from "crypto";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { calculateOrderPricing } from "@/lib/pricing";
import CheckoutSession from "@/lib/models/CheckoutSession";

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

    if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json({ error: "Stripe is not configured on the server." }, { status: 500 });
    }

    const { 
        checkoutId: clientCheckoutId, 
        currency = "INR", 
        specificItem, 
        totalPayable, 
        promoCode,
        shippingAddress = ""
    } = await req.json();

    const safeCurrency = ALLOWED_CURRENCIES.includes((currency || '').toUpperCase())
        ? currency.toUpperCase()
        : 'INR';

    await connectDB();
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const checkout_id = clientCheckoutId || `chk_${crypto.randomUUID()}`;

    // 1. Check for existing active CheckoutSession (Idempotency)
    let session = await CheckoutSession.findOne({ checkout_id, user_id: user.userId });
    if (session && session.status === 'OPEN' && session.provider_order_id && session.provider === 'stripe') {
        try {
            const existingIntent = await stripe.paymentIntents.retrieve(session.provider_order_id);
            if (existingIntent && existingIntent.status !== 'canceled') {
                return NextResponse.json({
                    checkoutId: checkout_id,
                    clientSecret: existingIntent.client_secret,
                    amount: session.pricing.total_paise / 100
                });
            }
        } catch (retrieveErr) {
            console.warn("[Stripe create-intent] Could not retrieve existing intent, generating new:", retrieveErr.message);
        }
    }

    // 2. Calculate server-authoritative order pricing (in integer paise)
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

    const total_paise = pricing.total_paise;
    if (total_paise <= 0) {
        return NextResponse.json({ error: "Invalid payment amount calculated" }, { status: 400 });
    }

    // Client sanity check
    if (totalPayable !== undefined && totalPayable !== null) {
        const payablePaise = Math.round(Number(totalPayable) * 100);
        const minAcceptablePaise = specificItem ? pricing.subtotal_paise : pricing.total_paise;
        if (isNaN(payablePaise) || payablePaise < minAcceptablePaise) {
            return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });
        }
    }

    // 3. Persist Immutable CheckoutSession Snapshot
    const expires_at = new Date(Date.now() + 60 * 60 * 1000); // 1 hour TTL
    const checkoutItems = pricing.items.map(it => ({
        product_id: it.product_id,
        variant_id: it.variant_id || null,
        quantity: it.quantity,
        unit_price_paise: it.unit_price_paise,
        item_total_paise: it.item_total_paise
    }));

    if (!session) {
        session = await CheckoutSession.create({
            checkout_id,
            user_id: user.userId,
            items: checkoutItems,
            pricing: {
                subtotal_paise: pricing.subtotal_paise,
                discount_paise: pricing.discount_paise,
                tax_paise: pricing.tax_paise,
                shipping_paise: pricing.shipping_paise,
                total_paise: pricing.total_paise,
                promo_code: promoCode || null,
                currency: safeCurrency
            },
            shipping_address: shippingAddress,
            provider: 'stripe',
            status: 'OPEN',
            expires_at
        });
    }

    // 4. Create Stripe PaymentIntent with Stripe native idempotency key
    const paymentIntent = await stripe.paymentIntents.create({
        amount: total_paise,
        currency: safeCurrency.toLowerCase(),
        automatic_payment_methods: { enabled: true },
        metadata: {
            checkout_id,
            userId: user.userId,
            specificItem: pricing.verifiedSpecificItem ? JSON.stringify(pricing.verifiedSpecificItem) : null
        }
    }, {
        idempotencyKey: `pi_${checkout_id}`
    });

    // Link provider order ID to CheckoutSession
    session.provider_order_id = paymentIntent.id;
    await session.save();

    return NextResponse.json({
        checkoutId: checkout_id,
        clientSecret: paymentIntent.client_secret,
        amount: pricing.total
    });

  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: "Payment service temporarily unavailable. Please try again." }, { status: 500 });
  }
}
