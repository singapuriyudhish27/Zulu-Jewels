import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import ProductVariant from "@/lib/models/ProductVariant";
import CartItem from "@/lib/models/CartItem";

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

        const { currency = "INR", receipt, specificItem, totalPayable } = await req.json();
        console.log("Specific Item:", specificItem);
        console.log("Total Payable*:", totalPayable);
        const safeCurrency = ALLOWED_CURRENCIES.includes((currency || '').toUpperCase())
            ? currency.toUpperCase()
            : 'INR';

        await connectDB();

        let finalAmount = Number(totalPayable);

        if (specificItem) {
            let unitPrice = 0;
            if (specificItem.variantId) {
                const variant = await ProductVariant.findById(specificItem.variantId);
                unitPrice = variant ? variant.price : 0;
            }
            if (!unitPrice) {
                const product = await Product.findById(specificItem.productId);
                unitPrice = product ? product.price : 0;
            }
            if (finalAmount < unitPrice) {
                return NextResponse.json(
                    { error: "Invalid payment amount" },
                    { status: 400 }
                );
            }
            const subtotal = unitPrice * (specificItem.quantity || 1);
            const gst = subtotal * 0.03;
            const shipping = 0;
            finalAmount = subtotal + gst + shipping;
        } else {
            const cartItems = await CartItem.find({ user_id: user.userId });
            let totalCartAmount = 0;
            for (const item of cartItems) {
                let unitPrice = 0;
                if (item.variant_id) {
                    const variant = await ProductVariant.findById(item.variant_id);
                    unitPrice = variant ? variant.price : 0;
                }
                if (!unitPrice) {
                    const product = await Product.findById(item.product_id);
                    unitPrice = product ? product.price : 0;
                }
                const subtotal = unitPrice * item.quantity;
                const gst = subtotal * 0.03;
                totalCartAmount += subtotal + gst;
            }
            if (finalAmount < totalCartAmount) {
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
        };

        const order = await razorPay.orders.create(options);

        return NextResponse.json(order, { status: 200 });
    } catch (error) {
        console.error("Error Paying With RazorPay:", error);
        return NextResponse.json({ message: "Error In Backend API Route" }, { status: 500 });
    }
}