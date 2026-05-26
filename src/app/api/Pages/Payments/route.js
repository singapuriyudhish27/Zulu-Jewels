import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PaymentOption from "@/lib/models/PaymentOption";

export async function GET(request) {
    try {
        await connectDB();
        const rows = await PaymentOption.find();
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error fetching payments:", error);
        return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
    }
}