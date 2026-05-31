import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/lib/models/Category";
import Product from "@/lib/models/Product";
import ProductImage from "@/lib/models/ProductImage";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get('category');
        const search = searchParams.get('search');

        await connectDB();

        // Build category filter
        let categoryFilter = {};
        if (categoryId) {
            if (typeof categoryId === 'string' && /^[0-9a-fA-F]{24}$/.test(categoryId)) {
                categoryFilter = { _id: categoryId };
            } else {
                categoryFilter = { _id: null }; // Invalid ObjectId format shouldn't match anything
            }
        }
        const cats = await Category.find(categoryFilter).sort({ name: 1 });

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

        // Build product filter
        const productFilter = { is_deleted: false };
        if (search) {
            const escapedSearch = escapeRegExp(search);
            const regex = new RegExp(escapedSearch, 'i');
            productFilter.$or = [{ name: regex }, { description: regex }];
        }

        console.log("Backend API To Get Products with Filters.");

        //Group The Data
        const categoriesResult = [];

        for (const cat of cats) {
            const products = await Product.find({ ...productFilter, category_id: cat._id }).sort({ _id: -1 });

            const productsWithImages = [];
            for (const p of products) {
                const images = await ProductImage.find({ product_id: p._id }).sort({ variant_id: 1, media_url: 1 });

                productsWithImages.push({
                    id: p._id,
                    category_id: cat._id,
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    is_active: p.is_active,
                    gender: p.gender,
                    created_at: p.created_at,
                    updated_at: p.updated_at,
                    images: images.map(img => ({
                        id: img._id,
                        variant_id: img.variant_id,
                        image_url: img.media_url,
                        is_primary: img.is_primary,
                    })),
                    swatches: []
                });
            }

            if (productsWithImages.length > 0 || !search) {
                categoriesResult.push({
                    id: cat._id,
                    name: cat.name,
                    image: cat.image_url,
                    products: productsWithImages
                });
            }
        }

        return NextResponse.json({
            success: true,
            count: categoriesResult.length,
            categories: categoriesResult
        });
    } catch (error) {
        console.error("Error Getting All Products Data:", error);
        return NextResponse.json({message: "Error In Backend API Call"});
    }
}