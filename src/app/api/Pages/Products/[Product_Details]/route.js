import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
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
        const connection = await getConnection();

        const userId = await getUserIdFromCookie();

        const [rows] = await connection.execute(`
            SELECT 
                p.id AS product_id,
                p.category_id,
                p.name AS product_name,
                p.description,
                p.price,
                p.material,
                p.gender,
                p.is_active,
                p.created_at,
                p.updated_at,
                (SELECT COUNT(*) FROM cart_items WHERE user_id = ? AND product_id = p.id) > 0 AS in_cart,
                (SELECT COUNT(*) FROM user_likes WHERE user_id = ? AND product_id = p.id) > 0 AS is_wishlisted
            FROM products p
            WHERE p.id = ?
        `, [userId || 0, userId || 0, id]);

        if (rows.length === 0) {
            return NextResponse.json({ success: false, message: "Product Not Found" }, { status: 404 });
        }

        const [variants] = await connection.execute(`
            SELECT * FROM product_variants WHERE product_id = ?
        `, [id]);

        const [images] = await connection.execute(`
            SELECT * FROM product_images WHERE product_id = ?
        `, [id]);

        const product = {
            id: rows[0].product_id,
            category_id: rows[0].category_id,
            name: rows[0].product_name,
            description: rows[0].description,
            price: rows[0].price,
            material: rows[0].material,
            gender: rows[0].gender,
            is_active: rows[0].is_active,
            created_at: rows[0].created_at,
            updated_at: rows[0].updated_at,
            in_cart: Boolean(rows[0].in_cart),
            is_wishlisted: Boolean(rows[0].is_wishlisted),
            variants: variants,
            images: images
        }

        return NextResponse.json({
            success: true,
            product
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
        const {product_id, quantity = 1, action} = body;

        if (!product_id || !action) {
            return NextResponse.json({
                success: false,
                message: "product_id and action are required"
            }, { status: 400 });
        }

        //Database Connection
        const connection = await getConnection();

        // ================= CART =================
        if (action === "cart") {
            //Check If product already exists in cart
            const [existing] = await connection.execute(`
                SELECT id FROM cart_items WHERE user_id = ? AND product_id = ?
            `, [userId, product_id]);

            if (existing.length > 0) {
                // Remove from Cart
                await connection.execute(`
                    DELETE FROM cart_items WHERE id = ?
                `, [existing[0].id]);

                return NextResponse.json({
                    success: true,
                    status: "removed",
                    message: "Product removed from cart",
                });
            } else {
                //Insert New Product
                await connection.execute(`
                    INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)
                `, [userId, product_id, quantity]);

                return NextResponse.json({
                    success: true,
                    status: "added",
                    message: "Product added to cart"
                }, { status: 201 });
            }
        }

        // ================= WISHLIST =================
        if (action === "wishlist") {
            //Check If product already exists in wishlist
            const [existing] = await connection.execute(`
                SELECT id FROM user_likes WHERE user_id = ? AND product_id = ?
            `, [userId, product_id]);

            if (existing.length > 0) {
                // Remove from Wishlist
                await connection.execute(`
                    DELETE FROM user_likes WHERE id = ?
                `, [existing[0].id]);

                return NextResponse.json({
                    success: true,
                    status: "removed",
                    message: "Product removed from wishlist",
                });
            } else {
                //Insert New Product
                await connection.execute(`
                    INSERT INTO user_likes (user_id, product_id) VALUES (?, ?)
                `, [userId, product_id]);

                return NextResponse.json({
                    success: true,
                    status: "added",
                    message: "Product added to wishlist"
                }, { status: 201 });
            }
        }
    } catch (error) {
        console.error("Error Adding Cart Item:", error);
        return NextResponse.json({message: "Error In Backend API Call"});
    }
}
