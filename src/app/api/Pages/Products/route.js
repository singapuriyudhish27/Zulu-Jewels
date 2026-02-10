import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function GET() {
    try {
        const connection = await getConnection();

        const [rows] = await connection.execute(`
            SELECT 
                c.id AS category_id,
                c.name AS category_name,

                p.id AS product_id,
                p.category_id,
                p.name AS product_name,
                p.description,
                p.price,
                p.is_active,
                p.created_at AS product_created_at,
                p.updated_at AS product_updated_at,

                pi.id AS image_id,
                pi.image_url,
                pi.is_primary
            FROM categories c
            LEFT JOIN products p 
                ON c.id = p.category_id
            LEFT JOIN product_images pi 
                ON p.id = pi.product_id
            ORDER BY c.name ASC, p.id DESC, pi.is_primary DESC
        `);
        console.log("Backend API To Get All Products.");

        //Group The Data
        const categoriesMap = {};

        rows.forEach(row => {
            //Create category
            if (!categoriesMap[row.category_id]) {
                categoriesMap[row.category_id] = {
                    id: row.category_id,
                    name: row.category_name,
                    products: []
                }
            }

            //Add Products
            if (row.product_id) {
                const category = categoriesMap[row.category_id];

                let product = category.products.find(p => p.id === row.product_id);

                if (!product) {
                    product = {
                        id: row.product_id,
                        category_id: row.category_id,
                        name: row.product_name,
                        description: row.description,
                        price: row.price,
                        is_active: row.is_active,
                        created_at: row.product_created_at,
                        updated_at: row.product_updated_at,
                        images: []
                    };
                    category.products.push(product);
                }

                // Add image
                if (row.image_id) {
                    product.images.push({
                        id: row.image_id,
                        image_url: row.image_url,
                        is_primary: row.is_primary
                    });
                }
            }
        });

        const categories = Object.values(categoriesMap);

        return NextResponse.json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        console.error("Error Getting All Products Data:", error);
        return NextResponse.json({message: "Error In Backend API Call"});
    }
}