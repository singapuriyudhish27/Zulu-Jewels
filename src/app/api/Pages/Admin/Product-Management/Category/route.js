import { getConnection } from "@/lib/db";
import { NextResponse } from "next/server";

//Add New Category
export async function POST(request) {
    try {
        //Database Connection
        const connection = await getConnection();
        const body = await request.json();
        const { name, available_materials } = body;

        if (!name || !available_materials) {
            return NextResponse.json({
                success: false,
                message: "Category Name Is Required"
            }, { status: 400 });
        }

        // Validate material value
        const allowedMaterials = ["Gold", "Silver", "Diamond"];
        if (!allowedMaterials.includes(available_materials)) {
            return NextResponse.json({
                success: false,
                message: "Invalid material. Allowed: Gold, Silver, Diamond."
            }, { status: 400 });
        }

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
            INSERT INTO categories (name, available_materials) VALUES (?, ?)
        `, [name, available_materials]);

        return NextResponse.json({
            success: true,
            message: "Category added successfully",
            data: {
                id: result.insertId,
                name,
                available_materials
            }
        }, { status: 201 });
    } catch (error) {
        console.error("Error Adding Category:", error);
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