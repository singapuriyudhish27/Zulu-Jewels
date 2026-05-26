import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CartItem from "@/lib/models/CartItem";
import Product from "@/lib/models/Product";
import ProductVariant from "@/lib/models/ProductVariant";
import ProductImage from "@/lib/models/ProductImage";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

//Get User Data From Cookie
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

export async function GET() {
    try {
        const user = await getUserFromCookie();
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized: User not logged in" },
                { status: 401 }
            );
        }
        const userId = user.userId;
        const email = user.email;

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized: User not logged in" },
                { status: 401 }
            );
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

        const cartItems = await CartItem.find({ user_id: userId }).sort({ created_at: -1 });
        console.log("Backend API To Get Users & Cart Items.");

        const data = [];
        for (const ci of cartItems) {
            const product = await Product.findById(ci.product_id);
            if (!product) continue;

            let variantMaterial = null;
            let price = product.price;

            if (ci.variant_id) {
                const variant = await ProductVariant.findById(ci.variant_id);
                if (variant) {
                    price = variant.price || product.price;
                    variantMaterial = variant.material;
                }
            }

            // Get best image for this variant or product
            let imageQuery = { product_id: product._id };
            if (ci.variant_id) {
                imageQuery.$or = [
                    { variant_id: ci.variant_id },
                    { variant_id: null }
                ];
            }
            const image = await ProductImage.findOne(imageQuery).sort({ is_primary: -1 });

            data.push({
                cart_item_id: ci._id,
                quantity: ci.quantity,
                variant_id: ci.variant_id,
                variant_material: variantMaterial,
                created_at: ci.created_at,
                product: {
                    id: product._id,
                    name: product.name,
                    description: product.description,
                    price,
                    is_active: product.is_active,
                    images: image ? [{ media_url: image.media_url }] : [],
                },
            });
        }

        return NextResponse.json({
            success: true,
            role,
            message: "Cart items fetched successfully",
            data
        }, { status: 200 });
    } catch (error) {
        console.error("Error Getting Cart Data:", error);
        return NextResponse.json({message: "Error In Backend API Call"});
    }
}

//Add New Cart Item
export async function POST(request) {
    try {
        const user = await getUserFromCookie();
        const userId = user?.userId;

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized: User not logged in" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {product_id, variant_id, quantity = 1} = body;

        if (!product_id) {
            return NextResponse.json({
                success: false,
                message: "product_id is required"
            }, { status: 400 });
        }

        //Database Connection
        await connectDB();

        //Check If product already exists in cart with this variant
        const existing = await CartItem.findOne({
            user_id: userId,
            product_id,
            variant_id: variant_id || null
        });

        if (existing) {
            //Update Quantity
            await CartItem.updateOne(
                { _id: existing._id },
                { $inc: { quantity } }
            );

            return NextResponse.json({
                success: true,
                message: "Cart item quantity updated successfully",
            });
        } else {
            //Insert New Product
            await CartItem.create({
                user_id: userId,
                product_id,
                variant_id: variant_id || null,
                quantity
            });
            console.log("Backend API To Add New Cart Item.");

            return NextResponse.json({
                success: true,
                message: "Cart item added successfully"
            }, { status: 201 });
        }
    } catch (error) {
        console.error("Error Adding Cart Item:", error);
        return NextResponse.json({message: "Error In Backend API Call"});
    }
}

//Edit Cart Item
export async function PUT(request) {
    try {
        const user = await getUserFromCookie();
        const userId = user?.userId;

        if (!userId) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized: User not logged in"
            }, { status: 401 });
        }

        const body = await request.json();
        const { cart_item_id, quantity} = body;

        if (!cart_item_id || quantity === undefined) {
            return NextResponse.json({
                success: false,
                message: "cart_item_id and quantity are required"
            }, { status: 400 });
        }

        //Database Connection
        await connectDB();

        //If Quantity is Zero Then Delete the Product from Cart
        if (quantity === 0) {
            const result = await CartItem.deleteOne({ _id: cart_item_id, user_id: userId });

            if (result.deletedCount === 0) {
                return NextResponse.json({
                    success: false,
                    message: "Cart item not found or unauthorized",
                }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                message: "Cart item removed successfully"
            }, { status: 200 });
        }

        const result = await CartItem.updateOne(
            { _id: cart_item_id, user_id: userId },
            { quantity }
        );
        console.log("Backend API To Edit Cart Item.");

        if (result.matchedCount === 0) {
            return NextResponse.json({
                success: false,
                message: "Cart item not found or unauthorized",
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Cart item updated successfully"
        }, { status: 201 });
    } catch (error) {
        console.error("Error Editing Cart Item:", error);
        return NextResponse.json({message: "Error In Backend API Call"});
    }
}