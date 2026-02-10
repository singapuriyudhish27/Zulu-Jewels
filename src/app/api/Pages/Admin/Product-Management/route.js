import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function GET() {
    try {
        const connection = await getConnection();

        //Fetching Categories
        const [categories] = await connection.execute(`
            SELECT * FROM categories
        `);

        //Database Table
        const [rows] = await connection.execute(`
            SELECT
                p.id AS product_id,
                p.name AS product_name,
                p.description,
                p.price,
                p.is_active,
                p.created_at AS product_created_at,
                c.id AS category_id,
                c.name AS category_name,
                pi.id AS image_id,
                pi.image_url,
                pi.is_primary
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_images pi ON p.id = pi.product_id
            ORDER BY p.created_at DESC
        `);
        console.log("Backend API To Get Categories, Products Images, Products.");

        //Group Data
        const productMap = {};

        for (const row of rows) {
            if (!productMap[row.product_id]) {
                productMap[row.product_id] = {
                    id: row.product_id,
                    name: row.product_name,
                    description: row.description,
                    price: row.price,
                    is_active: row.is_active,
                    created_at: row.product_created_at,
                    category: {
                        id: row.category_id,
                        name: row.category_name,
                    },
                    images: [],
                };
            }

            if (row.image_id) {
                productMap[row.product_id].images.push({
                    id: row.image_id,
                    image_url: row.image_url,
                    is_primary: row.is_primary
                });
            }
        }

        return NextResponse.json({
            success: true,
            categories: categories,
            data: Object.values(productMap),
        }, { status: 200 });
    } catch (error) {
        console.error("Error Getting Products Data:", error);
        return NextResponse.json({ message: "Error In Backend API Call" });
    }
}

//Add New Product
export async function POST(request) {
    try {
        //Database Connection
        const connection = await getConnection();
        const body = await request.json();

        const {
            category_name,
            name,
            description,
            price,
            is_active = true,
            images = []
        } = body;

        //Basic Validation
        if (!category_name || !name || !price) {
            return NextResponse.json({
                success: false,
                message: "Categoty, Name & Price Required."
            }, { status: 400 });
        }

        //Category Extsting Check
        const [categoryRows] = await connection.execute(`
            SELECT id FROM categories WHERE name = ?
        `, [category_name]);

        if (categoryRows.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Category Not Found"
            }, { status: 400 });
        }
        const categoryId = categoryRows[0].id;

        //Insert Product To Database
        const [productResult] = await connection.execute(`
            INSERT INTO products (category_id, name, description, price, is_active) VALUES (?, ?, ?, ?, ?)
        `, [categoryId, name, description, price, is_active]);

        const productId = productResult.insertId;

        //Insert Product Images
        if (Array.isArray(images) && images.length > 0) {
            const imagesValues = images.map(img => [
                productId,
                img.image_url,
                img.is_primary || false
            ]);

            await connection.query(`
                INSERT INTO product_images (product_id, image_url, is_primary) VALUES ?
            `, [imagesValues]);
        }

        // Fetch the newly created product with category & images
        const [rows] = await connection.execute(`
            SELECT
                p.id AS product_id,
                p.name AS product_name,
                p.description,
                p.price,
                p.is_active,
                p.created_at AS product_created_at,
                c.id AS category_id,
                c.name AS category_name,
                pi.id AS image_id,
                pi.image_url,
                pi.is_primary
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE p.id = ?
            `, [productId]
        );

        const product = {
            id: rows[0].product_id,
            name: rows[0].product_name,
            description: rows[0].description,
            price: rows[0].price,
            is_active: rows[0].is_active,
            created_at: rows[0].product_created_at,
            category: {
                id: rows[0].category_id,
                name: rows[0].category_name,
            },
            images: rows
                .filter(r => r.image_id)
                .map(r => ({
                    id: r.image_id,
                    image_url: r.image_url,
                    is_primary: r.is_primary,
                })),
        };

        return NextResponse.json({
            success: true,
            message: "Product added successfully",
            data: product,
        }, { status: 201 });
    } catch (error) {
        console.error("Error Adding Products:", error);
        return NextResponse.json({ message: "Error In Backend API Call" });
    }
}

