import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

//Get User Id From Cookie
async function getUserIdFromCookie() {
    const cookieStore = await cookies();
    const cookie = cookieStore.get("zulu_jewels")?.value;
    const decoded = jwt.verify(cookie, process.env.JWT_SECRET);
    return decoded.userId;
}

export async function GET() {
    try {
        const userId = await getUserIdFromCookie();

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized: User not logged in" },
                { status: 401 }
            );
        }

        //Database Connection
        const connection = await getConnection();

        const [rows] = await connection.execute(`
            SELECT 
                ci.id AS cart_item_id,
                ci.quantity,
                ci.created_at,
                p.id AS product_id,
                p.name AS product_name,
                p.description,
                p.price,
                p.is_active,
                pi.image_url,
                pi.is_primary
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE ci.user_id = ?
            ORDER BY ci.created_at DESC
        `, [userId]);
        console.log("Backend API To Get Users & Cart Items.");

        //Product Images Grouping
        const cartMap = {};

        for (const row of rows) {
            const {
                cart_item_id,
                quantity,
                created_at,
                product_id,
                product_name,
                description,
                price,
                is_active,
                image_url,
                is_primary,
            } = row;

            if (!cartMap[cart_item_id]) {
                cartMap[cart_item_id] = {
                    cart_item_id,
                    quantity,
                    created_at,
                    product: {
                        id: product_id,
                        name: product_name,
                        description,
                        price,
                        is_active,
                        images: [],
                    },
                };
            }

            if (image_url) {
                cartMap[cart_item_id].product.images.push({
                    image_url,
                    is_primary: Boolean(is_primary),
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: "Cart items fetched successfully",
            data: Object.values(cartMap)
        }, { status: 200 });
    } catch (error) {
        console.error("Error Getting Cart Data:", error);
        return NextResponse.json({message: "Error In Backend API Call"});
    }
}

//Add New Cart Item
export async function POST(request) {
    try {
        const userId = await getUserIdFromCookie();

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized: User not logged in" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {product_id, quantity = 1} = body;

        if (!product_id) {
            return NextResponse.json({
                success: false,
                message: "product_id is required"
            }, { status: 400 });
        }

        //Database Connection
        const connection = await getConnection();

        //Check If product already exists in cart
        const [existing] = await connection.execute(`
            SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?
        `, [userId, product_id]);

        if (existing.length > 0) {
            //Update Quantity
            await connection.execute(`
                UPDATE cart_items SET quantity = quantity + ? WHERE id = ?
            `, [quantity, existing[0].id]);

            return NextResponse.json({
                success: true,
                message: "Cart item quantity updated successfully",
            });
        } else {
            //Insert New Product
            await connection.execute(`
                INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)
            `, [userId, product_id, quantity]);
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
        const userId = await getUserIdFromCookie();

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
        const connection = await getConnection();

        //If Quantity is Zero Then Delete the Product from Cart
        if (quantity === 0) {
            const [result] = await connection.execute(`
                DELETE FROM cart_items WHERE id = ? AND user_id = ?
            `, [cart_item_id, userId]);

            if (result.affectedRows === 0) {
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

        const [result] = await connection.execute(`
            UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?
        `, [quantity, cart_item_id, userId]);
        console.log("Backend API To Edit Cart Item.");

        if (result.affectedRows === 0) {
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