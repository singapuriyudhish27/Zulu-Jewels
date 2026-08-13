import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import ProductVariant from "@/lib/models/ProductVariant";
import ProductImage from "@/lib/models/ProductImage";
import CartItem from "@/lib/models/CartItem";
import UserLike from "@/lib/models/UserLike";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

async function getUserIdFromCookie() {
    const cookieStore = await cookies();
    const cookie = cookieStore.get("zulu_jewels")?.value;
    if (!cookie) return null;
    try {
        const decoded = jwt.verify(cookie, process.env.JWT_SECRET);
        return decoded.userId;
    } catch (err) {
        return null;
    }
}

export async function GET(request, { params }) {
    try {
        const { Product_Details: id } = await params;

        // Validate ObjectId format to prevent Mongoose CastError
        if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
            return NextResponse.json({ success: false, message: "Invalid Product ID" }, { status: 400 });
        }

        await connectDB();

        const userId = await getUserIdFromCookie();

        const product = await Product.findById(id);

        if (!product) {
            return NextResponse.json({ success: false, message: "Product Not Found" }, { status: 404 });
        }

        const category = product.category_id
            ? await Category.findById(product.category_id).select('name').lean()
            : null;

        const variants = await ProductVariant.find({ product_id: id });
        const images = await ProductImage.find({ product_id: id });

        // Get cart variants for this user+product
        let cartVariants = [];
        if (userId && userId !== 'admin') {
            const cartItems = await CartItem.find({ user_id: userId, product_id: id });
            cartVariants = cartItems.map(ci => ci.variant_id ? ci.variant_id.toString() : 'base');
        }

        // Check if wishlisted
        let isWishlisted = false;
        if (userId && userId !== 'admin') {
            const likeCount = await UserLike.countDocuments({ user_id: userId, product_id: id });
            isWishlisted = likeCount > 0;
        }

        // Fetch up to 10 related products from the same category
        let related_products = [];
        if (product.category_id) {
            const relatedProductsDocs = await Product.find({
                category_id: product.category_id,
                _id: { $ne: product._id },
                is_deleted: { $ne: true },
                is_active: true
            })
            .limit(10)
            .sort({ _id: -1 })
            .lean();

            if (relatedProductsDocs.length > 0) {
                const relatedIds = relatedProductsDocs.map(p => p._id);
                const relatedImages = await ProductImage.find({ product_id: { $in: relatedIds } }).lean();

                const relatedImagesMap = {};
                for (const img of relatedImages) {
                    const pid = img.product_id.toString();
                    if (!relatedImagesMap[pid]) relatedImagesMap[pid] = [];
                    relatedImagesMap[pid].push(img);
                }

                related_products = relatedProductsDocs.map(p => {
                    const pImgs = relatedImagesMap[p._id.toString()] || [];
                    const primaryImg = pImgs.find(i => i.is_primary)?.media_url || pImgs[0]?.media_url || null;
                    return {
                        id: p._id,
                        name: p.name,
                        price: p.price,
                        image: primaryImg,
                        images: pImgs.map(img => ({
                            image_url: img.media_url,
                            is_primary: Boolean(img.is_primary),
                            is_hover: Boolean(img.is_hover)
                        })),
                        category_id: p.category_id
                    };
                });
            }
        }

        const result = {
            id: product._id,
            category_id: product.category_id,
            category_name: category?.name || "Products",
            specifications: product.specifications || {},
            name: product.name,
            description: product.description,
            price: product.price,
            material: product.material,
            gender: product.gender,
            craftsmanship_video: product.craftsmanship_video || '',
            is_active: product.is_active,
            created_at: product.created_at,
            updated_at: product.updated_at,
            is_wishlisted: isWishlisted,
            cart_variants: cartVariants,
            variants: variants,
            images: images,
            related_products: related_products
        }

        return NextResponse.json({
            success: true,
            product: result
        });
    } catch (error) {
        console.error("Error Getting Product Data:", error);
        return NextResponse.json({message: "Error In Backend API Call"}, {status: 500});
    }
}

// Add Product To Cart & Wishlist
export async function POST(request) {
    try {
        const userId = await getUserIdFromCookie();

        if (!userId) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized: User not logged in"
            }, { status: 401 });
        }

        const body = await request.json();
        const {product_id, variant_id, quantity = 1, action} = body;

        const parsedQuantity = Math.floor(Number(quantity));
        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
            return NextResponse.json({
                success: false,
                message: "Quantity must be a positive integer"
            }, { status: 400 });
        }

        if (!product_id || !action) {
            return NextResponse.json({
                success: false,
                message: "product_id and action are required"
            }, { status: 400 });
        }

        //Database Connection
        await connectDB();

        // ================= CART =================
        if (action === "cart") {
            //Check If product already exists in cart with this variant
            const existing = await CartItem.findOne({
                user_id: userId,
                product_id,
                variant_id: variant_id || null
            });

            if (existing) {
                // Remove from Cart
                await CartItem.deleteOne({ _id: existing._id });

                return NextResponse.json({
                    success: true,
                    status: "removed",
                    message: "Product removed from cart",
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
                    status: "added",
                    message: "Product added to cart"
                }, { status: 201 });
            }
        }

        // ================= WISHLIST =================
        if (action === "wishlist") {
            //Check If product already exists in wishlist with this variant
            const existing = await UserLike.findOne({
                user_id: userId,
                product_id,
                variant_id: variant_id || null
            });

            if (existing) {
                // Remove from Wishlist
                await UserLike.deleteOne({ _id: existing._id });

                return NextResponse.json({
                    success: true,
                    status: "removed",
                    message: "Product removed from wishlist",
                });
            } else {
                //Insert New Product
                await UserLike.create({
                    user_id: userId,
                    product_id,
                    variant_id: variant_id || null
                });

                return NextResponse.json({
                    success: true,
                    status: "added",
                    message: "Product added to wishlist"
                }, { status: 201 });
            }
        }
    } catch (error) {
        console.error("Error Adding Cart Item:", error);
        return NextResponse.json({message: "Error In Backend API Call"}, { status: 500 });
    }
}
