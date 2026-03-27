import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

async function getUserIdFromCookie() {
    const cookieStore = await cookies();
    const cookie = cookieStore.get("zulu_jewels");
    const token = cookie?.value;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
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
        const connection = await getConnection();
        const role = "User";

        const [rows] = await connection.execute(`
            SELECT 
                ul.id AS wishlist_id,
                ul.user_id,
                ul.product_id,
                ul.created_at,
                p.name,
                p.description,
                p.price,
                pi.media_url AS image_url
            FROM user_likes ul
            JOIN products p ON ul.product_id = p.id
            LEFT JOIN product_images pi 
                ON p.id = pi.product_id AND pi.is_primary = TRUE
            WHERE ul.user_id = ?
            ORDER BY ul.created_at DESC
        `, [userId]);
        console.log("Backend API To Get Users & User's Liked Products(Wishlists).");

        return NextResponse.json({
            success: true,
            role,
            count: rows.length,
            data: rows
        }, { status: 200 });
    } catch (error) {
        console.error("Error Getting WhishList Data:", error);
        return NextResponse.json({message: "Error In Backend API Call"});
    }
}

//Add New Product To User's WhishList
export async function POST(req) {
    try {
        const userId = await getUserIdFromCookie();

        if (!userId) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        const {product_id, is_custom = false} = await req.json();

        if (!product_id) {
            return NextResponse.json({
                success: false,
                message: "product_id is required"
            }, { status: 400 });
        }

        //Database Connection
        const connection = await getConnection();

        await connection.execute(`
            INSERT INTO user_likes (user_id, product_id, is_custom)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE is_custom = VALUES(is_custom)
        `, [userId, product_id, is_custom]);
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
        const userId = await getUserIdFromCookie();

        if (!userId) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        const {product_id} = await req.json();

        if (!product_id) {
            return NextResponse.json({
                success: false,
                message: "product_id is required"
            }, { status: 400 });
        }

        //Database Connection
        const connection = await getConnection();

        const [result] = await connection.execute(`
            DELETE FROM user_likes WHERE user_id = ? AND product_id = ?
        `, [userId, product_id]);
        console.log("Backend API To Add New Products To User's Wishlists.");

        if (result.affectedRows === 0) {
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