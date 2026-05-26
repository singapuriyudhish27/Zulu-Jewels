import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/lib/models/Category";
import Product from "@/lib/models/Product";
import ProductImage from "@/lib/models/ProductImage";

export async function GET() {
    try {
        await connectDB();

        const categories = await Category.find();
        console.log("Backend API To Get Home Page Data.");

        //Catgeory Wise Data Grouping
        const result = [];

        for (const cat of categories) {
            const products = await Product.find({ category_id: cat._id, is_deleted: false }).sort({ _id: -1 });

            const productsWithImages = [];
            for (const p of products) {
                const images = await ProductImage.find({ product_id: p._id }).sort({ is_primary: -1 });

                productsWithImages.push({
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

            result.push({
                id: cat._id,
                name: cat.name,
                image: cat.image_url,
                products: productsWithImages,
            });
        }

        return NextResponse.json({
            success: true,
            message: "Category Wise Products Fetching Successfully",
            data: result
        }, { status: 200 });
    } catch (error) {
        console.error("Error Getting Home Page Data:", error);
        return NextResponse.json({message: "Error In Backend API Call"});
    }
}