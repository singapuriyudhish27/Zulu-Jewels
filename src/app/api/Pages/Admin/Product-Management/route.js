import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");

// Helper to save file
async function saveFile(file) {
    if (!file || typeof file === 'string') return file; // Return existing path if it's already a string
    try {
        await mkdir(UPLOAD_DIR, { recursive: true });
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
        const filePath = path.join(UPLOAD_DIR, fileName);
        await writeFile(filePath, buffer);
        return `/uploads/products/${fileName}`;
    } catch (error) {
        console.error("Error saving file:", error);
        return null;
    }
}

export async function GET() {
    try {
        const connection = await getConnection();

        //Fetching Categories
        const [categories] = await connection.execute(`
            SELECT * FROM categories
        `);

        // Database Table - Fetch products with categories
        const [rows] = await connection.execute(`
            SELECT
                p.id AS product_id,
                p.name AS product_name,
                p.description,
                p.price,
                p.material,
                p.gender,
                p.is_active,
                p.created_at AS product_created_at,
                c.id AS category_id,
                c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.created_at DESC
        `);

        // Group Data
        const products = [];

        for (const row of rows) {
            // Fetch Variants for this product
            const [variants] = await connection.execute(`
                SELECT * FROM product_variants WHERE product_id = ?
            `, [row.product_id]);

            // Fetch Images for this product (both generic and variant-specific)
            const [images] = await connection.execute(`
                SELECT * FROM product_images WHERE product_id = ?
            `, [row.product_id]);

            products.push({
                id: row.product_id,
                name: row.product_name,
                description: row.description,
                price: row.price,
                material: row.material,
                gender: row.gender,
                is_active: row.is_active,
                created_at: row.product_created_at,
                category: {
                    id: row.category_id,
                    name: row.category_name,
                },
                variants: variants,
                images: images
            });
        }

        return NextResponse.json({
            success: true,
            categories: categories,
            data: products,
        }, { status: 200 });
    } catch (error) {
        console.error("Error Getting Products Data:", error);
        return NextResponse.json({ message: "Error In Backend API Call" });
    }
}