//Edit Product
export async function PUT(request) {
    try {
        //Database Connection
        const connection = await getConnection();
        const body = await request.json();

        const {
            id,
            category_name,
            name,
            description,
            price,
            is_active,
            images = []
        } = body;

        if (!id) {
            return NextResponse.json({
                success: false,
                message: "Product Id Not Found"
            }, { status: 400 });
        }

        //Check Product Exists
        const [productRows] = await connection.execute(`
            SELECT id FROM products WHERE id = ?
        `, [id]);

        if (productRows.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Product not found."
            }, { status: 404 });
        }

        let categoryId = null;
        if (category_name) {
            const [categoryRows] = await connection.execute(
                `SELECT id FROM categories WHERE name = ?`,
                [category_name]
            );

            if (categoryRows.length === 0) {
                return NextResponse.json({
                    success: false,
                    message: "Category not found."
                }, { status: 400 });
            }

            categoryId = categoryRows[0].id;
        }

        //Build Dynamic Update Fields
        const fields = [];
        const values = [];

        if (categoryId !== null) {
            fields.push("category_id = ?");
            values.push(categoryId);
        }
        if (name !== undefined) {
            fields.push("name = ?");
            values.push(name);
        }
        if (description !== undefined) {
            fields.push("description = ?");
            values.push(description);
        }
        if (price !== undefined) {
            fields.push("price = ?");
            values.push(price);
        }
        if (is_active !== undefined) {
            fields.push("is_active = ?");
            values.push(is_active);
        }

        if (fields.length > 0) {
            await connection.execute(
                `UPDATE products SET ${fields.join(", ")} WHERE id = ?`,
                [...values, id]
            );
        }

        // Replace images if provided
        if (Array.isArray(images)) {
            // Delete old images
            await connection.execute(
                `DELETE FROM product_images WHERE product_id = ?`,
                [id]
            );

            // Insert new images
            if (images.length > 0) {
                const imagesValues = images.map(img => [
                    id,
                    img.image_url,
                    img.is_primary || false
                ]);

                await connection.query(
                    `INSERT INTO product_images (product_id, image_url, is_primary) VALUES ?`,
                    [imagesValues]
                );
            }
        }

        // Fetch updated product
        const [rows] = await connection.execute(`
            SELECT
                p.id AS product_id,
                p.name AS product_name,
                p.description,
                p.price,
                p.is_active,
                p.created_at AS product_created_at,
                c.id AS category_id,
                c.name AS category_name,
                pi.id AS image_id,
                pi.image_url,
                pi.is_primary
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE p.id = ?
        `, [id]);

        const product = {
            id: rows[0].product_id,
            name: rows[0].product_name,
            description: rows[0].description,
            price: rows[0].price,
            is_active: rows[0].is_active,
            created_at: rows[0].product_created_at,
            category: {
                id: rows[0].category_id,
                name: rows[0].category_name,
            },
            images: rows
                .filter(r => r.image_id)
                .map(r => ({
                    id: r.image_id,
                    image_url: r.image_url,
                    is_primary: r.is_primary,
                })),
        };

        return NextResponse.json({
            success: true,
            message: "Product updated successfully",
            data: product
        }, { status: 200 });
    } catch (error) {
        console.error("Error Editing Products:", error);
        return NextResponse.json({ message: "Error In Backend API Call" });
    }
}

//Delete Product
export async function DELETE(request) {
    try {
        //Database Connection
        const connection = await getConnection();
        const body = await request.json();
        const { product_id } = body;

        if (!product_id) {
            return NextResponse.json({
                success: false,
                message: "Product id Not Found"
            }, { status: 400 });
        }

        //Check Product Exists & Is Active
        const [productRows] = await connection.execute(
            `SELECT id, is_active FROM products WHERE id = ?`,
            [product_id]
        );

        if (productRows.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Product not found."
            }, { status: 404 });
        }

        if (productRows[0].is_active) {
            return NextResponse.json({
                success: false,
                message: "Active products cannot be deleted. Please turn it off first."
            }, { status: 400 });
        }

        //Check if product is already ordered
        const [orderRows] = await connection.execute(
            `SELECT id FROM order_items WHERE product_id = ? LIMIT 1`,
            [product_id]
        );

        if (orderRows.length > 0) {
            return NextResponse.json({
                success: false,
                message: "The Product can not be deleted because the product is already ordered."
            }, { status: 400 });
        }

        //Delete related data
        // 1. Delete Product Images
        await connection.execute(
            `DELETE FROM product_images WHERE product_id = ?`,
            [product_id]
        );

        // 2. Delete from Cart Items
        await connection.execute(
            `DELETE FROM cart_items WHERE product_id = ?`,
            [product_id]
        );

        // 3. Delete product
        await connection.execute(
            `DELETE FROM products WHERE id = ?`,
            [product_id]
        );

        return NextResponse.json({
            success: true,
            message: "Product Deteled Successfully"
        }, { status: 200 });
    } catch (error) {
        console.error("Error Deleting Products:", error);
        return NextResponse.json({ message: "Error In Backend API Call" });
    }
}