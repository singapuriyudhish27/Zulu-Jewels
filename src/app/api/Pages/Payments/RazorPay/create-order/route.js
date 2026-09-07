import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { calculateOrderPricing } from "@/lib/pricing";

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

        const { currency = "INR", receipt, specificItem, totalPayable, promoCode } = await req.json();
        const safeCurrency = ALLOWED_CURRENCIES.includes((currency || '').toUpperCase())
            ? currency.toUpperCase()
            : 'INR';

        // Calculate server-authoritative order pricing
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

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return NextResponse.json({ error: "RazorPay is not configured on the server." }, { status: 500 });
        }

        const razorPay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: Math.round(finalAmount * 100),
            currency: safeCurrency,
            receipt: receipt || `rcpt_${Date.now()}`,
            notes: {
                userId: user.userId,
                specificItem: pricing.verifiedSpecificItem ? JSON.stringify(pricing.verifiedSpecificItem) : null
            }
        };

        const order = await razorPay.orders.create(options);

        return NextResponse.json(order, { status: 200 });
    } catch (error) {
        console.error("Error Paying With RazorPay:", error);
        return NextResponse.json({ message: "Error In Backend API Route" }, { status: 500 });
    }
}