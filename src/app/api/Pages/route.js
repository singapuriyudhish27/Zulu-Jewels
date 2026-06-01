import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/lib/models/Category";
import Product from "@/lib/models/Product";
import ProductImage from "@/lib/models/ProductImage";

export async function GET() {
    try {
        await connectDB();

        const categories = await Category.find().lean();


        const allProducts = await Product.find({ is_deleted: false }).sort({ _id: -1 }).lean();
        const productIds = allProducts.map(p => p._id);

        // Fetch all images in bulk
        const allImages = await ProductImage.find({ product_id: { $in: productIds } }).lean();
        const imagesMap = {};
        for (const img of allImages) {
            const pid = img.product_id.toString();
            if (!imagesMap[pid]) {
                imagesMap[pid] = [];
            }
            imagesMap[pid].push(img);
        }

        // Sort images in-memory so primary images are first
        for (const pid in imagesMap) {
            imagesMap[pid].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
        }

        // Group products by category ID
        const productsMap = {};
        for (const p of allProducts) {
            if (!p.category_id) continue;
            const cid = p.category_id.toString();
            if (!productsMap[cid]) {
                productsMap[cid] = [];
            }

            const images = imagesMap[p._id.toString()] || [];
            productsMap[cid].push({
                id: p._id,
                name: p.name,
                description: p.description,
                price: p.price,
                is_active: p.is_active,
                created_at: p.created_at,
                images: images.map(img => ({
                    id: img._id,
                    image_url: img.media_url,
                    is_primary: Boolean(img.is_primary),
                })),
            });
        }

        const result = categories.map(cat => ({
            id: cat._id,
            name: cat.name,
            image: cat.image_url,
            products: productsMap[cat._id.toString()] || [],
        }));

        return NextResponse.json({
            success: true,
            message: "Category Wise Products Fetching Successfully",
            data: result
        }, { status: 200 });
    } catch (error) {
        console.error("Error Getting Home Page Data:", error);
        return NextResponse.json({message: "Error In Backend API Call"}, { status: 500 });
    }
}