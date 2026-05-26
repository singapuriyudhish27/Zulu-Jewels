import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import OrderItem from "@/lib/models/OrderItem";
import Product from "@/lib/models/Product";
import ProductVariant from "@/lib/models/ProductVariant";
import ProductImage from "@/lib/models/ProductImage";
import Customer from "@/lib/models/Customer";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

async function getUserIdFromCookie() {
    try {
        const cookieStore = await cookies();
        const cookie = cookieStore.get("zulu_jewels");
        const token = cookie?.value;
        if (!token) return null;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
}

export async function GET() {
    try {
        const user = await getUserIdFromCookie();

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        const userId = user.userId;

        //Database Connection
        await connectDB();

        // Find the customer record for this user
        const customer = await Customer.findOne({ user_id: userId });
        if (!customer) {
            return NextResponse.json({ success: true, data: [] }, { status: 200 });
        }

        // Fetch orders for this customer
        const orders = await Order.find({ customer_id: customer._id }).sort({ order_date: -1 });

        const rows = [];
        for (const order of orders) {
            const items = await OrderItem.find({ order_id: order._id });

            for (const oi of items) {
                const product = await Product.findById(oi.product_id);
                if (!product) continue;

                let variantMaterial = null;
                if (oi.variant_id) {
                    const variant = await ProductVariant.findById(oi.variant_id);
                    if (variant) variantMaterial = variant.material;
                }

                // Get best image
                let imageQuery = { product_id: product._id };
                if (oi.variant_id) {
                    imageQuery.$or = [
                        { variant_id: oi.variant_id },
                        { variant_id: null }
                    ];
                }
                const image = await ProductImage.findOne(imageQuery).sort({ is_primary: -1 });

                rows.push({
                    order_id: order._id,
                    order_date: order.order_date,
                    is_paid: order.is_paid,
                    order_status: order.status,
                    item_price: oi.price,
                    quantity: oi.quantity,
                    product_name: product.name,
                    product_id: product._id,
                    variant_material: variantMaterial,
                    image_url: image ? image.media_url : null,
                });
            }
        }

        return NextResponse.json({
            success: true,
            data: rows
        }, { status: 200 });

    } catch (error) {
        console.error("Error Fetching Recent Orders:", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, { status: 500 });
    }
}
