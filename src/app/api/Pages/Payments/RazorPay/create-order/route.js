import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import ProductVariant from "@/lib/models/ProductVariant";
import CartItem from "@/lib/models/CartItem";

const razorPay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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

        const { currency = "INR", receipt, specificItem } = await req.json();

        await connectDB();

        let finalAmount = 0;

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
            finalAmount = unitPrice * (specificItem.quantity || 1);
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
                totalCartAmount += unitPrice * item.quantity;
            }
            finalAmount = totalCartAmount;
        }

        if (finalAmount <= 0) {
            return NextResponse.json({ error: "Invalid payment amount calculated" }, { status: 400 });
        }

        // Razorpay expects amount in paise (multiply by 100)
        const options = {
            amount: Math.round(finalAmount * 100),
            currency,
            receipt: receipt || `rcpt_${Date.now()}`,
        };

        const order = await razorPay.orders.create(options);

        return NextResponse.json(order, { status: 200 });
    } catch (error) {
        console.error("Error Paying With RazorPay:", error);
        return NextResponse.json({ message: "Error In Backend API Route" }, { status: 500 });
    }
}