//Add New Product
export async function POST(request) {
    try {
        const connection = await getConnection();
        const formData = await request.formData();

        const name = formData.get("name");
        const category_name = formData.get("category_name");
        const description = formData.get("description");
        const price = formData.get("price");
        const material = formData.get("material");
        const gender = formData.get("gender");
        const is_active = formData.get("is_active") === "true";
        
        const variantsJson = formData.get("variants");
        let variants = [];
        try { if (variantsJson) variants = JSON.parse(variantsJson); } catch (e) {}

        if (!category_name || !name || !price) {
            return NextResponse.json({ success: false, message: "Category, Name & Price Required." }, { status: 400 });
        }

        const [categoryRows] = await connection.execute(`SELECT id FROM categories WHERE name = ?`, [category_name]);
        if (categoryRows.length === 0) return NextResponse.json({ success: false, message: "Category Not Found" }, { status: 400 });
        const categoryId = categoryRows[0].id;

        const [productResult] = await connection.execute(`
            INSERT INTO products (category_id, name, description, price, material, gender, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [categoryId, name, description, price, material, gender, is_active]);

        const productId = productResult.insertId;

        // Process Variants
        for (let i = 0; i < variants.length; i++) {
            const v = variants[i];
            const [varResult] = await connection.execute(`
                INSERT INTO product_variants (product_id, material, description, price, stock) VALUES (?, ?, ?, ?, ?)
            `, [productId, v.material, v.description, v.price || price, v.stock || 0]);
            
            const variantId = varResult.insertId;

            // Save variant-specific media
            const variantFiles = formData.getAll(`media_variant_${i}`);
            const primaryIndex = parseInt(formData.get(`primary_index_variant_${i}`) || "0");

            for (let j = 0; j < variantFiles.length; j++) {
                const file = variantFiles[j];
                const mediaUrl = await saveFile(file);
                if (mediaUrl) {
                    const mediaType = file.type.startsWith("video/") ? "video" : "image";
                    await connection.execute(`
                        INSERT INTO product_images (product_id, variant_id, media_url, media_type, is_primary) VALUES (?, ?, ?, ?, ?)
                    `, [productId, variantId, mediaUrl, mediaType, j === primaryIndex]);
                }
            }
        }

        // Handle generic product media (if any)
        const genericFiles = formData.getAll("media");
        for (let i = 0; i < genericFiles.length; i++) {
            const mediaUrl = await saveFile(genericFiles[i]);
            if (mediaUrl) {
                const mediaType = genericFiles[i].type.startsWith("video/") ? "video" : "image";
                await connection.execute(`
                    INSERT INTO product_images (product_id, variant_id, media_url, media_type, is_primary) VALUES (?, NULL, ?, ?, ?)
                `, [productId, mediaUrl, mediaType, false]);
            }
        }

        return NextResponse.json({ success: true, message: "Product added successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error Adding Products:", error);
        return NextResponse.json({ message: "Error In Backend API Call" });
    }
}

//Edit Product
export async function PUT(request) {
    try {
        const connection = await getConnection();
        const formData = await request.formData();

        const id = formData.get("id");
        const name = formData.get("name");
        const category_name = formData.get("category_name");
        const description = formData.get("description");
        const price = formData.get("price");
        const material = formData.get("material");
        const gender = formData.get("gender");
        const is_active = formData.get("is_active") === "true";
        
        const variantsJson = formData.get("variants");
        let variants = [];
        try { if (variantsJson) variants = JSON.parse(variantsJson); } catch (e) {}

        if (!id) return NextResponse.json({ success: false, message: "Product Id Not Found" }, { status: 400 });

        let categoryId = null;
        if (category_name) {
            const [catRows] = await connection.execute(`SELECT id FROM categories WHERE name = ?`, [category_name]);
            if (catRows.length > 0) categoryId = catRows[0].id;
        }

        // Update Product Info
        const updates = [];
        const params = [];
        if (categoryId) { updates.push("category_id = ?"); params.push(categoryId); }
        if (name) { updates.push("name = ?"); params.push(name); }
        if (description !== null) { updates.push("description = ?"); params.push(description); }
        if (price) { updates.push("price = ?"); params.push(price); }
        if (material !== undefined) { updates.push("material = ?"); params.push(material); }
        if (gender !== undefined) { updates.push("gender = ?"); params.push(gender); }
        if (is_active !== undefined) { updates.push("is_active = ?"); params.push(is_active); }

        if (updates.length > 0) {
            await connection.execute(`UPDATE products SET ${updates.join(", ")} WHERE id = ?`, [...params, id]);
        }

        // --- Variant Syncing Logic ---
        // 1. Get current variant IDs
        const [currentVariants] = await connection.execute(`SELECT id FROM product_variants WHERE product_id = ?`, [id]);
        const currentVariantIds = currentVariants.map(v => v.id);
        const incomingVariantIds = variants.map(v => v.id).filter(vId => vId && typeof vId === 'number');

        // 2. Delete variants not in incoming list
        const toDelete = currentVariantIds.filter(vId => !incomingVariantIds.includes(vId));
        if (toDelete.length > 0) {
            // Note: Cascade will handle product_images DELETE
            await connection.execute(`DELETE FROM product_variants WHERE id IN (${toDelete.join(",")})`);
        }

        // 3. Update or Insert Variants
        for (let i = 0; i < variants.length; i++) {
            const v = variants[i];
            let variantId = v.id;

            if (variantId && typeof variantId === 'number') {
                // Update
                await connection.execute(`
                    UPDATE product_variants SET material = ?, description = ?, price = ?, stock = ? WHERE id = ?
                `, [v.material, v.description, v.price || price, v.stock || 0, variantId]);
            } else {
                // Insert
                const [insResult] = await connection.execute(`
                    INSERT INTO product_variants (product_id, material, description, price, stock) VALUES (?, ?, ?, ?, ?)
                `, [id, v.material, v.description, v.price || price, v.stock || 0]);
                variantId = insResult.insertId;
            }

            // 4. Media Management for this Variant
            const existingMedia = v.existing_media || [];
            const newFiles = formData.getAll(`media_variant_${i}`);
            const primaryIndex = parseInt(formData.get(`primary_index_variant_${i}`) || "0");

            // Clear existing variant images to re-sync (simpler)
            await connection.execute(`DELETE FROM product_images WHERE variant_id = ?`, [variantId]);

            let currentIndex = 0;
            // Re-insert kept media
            for (const media of existingMedia) {
                await connection.execute(`
                    INSERT INTO product_images (product_id, variant_id, media_url, media_type, is_primary) 
                    VALUES (?, ?, ?, ?, ?)
                `, [id, variantId, media.media_url, media.media_type, currentIndex === primaryIndex]);
                currentIndex++;
            }
            // Insert new media
            for (const file of newFiles) {
                const mediaUrl = await saveFile(file);
                if (mediaUrl) {
                    const mediaType = file.type.startsWith("video/") ? "video" : "image";
                    await connection.execute(`
                        INSERT INTO product_images (product_id, variant_id, media_url, media_type, is_primary) 
                        VALUES (?, ?, ?, ?, ?)
                    `, [id, variantId, mediaUrl, mediaType, currentIndex === primaryIndex]);
                    currentIndex++;
                }
            }
        }

        return NextResponse.json({ success: true, message: "Product updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error Editing Products:", error);
        return NextResponse.json({ message: "Error In Backend API Call" });
    }
}

//Delete Product
export async function DELETE(request) {
    try {
        const connection = await getConnection();
        const body = await request.json();
        const { product_id } = body;

        if (!product_id) return NextResponse.json({ success: false, message: "Product id Not Found" }, { status: 400 });

        const [productRows] = await connection.execute(`SELECT is_active FROM products WHERE id = ?`, [product_id]);
        if (productRows.length === 0) return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
        if (productRows[0].is_active) return NextResponse.json({ success: false, message: "Deactivate product first" }, { status: 400 });

        // Cascade delete handles variants and images
        await connection.execute(`DELETE FROM products WHERE id = ?`, [product_id]);

        return NextResponse.json({ success: true, message: "Product Deleted Successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error Deleting Products:", error);
        return NextResponse.json({ message: "Error In Backend API Call" });
    }
}