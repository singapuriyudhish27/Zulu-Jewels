import { getConnection } from "@/lib/db";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "categories");

// Helper to save file
async function saveFile(file) {
    if (!file || typeof file === 'string') return file;
    try {
        await mkdir(UPLOAD_DIR, { recursive: true });
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
        const filePath = path.join(UPLOAD_DIR, fileName);
        await writeFile(filePath, buffer);
        return `/uploads/categories/${fileName}`;
    } catch (error) {
        console.error("Error saving category image:", error);
        return null;
    }
}

//Add New Category
export async function POST(request) {
    try {
        const connection = await getConnection();
        const formData = await request.formData();
        
        const name = formData.get("name");
        const description = formData.get("description");
        const imageFile = formData.get("image");

        if (!name) {
            return NextResponse.json({
                success: false,
                message: "Category Name Is Required"
            }, { status: 400 });
        }

        const imageUrl = await saveFile(imageFile);

        //Check If Category Exists
        const [existing] = await connection.execute(`
            SELECT id FROM categories WHERE name = ?
        `, [name]);

        if (existing.length > 0) {
            return NextResponse.json({
                success: false,
                message: "Category already exists"
            }, { status: 409 });
        }

        //Insert Category
        const [result] = await connection.execute(`
            INSERT INTO categories (name, image_url, available_materials) VALUES (?, ?, ?)
        `, [name, imageUrl, JSON.stringify(["Gold", "Silver", "Diamond"])]); // Default materials for compatibility

        return NextResponse.json({
            success: true,
            message: "Category added successfully",
            data: {
                id: result.insertId,
                name,
                image_url: imageUrl,
                description
            }
        }, { status: 201 });
    } catch (error) {
        console.error("Error Adding Category:", error);
        return NextResponse.json({ message: "Error In Backend API Call" });
    }
}

//Update Category
export async function PUT(request) {
    try {
        const connection = await getConnection();
        const formData = await request.formData();
        
        const id = formData.get("id");
        const name = formData.get("name");
        const description = formData.get("description");
        const imageFile = formData.get("image");

        if (!id || !name) {
            return NextResponse.json({
                success: false,
                message: "Category ID and Name are required"
            }, { status: 400 });
        }

        let imageUrl = formData.get("image_url"); // Existing URL if no new file
        if (imageFile && typeof imageFile !== 'string') {
            imageUrl = await saveFile(imageFile);
        }

        // Check if another category with the same name exists (excluding current)
        const [existing] = await connection.execute(`
            SELECT id FROM categories WHERE name = ? AND id != ?
        `, [name, id]);

        if (existing.length > 0) {
            return NextResponse.json({
                success: false,
                message: "Another category with this name already exists"
            }, { status: 409 });
        }

        // Update Category
        await connection.execute(`
            UPDATE categories SET name = ?, image_url = ? WHERE id = ?
        `, [name, imageUrl, id]);

        return NextResponse.json({
            success: true,
            message: "Category updated successfully"
        }, { status: 200 });
    } catch (error) {
        console.error("Error Updating Category:", error);
        return NextResponse.json({ message: "Error In Backend API Call" });
    }
}



//Delete Category
export async function DELETE(request) {
    try {
        const connection = await getConnection();
        const body = await request.json();
        const { category_id } = body;

        if (!category_id) {
            return NextResponse.json({
                success: false,
                message: "Category Id Is Required"
            }, { status: 400 });
        }

        //Check Category Exists
        const [existing] = await connection.execute(`
            SELECT * FROM categories WHERE id = ?
        `, [category_id]);

        if (existing.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Category Not Found"
            }, { status: 404 });
        }

        //Check If Category Is Linked To Any Products
        const [products] = await connection.execute(`
            SELECT id FROM products WHERE category_id = ? LIMIT 1
        `, [category_id]);

        if (products.length > 0) {
            return NextResponse.json({
                success: false,
                message: "Cannot delete category. Products are linked to this category"
            }, { status: 409 });
        }

        //DELETE Category
        await connection.execute(`
            DELETE FROM categories WHERE id = ?
        `, [category_id]);

        return NextResponse.json({
            success: true,
            message: "Category deleted successfully"
        }, { status: 200 });
    } catch (error) {
        console.error("Error Deleting Category:", error);
        return NextResponse.json({ message: "Error In Backend API Call" });
    }
}