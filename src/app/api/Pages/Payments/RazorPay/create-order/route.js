import Razorpay from "razorpay";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { calculateOrderPricing } from "@/lib/pricing";
import CheckoutSession from "@/lib/models/CheckoutSession";

const ALLOWED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD', 'JPY', 'CHF', 'NZD', 'MYR', 'HKD', 'ZAR', 'SAR', 'THB'];

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

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return NextResponse.json({ error: "RazorPay is not configured on the server." }, { status: 500 });
        }

        const { 
            checkoutId: clientCheckoutId,
            currency = "INR", 
            receipt, 
            specificItem, 
            totalPayable, 
            promoCode,
            shippingAddress = ""
        } = await req.json();

        const safeCurrency = ALLOWED_CURRENCIES.includes((currency || '').toUpperCase())
            ? currency.toUpperCase()
            : 'INR';

        await connectDB();
        const razorPay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const checkout_id = clientCheckoutId || receipt || `chk_${crypto.randomUUID()}`;

        // 1. Check for existing active CheckoutSession (Idempotency)
        let session = await CheckoutSession.findOne({ checkout_id, user_id: user.userId });
        if (session && session.status === 'OPEN' && session.provider_order_id && session.provider === 'razorpay') {
            try {
                const existingOrder = await razorPay.orders.fetch(session.provider_order_id);
                if (existingOrder && existingOrder.status === 'created') {
                    return NextResponse.json({
                        ...existingOrder,
                        checkoutId: checkout_id,
                    }, { status: 200 });
                }
            } catch (fetchErr) {
                console.warn("[Razorpay create-order] Could not fetch existing order:", fetchErr.message);
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
                provider: 'razorpay',
                status: 'OPEN',
                expires_at
            });
        }

        // 4. Create Razorpay Order
        const options = {
            amount: total_paise, // integer paise
            currency: safeCurrency,
            receipt: checkout_id.slice(-40), // Razorpay receipt max 40 chars
            notes: {
                checkout_id,
                userId: user.userId,
                specificItem: pricing.verifiedSpecificItem ? JSON.stringify(pricing.verifiedSpecificItem) : null
            }
        };

        const order = await razorPay.orders.create(options);

        session.provider_order_id = order.id;
        session.provider = 'razorpay';
        await session.save();

        return NextResponse.json({
            ...order,
            checkoutId: checkout_id,
        }, { status: 200 });

    } catch (error) {
        console.error("Error Paying With RazorPay:", error);
        return NextResponse.json({ message: "Error In Backend API Route" }, { status: 500 });
    }
}