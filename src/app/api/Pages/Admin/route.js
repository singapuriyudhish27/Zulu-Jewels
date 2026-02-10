import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

//Get The Dashboard Data
export async function GET() {
    try {
        const connection = await getConnection();

        //Database Tables
        const [orders] = await connection.execute(`
            SELECT * FROM orders ORDER BY created_at DESC
        `);

        const [orderItems] = await connection.execute(`
            SELECT * FROM order_items ORDER BY created_at DESC
        `);

        const [transactions] = await connection.execute(`
            SELECT * FROM transactions ORDER BY created_at DESC
        `);

        const [products] = await connection.execute(`
            SELECT 
                p.*, 
                COUNT(oi.product_id) AS order_count
            FROM products p
            LEFT JOIN order_items oi ON p.id = oi.product_id
            GROUP BY p.id
            ORDER BY order_count DESC
        `);

        const [inquiries] = await connection.execute(`
            SELECT * FROM inquiries ORDER BY id DESC
        `);

        const [reviews] = await connection.execute(`
            SELECT * FROM reviews ORDER BY rating DESC, created_at DESC
        `);

        console.log("Backend API To Get Orders, Inquiries, Reviews, Products & Transactions.");
        return NextResponse.json({
            success: true,
            data: {
                orders,
                order_items: orderItems,
                products,
                transactions,
                inquiries,
                reviews,
            }
        }, { status: 200 });
    } catch (error) {
        console.error("Error Getting Dashboard Data:", error);
        return NextResponse.json({ message: "Error In Backend API Call" });
    }
}