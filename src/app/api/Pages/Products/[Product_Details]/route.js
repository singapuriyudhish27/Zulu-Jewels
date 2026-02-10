import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function GET(request, { params }) {
    try {
        const {Product_Details: id} = await params;
        const connection = await getConnection();

        const [rows] = await connection.execute(`
            SELECT 
                p.id AS product_id,
                p.category_id,
                p.name AS product_name,
                p.description,
                p.price,
                p.is_active,
                p.created_at,
                p.updated_at,

                pi.id AS image_id,
                pi.image_url,
                pi.is_primary
            FROM products p
            LEFT JOIN product_images pi 
                ON p.id = pi.product_id
            WHERE p.id = ?
            ORDER BY pi.is_primary DESC
        `, [id]);
        console.log("Backend API To Get Each Product's Details.");

        //If No Product Found
        if (rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Product Not Found"
            }, { status: 404 });
        }

        //Build Product Object
        const product = {
            id: rows[0].product_id,
            category_id: rows[0].category_id,
            name: rows[0].product_name,
            description: rows[0].description,
            price: rows[0].price,
            is_active: rows[0].is_active,
            created_at: rows[0].created_at,
            updated_at: rows[0].updated_at,
            images: []
        }

        rows.forEach(row => {
            if (row.image_id) {
                product.images.push({
                    id: row.image_id,
                    image_url: row.image_url,
                    is_primary: row.is_primary
                });
            }
        });

        return NextResponse.json({
            success: true,
            product
        });
    } catch (error) {
        console.error("Error Getting Product Data:", error);
        NextResponse.json({message: "Error In Backend API Call"});
    }
}