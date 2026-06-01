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
    const cookie = cookieStore.get("zulu_jewels")?.value || cookieStore.get("zulu_jewels_admin")?.value;
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
        if (user.role === 'admin') {
            const role = "Admin";
            const userEmail = email;
            return NextResponse.json({user: userEmail, role}, {status: 200 });
        }

        //Database Connection
        await connectDB();
        const role = "User";

        const cartItems = await CartItem.find({ user_id: userId }).sort({ created_at: -1 }).lean();


        const productIds = cartItems.map(ci => ci.product_id);
        const variantIds = cartItems.map(ci => ci.variant_id).filter(Boolean);

        // Fetch products, variants, and images in bulk
        const [products, variants, images] = await Promise.all([
            Product.find({ _id: { $in: productIds } }).lean(),
            ProductVariant.find({ _id: { $in: variantIds } }).lean(),
            ProductImage.find({ product_id: { $in: productIds } }).lean()
        ]);

        // Map to O(1) lookups
        const productMap = Object.fromEntries(products.map(p => [p._id.toString(), p]));
        const variantMap = Object.fromEntries(variants.map(v => [v._id.toString(), v]));
        
        const imagesMap = {};
        for (const img of images) {
            const pid = img.product_id.toString();
            if (!imagesMap[pid]) {
                imagesMap[pid] = [];
            }
            imagesMap[pid].push(img);
        }

        const data = [];
        for (const ci of cartItems) {
            const product = productMap[ci.product_id.toString()];
            if (!product) continue;

            let variantMaterial = null;
            let price = product.price;

            if (ci.variant_id) {
                const variant = variantMap[ci.variant_id.toString()];
                if (variant) {
                    price = variant.price || product.price;
                    variantMaterial = variant.material;
                }
            }

            // Find best image
            const prodImages = imagesMap[product._id.toString()] || [];
            let image = null;
            if (ci.variant_id) {
                image = prodImages.find(img => img.variant_id?.toString() === ci.variant_id.toString()) ||
                        prodImages.find(img => !img.variant_id);
            } else {
                image = prodImages.find(img => !img.variant_id);
            }
            if (!image && prodImages.length > 0) {
                image = prodImages.find(img => img.is_primary) || prodImages[0];
            }

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
        return NextResponse.json({message: "Error In Backend API Call"}, { status: 500 });
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

        const parsedQuantity = Math.floor(Number(quantity));
        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
            return NextResponse.json({
                success: false,
                message: "Quantity must be a positive integer"
            }, { status: 400 });
        }

        if (!product_id) {
            return NextResponse.json({
                success: false,
                message: "product_id is required"
            }, { status: 400 });
        }

        const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;
        if (!OBJECT_ID_RE.test(product_id)) {
            return NextResponse.json({ success: false, message: "Invalid product ID format" }, { status: 400 });
        }
        if (variant_id && !OBJECT_ID_RE.test(variant_id)) {
            return NextResponse.json({ success: false, message: "Invalid variant ID format" }, { status: 400 });
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
                { $inc: { quantity: parsedQuantity } }
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
                quantity: parsedQuantity
            });


            return NextResponse.json({
                success: true,
                message: "Cart item added successfully"
            }, { status: 201 });
        }
    } catch (error) {
        console.error("Error Adding Cart Item:", error);
        return NextResponse.json({message: "Error In Backend API Call"}, { status: 500 });
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

        const parsedQuantity = Math.floor(Number(quantity));
        if (isNaN(parsedQuantity) || parsedQuantity < 0) {
            return NextResponse.json({
                success: false,
                message: "Quantity must be a non-negative integer"
            }, { status: 400 });
        }

        //Database Connection
        await connectDB();

        //If Quantity is Zero Then Delete the Product from Cart
        if (parsedQuantity === 0) {
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
            { quantity: parsedQuantity }
        );


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
        return NextResponse.json({message: "Error In Backend API Call"}, { status: 500 });
    }
}