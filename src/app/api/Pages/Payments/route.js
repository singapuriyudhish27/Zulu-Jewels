import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function GET(request) {
    try {
        const connection = await getConnection();
        const [rows] = await connection.execute("SELECT * FROM payment_options");
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error fetching payments:", error);
        return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
    }
}