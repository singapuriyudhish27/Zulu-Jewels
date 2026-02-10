import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

//GET All Custom Products
export async function GET() {
    try {
        return NextResponse.json({ message: "Backend API To Get Custom Products Data."});
    } catch (error) {
        console.error("Error Getting Custom Products Data:", error);
        return NextResponse.json({
            success: false,
            message: "Error In Backend API Call"
        });
    }
}