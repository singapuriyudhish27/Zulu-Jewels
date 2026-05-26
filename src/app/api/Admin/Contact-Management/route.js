import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function GET() {
    try {
        const connection = await getConnection();

        //Database Table
        const [rows] = await connection.execute(`
            SELECT
                i.id AS inquiry_id,
                i.inquiry_category,
                i.message,
                i.status AS inquiry_status,
                i.created_at AS inquiry_created_at,
                u.id AS user_id,
                u.firstName,
                u.lastName,
                u.email,
                u.phone,
                u.is_active,
                u.is_verified
            FROM inquiries i
            LEFT JOIN users u ON i.user_id = u.id
            ORDER BY i.id DESC;
        `);
        console.log("Backend API To Get Users & Inquiries.");

        //Group Data
        const inquiries = rows.map(row => ({
            userId: row.user_id,
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            phone: row.phone,
            is_active: row.is_active,
            is_verified: row.is_verified,
            inquiry: {
                id: row.inquiry_id,
                category: row.inquiry_category,
                message: row.message,
                status: row.inquiry_status,
                created_at: row.inquiry_created_at,
            }
        }));

        return NextResponse.json({
            success: true,
            data: inquiries,
            adminEmail: process.env.SMTP_USER
        }, { status: 200 });
    } catch (error) {
        console.error("Error Getting Inquiry Data:", error);
        return NextResponse.json({ message: "Error In Backend API Call" });
    }
}

export async function PUT(req) {
    try {
        const connection = await getConnection();
        const { id, status } = await req.json();

        if (!id || !status) {
            return NextResponse.json({ success: false, message: "ID and Status are required" }, { status: 400 });
        }

        await connection.execute(
            `UPDATE inquiries SET status = ? WHERE id = ?`,
            [status, id]
        );

        return NextResponse.json({ success: true, message: "Status updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error updating inquiry status:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const connection = await getConnection();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
        }

        await connection.execute(
            `DELETE FROM inquiries WHERE id = ?`,
            [id]
        );

        return NextResponse.json({ success: true, message: "Inquiry deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting inquiry:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}