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
                p.name AS product_name,
                p.description,
                p.price,
                p.is_active,
                p.created_at,
                pi.id AS image_id,
                pi.image_url,
                pi.is_primary
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE c.id IS NOT NULL
            ORDER BY c.id, p.id, pi.is_primary DESC
        `);
        console.log("Backend API To Get Home Page Data.");

        //Catgeory Wise Data Grouping
        const categoriesMap = {};

        for (const row of rows) {
            const {
                category_id,
                category_name,
                product_id,
                product_name,
                description,
                price,
                is_active,
                created_at,
                image_id,
                image_url,
                is_primary,
            } = row;

            // Initialize category
            if (!categoriesMap[category_id]) {
                categoriesMap[category_id] = {
                    id: category_id,
                    name: category_name,
                    products: [],
                };
            }

            // If product exists
            if (product_id) {
                let product = categoriesMap[category_id].products.find(
                    (p) => p.id === product_id
                );

                if (!product) {
                    product = {
                        id: product_id,
                        name: product_name,
                        description,
                        price,
                        is_active,
                        created_at,
                        images: [],
                    };
                    categoriesMap[category_id].products.push(product);
                }

                // Add image if exists
                if (image_id) {
                    product.images.push({
                        id: image_id,
                        image_url,
                        is_primary: Boolean(is_primary),
                    });
                }
            }
        }
        const result = Object.values(categoriesMap);

        return NextResponse.json({
            succedd: true,
            message: "Category Wise Products Fetching Successfully",
            data: result
        }, { status: 200 });
    } catch (error) {
        console.error("Error Getting Home Page Data:", error);
        return NextResponse.json({message: "Error In Backend API Call"});
    }
}