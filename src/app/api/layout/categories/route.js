import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function GET() {
    try {
        const connection = await getConnection();
        const [rows] = await connection.execute("SELECT id, name FROM categories ORDER BY name ASC");
        
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
