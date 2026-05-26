import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import UserLike from "@/lib/models/UserLike";
import Product from "@/lib/models/Product";
import ProductVariant from "@/lib/models/ProductVariant";
import ProductImage from "@/lib/models/ProductImage";
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

//Fetch Logged In User's WhishList
export async function GET() {
    try {
        const user = await getUserIdFromCookie();
        const userId = user.userId;
        const email = user.email;

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        //If Admin Login
        if (email === process.env.ADMIN_EMAIL) {
            const role = "Admin";
            const user = email;            
            return NextResponse.json({user, role}, {status: 200 });
        }

        //Database Connection
        await connectDB();
        const role = "User";

        const likes = await UserLike.find({ user_id: userId }).sort({ created_at: -1 });
        console.log("Backend API To Get Users & User's Liked Products(Wishlists).");

        const data = [];
        for (const like of likes) {
            const product = await Product.findById(like.product_id);
            if (!product) continue;

            let price = product.price;
            let variantMaterial = null;

            if (like.variant_id) {
                const variant = await ProductVariant.findById(like.variant_id);
                if (variant) {
                    price = variant.price || product.price;
                    variantMaterial = variant.material;
                }
            }

            // Get best image
            let imageQuery = { product_id: product._id };
            if (like.variant_id) {
                imageQuery.$or = [
                    { variant_id: like.variant_id },
                    { variant_id: null }
                ];
            }
            const image = await ProductImage.findOne(imageQuery).sort({ is_primary: -1 });

            data.push({
                wishlist_id: like._id,
                user_id: like.user_id,
                product_id: like.product_id,
                variant_id: like.variant_id,
                created_at: like.created_at,
                name: product.name,
                description: product.description,
                price,
                variant_material: variantMaterial,
                image_url: image ? image.media_url : null,
            });
        }

        return NextResponse.json({
            success: true,
            role,
            count: data.length,
            data
        }, { status: 200 });
    } catch (error) {
        console.error("Error Getting WhishList Data:", error);
        return NextResponse.json({message: "Error In Backend API Call"});
    }
}

//Add New Product To User's WhishList
export async function POST(req) {
    try {
        const user = await getUserIdFromCookie();

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        const {product_id, variant_id, is_custom = false} = await req.json();

        if (!product_id) {
            return NextResponse.json({
                success: false,
                message: "product_id is required"
            }, { status: 400 });
        }

        //Database Connection
        await connectDB();

        const userId = user.userId;

        await UserLike.findOneAndUpdate(
            { user_id: userId, product_id, variant_id: variant_id || null },
            { user_id: userId, product_id, variant_id: variant_id || null, is_custom },
            { upsert: true, new: true }
        );
        console.log("Backend API To Add New Products To User's Wishlists.");

        return NextResponse.json({
            success: true,
            message: "Product added to wishlist"
        }, { status: 201 });
    } catch (error) {
        console.error("Error Adding WhishList Data:", error);
        return NextResponse.json({message: "Error In Backend API Call"});
    }
}

//Remove Product from User's WhishList
export async function DELETE(req) {
    try {
        const user = await getUserIdFromCookie();

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        const {product_id, variant_id} = await req.json();

        if (!product_id) {
            return NextResponse.json({
                success: false,
                message: "product_id is required"
            }, { status: 400 });
        }

        //Database Connection
        await connectDB();

        const userId = user.userId;

        const result = await UserLike.deleteOne({
            user_id: userId,
            product_id,
            variant_id: variant_id || null
        });
        console.log("Backend API To Remove Products From User's Wishlists.");

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { success: false, message: "Item not found in wishlist" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Product removed from wishlist"
        }, { status: 201 });
    } catch (error) {
        console.error("Error Removing Wishlist Data:", error);
        return NextResponse.json({message: "Error In Backend API Call"});
    }
}