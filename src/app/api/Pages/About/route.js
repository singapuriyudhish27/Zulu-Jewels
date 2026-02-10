import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function GET() {
    try {
        return NextResponse.json({message: "Backend API To Get Jewelery Workers."});
    } catch (error) {
        console.error("Error Getting Data:", error);
        return NextResponse.json({message: "Error In Backend API Call"});
    }
}