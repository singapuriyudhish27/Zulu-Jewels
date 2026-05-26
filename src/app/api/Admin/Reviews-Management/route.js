import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

//Get The Reviews Data
export async function GET() {
    try {
        const connection = await getConnection();

        //Database Tbale
        const [rows] = await connection.execute(`
            SELECT 
                r.id AS review_id,
                r.order_id AS order_id,
                r.rating,
                r.review_message AS review_comment,
                r.created_at AS review_date,
                u.id AS user_id,
                u.firstName AS firstName,
                u.lastName AS lastName,
                u.email AS email,
                u.phone AS phone,
                u.is_active AS is_active,
                u.is_verified AS is_verified,
                p.id AS product_id,
                p.name AS product_name
            FROM reviews r
            INNER JOIN users u ON r.user_id = u.id
            INNER JOIN order_items oi ON r.order_id = oi.order_id
            INNER JOIN products p ON oi.product_id = p.id
            INNER JOIN orders o ON oi.order_id = o.id
            ORDER BY r.created_at DESC
        `);

        //Group Reviews Under Each User
        const usersMap = {};

        for (const row of rows) {
            if (!usersMap[row.user_id]) {
                usersMap[row.user_id] = {
                    id: row.user_id,
                    firstName: row.firstName,
                    lastName: row.lastName,
                    email: row.email,
                    phone: row.phone,
                    is_active: row.is_active,
                    is_verified: row.is_verified,
                    created_at: row.user_created_at,
                    reviews: [],
                };
            }

            if (row.review_id) {
                // Add review
                usersMap[row.user_id].reviews.push({
                    id: row.review_id,
                    order_id: row.order_id,
                    rating: row.rating,
                    comment: row.review_comment,
                    created_at: row.review_date,
                    product: {
                        id: row.product_id,
                        name: row.product_name,
                    },
                });
            }
        }
        console.log("Backend API To Get Users & Reviews.");

        return NextResponse.json({
            success: true,
            data: Object.values(usersMap),
            adminEmail: process.env.SMTP_USER
        }, { status: 200 });
    } catch (error) {
        console.error("Error Getting Reviews Data:", error);
        return NextResponse.json({ message: "Error In Backend API Call" });
    }
}

//Edit Reviews
export async function PUT() {
    try {

    } catch (error) {
        console.error("Error Editing Reviews:", error);
        return NextResponse.json({ message: "Error In Backend API Call" });
    }
}