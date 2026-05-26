import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/lib/models/Category";

export async function GET() {
    try {
        await connectDB();
        const rows = await Category.find().sort({ name: 1 }).select('name');
        
        return NextResponse.json({
            success: true,
            data: rows
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching layout categories:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Error fetching categories" 
        }, { status: 500 });
    }
}
