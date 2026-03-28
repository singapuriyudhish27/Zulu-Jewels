import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
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

export async function GET() {
    try {
        const user = await getUserIdFromCookie();

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        const userId = user.userId;

        //Database Connection
        const connection = await getConnection();

        // Fetch Recent Orders with Joined Data
        const [rows] = await connection.execute(`
            SELECT 
                o.id AS order_id,
                o.order_date,
                o.is_paid,
                o.status AS order_status,
                oi.price AS item_price,
                oi.quantity,
                p.name AS product_name,
                p.id AS product_id,
                pv.material AS variant_material,
                (SELECT media_url FROM product_images WHERE product_id = p.id AND (variant_id = oi.variant_id OR variant_id IS NULL OR variant_id = 0) ORDER BY is_primary DESC LIMIT 1) AS image_url
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            LEFT JOIN product_variants pv ON oi.variant_id = pv.id
            JOIN customers c ON o.customer_id = c.id
            WHERE c.user_id = ?
            ORDER BY o.order_date DESC
        `, [userId]);

        return NextResponse.json({
            success: true,
            data: rows
        }, { status: 200 });

    } catch (error) {
        console.error("Error Fetching Recent Orders:", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, { status: 500 });
    }
}
