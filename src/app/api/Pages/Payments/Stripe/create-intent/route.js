import { NextResponse } from "next/server";
import Stripe from "stripe";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import ProductVariant from "@/lib/models/ProductVariant";
import CartItem from "@/lib/models/CartItem";

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

    const { currency = "INR", specificItem } = await req.json();

    await connectDB();

    let finalAmount = 0;
    let verifiedSpecificItem = null;

    if (specificItem) {
        // Calculate amount for single item
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
        
        // Override price in specificItem for metadata to ensure orderUtils writes correct price
        verifiedSpecificItem = {
            ...specificItem,
            price: unitPrice
        };
    } else {
        // Calculate amount for whole cart
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

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalAmount * 100),
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: user.userId,
        specificItem: verifiedSpecificItem ? JSON.stringify(verifiedSpecificItem) : null
      }
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
