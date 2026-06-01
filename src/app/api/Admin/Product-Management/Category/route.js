import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/lib/models/Category";
import Product from "@/lib/models/Product";
import { saveFile } from "@/lib/storage";
import { verifyAdminFromRequest } from "@/lib/adminAuth";

// Helper removed - now using centralized storage utility

//Add New Category
export async function POST(request) {
    const auth = await verifyAdminFromRequest(request);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        await connectDB();
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

        const imageUrl = await saveFile(imageFile, "categories");

        //Check If Category Exists
        const existing = await Category.findOne({ name });

        if (existing) {
            return NextResponse.json({
                success: false,
                message: "Category already exists"
            }, { status: 409 });
        }

        //Insert Category
        const newCategory = await Category.create({
            name,
            image_url: imageUrl,
            description,
            available_materials: ["Gold", "Silver", "Diamond"] // Default materials for compatibility
        });

        return NextResponse.json({
            success: true,
            message: "Category added successfully",
            data: {
                id: newCategory._id,
                name,
                image_url: imageUrl,
                description
            }
        }, { status: 201 });
    } catch (error) {
        console.error("Error Adding Category:", error);
        return NextResponse.json({ message: "Error In Backend API Call" }, { status: 500 });
    }
}

//Update Category
export async function PUT(request) {
    const auth = await verifyAdminFromRequest(request);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        await connectDB();
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
            imageUrl = await saveFile(imageFile, "categories");
        }

        // Check if another category with the same name exists (excluding current)
        const existing = await Category.findOne({ name, _id: { $ne: id } });

        if (existing) {
            return NextResponse.json({
                success: false,
                message: "Another category with this name already exists"
            }, { status: 409 });
        }

        // Update Category
        await Category.updateOne({ _id: id }, { name, image_url: imageUrl, description });

        return NextResponse.json({
            success: true,
            message: "Category updated successfully"
        }, { status: 200 });
    } catch (error) {
        console.error("Error Updating Category:", error);
        return NextResponse.json({ message: "Error In Backend API Call" }, { status: 500 });
    }
}



//Delete Category
export async function DELETE(request) {
    const auth = await verifyAdminFromRequest(request);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        await connectDB();
        const body = await request.json();
        const { category_id } = body;

        if (!category_id) {
            return NextResponse.json({
                success: false,
                message: "Category Id Is Required"
            }, { status: 400 });
        }

        //Check Category Exists
        const existing = await Category.findById(category_id);

        if (!existing) {
            return NextResponse.json({
                success: false,
                message: "Category Not Found"
            }, { status: 404 });
        }

        //Check If Category Is Linked To Any Products
        const productCount = await Product.countDocuments({ category_id });

        if (productCount > 0) {
            return NextResponse.json({
                success: false,
                message: "Cannot delete category. Products are linked to this category"
            }, { status: 409 });
        }

        //DELETE Category
        await Category.deleteOne({ _id: category_id });

        return NextResponse.json({
            success: true,
            message: "Category deleted successfully"
        }, { status: 200 });
    } catch (error) {
        console.error("Error Deleting Category:", error);
        return NextResponse.json({ message: "Error In Backend API Call" }, { status: 500 });
    }
}