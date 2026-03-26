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
                p.material,
                p.gender,
                p.is_active,
                p.created_at,
                p.updated_at
            FROM products p
            WHERE p.id = ?
        `, [id]);

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
            variants: variants,
            images: images
        }

        return NextResponse.json({
            success: true,
            product
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