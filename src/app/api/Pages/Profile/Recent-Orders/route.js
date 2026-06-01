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

        // Fetch all orders for this customer
        const orders = await Order.find({ customer_id: customer._id })
            .sort({ order_date: -1 })
            .lean();

        if (orders.length === 0) {
            return NextResponse.json({ success: true, data: [] }, { status: 200 });
        }

        // HIGH-2 FIX: Batch-fetch all related data instead of N+1 queries
        const orderIds = orders.map(o => o._id);

        // Fetch all order items in one query
        const allItems = await OrderItem.find({ order_id: { $in: orderIds } }).lean();

        // Collect unique IDs for batch fetching
        const productIds = [...new Set(allItems.map(i => i.product_id?.toString()).filter(Boolean))];
        const variantIds = [...new Set(allItems.map(i => i.variant_id?.toString()).filter(Boolean))];

        // Batch-fetch products, variants and images simultaneously
        const [products, variants, images] = await Promise.all([
            Product.find({ _id: { $in: productIds } }).select('_id name price').lean(),
            ProductVariant.find({ _id: { $in: variantIds } }).select('_id material').lean(),
            ProductImage.find({ product_id: { $in: productIds } }).lean(),
        ]);

        // Build O(1) lookup maps
        const productMap = Object.fromEntries(products.map(p => [p._id.toString(), p]));
        const variantMap = Object.fromEntries(variants.map(v => [v._id.toString(), v]));

        const imageMap = {};
        for (const img of images) {
            const pid = img.product_id.toString();
            if (!imageMap[pid]) imageMap[pid] = [];
            imageMap[pid].push(img);
        }

        // Group order items by order ID
        const itemsByOrder = {};
        for (const item of allItems) {
            const oid = item.order_id.toString();
            if (!itemsByOrder[oid]) itemsByOrder[oid] = [];
            itemsByOrder[oid].push(item);
        }

        const rows = [];

        for (const order of orders) {
            const orderItemList = itemsByOrder[order._id.toString()] || [];

            for (const oi of orderItemList) {
                const product = oi.product_id ? productMap[oi.product_id.toString()] : null;
                if (!product) continue;

                const variant = oi.variant_id ? variantMap[oi.variant_id.toString()] : null;
                const variantMaterial = variant?.material || null;

                // Find best image
                const prodImages = imageMap[product._id.toString()] || [];
                let image = null;
                if (oi.variant_id) {
                    image = prodImages.find(img => img.variant_id?.toString() === oi.variant_id.toString())
                        || prodImages.find(img => !img.variant_id);
                } else {
                    image = prodImages.find(img => img.is_primary) || prodImages[0] || null;
                }

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
