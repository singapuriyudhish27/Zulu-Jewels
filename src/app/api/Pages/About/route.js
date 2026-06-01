import { NextResponse } from "next/server";

export async function GET() {
    try {
        return NextResponse.json({message: "Backend API To Get Jewelery Workers."});
    } catch (error) {
        console.error("Error Getting Data:", error);
        return NextResponse.json({message: "Error In Backend API Call"}, { status: 500 });
    }
}