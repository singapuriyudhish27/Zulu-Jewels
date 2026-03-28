import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
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
        const connection = await getConnection();
        const role = "User";

        const [rows] = await connection.execute(`
            SELECT 
                ci.id AS cart_item_id,
                ci.quantity,
                ci.variant_id,
                ci.created_at,
                p.id AS product_id,
                p.name AS product_name,
                p.description,
                COALESCE(pv.price, p.price) AS price,
                pv.material AS variant_material,
                p.is_active,
                (SELECT media_url FROM product_images WHERE product_id = p.id AND (variant_id = ci.variant_id OR variant_id IS NULL OR variant_id = 0) ORDER BY is_primary DESC LIMIT 1) AS media_url
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            LEFT JOIN product_variants pv ON ci.variant_id = pv.id
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
                variant_id,
                created_at,
                product_id,
                product_name,
                description,
                price,
                variant_material,
                is_active,
                media_url,
            } = row;

            if (!cartMap[cart_item_id]) {
                cartMap[cart_item_id] = {
                    cart_item_id,
                    quantity,
                    variant_id,
                    variant_material,
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

            if (media_url) {
                cartMap[cart_item_id].product.images.push({
                    media_url
                });
            }
        }

        return NextResponse.json({
            success: true,
            role,
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
        const connection = await getConnection();

        //Check If product already exists in cart with this variant
        const [existing] = await connection.execute(`
            SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? AND variant_id <=> ?
        `, [userId, product_id, variant_id || null]);

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
                INSERT INTO cart_items (user_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?)
            `, [userId, product_id, variant_id || null, quantity]);
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