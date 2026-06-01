import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Coupon from "@/lib/models/Coupon";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

async function getUserFromCookie() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("zulu_jewels")?.value;
        if (!token) return null;
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return null;
    }
}

/**
 * POST /api/Pages/cart/Calculate
 * Validates a coupon code and calculates the verified discount.
 * Body: { coupon_code: string, cart_total: number }
 * Response: { valid: boolean, discount_amount: number, final_total: number, message: string }
 */
export async function POST(req) {
    try {
        const user = await getUserFromCookie();
        if (!user) {
            return NextResponse.json(
                { valid: false, message: "Unauthorized: Please login first." },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { coupon_code, cart_total } = body;

        if (!coupon_code || typeof cart_total !== "number" || cart_total <= 0) {
            return NextResponse.json(
                { valid: false, message: "coupon_code and a valid cart_total are required." },
                { status: 400 }
            );
        }

        await connectDB();

        // Fetch the coupon (case-insensitive)
        const coupon = await Coupon.findOne({
            coupon_code: { $regex: new RegExp(`^${coupon_code.trim()}$`, "i") },
            is_active: true,
        }).lean();

        if (!coupon) {
            return NextResponse.json(
                { valid: false, message: "Invalid or inactive coupon code." },
                { status: 400 }
            );
        }

        // Check expiry
        if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
            return NextResponse.json(
                { valid: false, message: "This coupon has expired." },
                { status: 400 }
            );
        }

        // Check minimum order amount
        if (coupon.min_order_amount && cart_total < coupon.min_order_amount) {
            return NextResponse.json(
                {
                    valid: false,
                    message: `A minimum order of ${coupon.min_order_amount} is required to use this coupon.`,
                },
                { status: 400 }
            );
        }

        // Calculate discount
        let discount_amount = 0;
        if (coupon.discount_type === "%") {
            discount_amount = (cart_total * coupon.discount) / 100;
            // Apply max_discount cap if set
            if (coupon.max_discount && discount_amount > coupon.max_discount) {
                discount_amount = coupon.max_discount;
            }
        } else if (coupon.discount_type === "$") {
            discount_amount = coupon.discount;
        }

        // Ensure discount doesn't exceed cart total
        discount_amount = Math.min(discount_amount, cart_total);
        discount_amount = parseFloat(discount_amount.toFixed(2));

        const final_total = parseFloat((cart_total - discount_amount).toFixed(2));

        return NextResponse.json(
            {
                valid: true,
                coupon_code: coupon.coupon_code,
                discount_type: coupon.discount_type,
                discount_rate: coupon.discount,
                discount_amount,
                final_total,
                message: `Coupon applied! You saved ${discount_amount}.`,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Coupon validation error:", error);
        return NextResponse.json(
            { valid: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
