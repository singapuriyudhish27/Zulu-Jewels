import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

// Add New Payment Method
export async function POST(request) {
    try {
        const body = await request.json();
        const { category, bank_details, option_details, status } = body;

        if (!category) {
            return NextResponse.json({ success: false, message: "Category is required" }, { status: 400 });
        }

        const connection = await getConnection();
        const [result] = await connection.execute(
            `INSERT INTO payment_options (category, bank_details, option_details, status) VALUES (?, ?, ?, ?)`,
            [category, bank_details ? JSON.stringify(bank_details) : null, option_details ? JSON.stringify(option_details) : null, status !== undefined ? status : true]
        );

        const [newMethod] = await connection.execute(`SELECT * FROM payment_options WHERE id = ?`, [result.insertId]);

        console.log("✅ New Payment Method Added:", category);
        return NextResponse.json({ success: true, message: "Payment Method added successfully", data: newMethod[0] }, { status: 201 });
    } catch (error) {
        console.error("Error Adding Payment Method:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}

// Edit Payment Method (also used for toggling status)
export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id) {
            return NextResponse.json({ success: false, message: "Payment Method ID is required" }, { status: 400 });
        }

        const connection = await getConnection();

        // If only status is provided, just toggle active/inactive
        if (Object.keys(body).length === 2 && status !== undefined) {
            await connection.execute(
                `UPDATE payment_options SET status = ? WHERE id = ?`,
                [status, id]
            );
        } else {
            // Full update
            const { category, bank_details, option_details } = body;
            await connection.execute(
                `UPDATE payment_options SET category = ?, bank_details = ?, option_details = ?, status = ? WHERE id = ?`,
                [category, bank_details ? JSON.stringify(bank_details) : null, option_details ? JSON.stringify(option_details) : null, status !== undefined ? status : true, id]
            );
        }

        const [updatedMethod] = await connection.execute(`SELECT * FROM payment_options WHERE id = ?`, [id]);

        console.log("✅ Payment Method Updated, ID:", id);
        return NextResponse.json({ success: true, message: "Payment Method updated successfully", data: updatedMethod[0] }, { status: 200 });
    } catch (error) {
        console.error("Error Editing Payment Method:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}

// Delete Payment Method
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ success: false, message: "Payment Method ID is required" }, { status: 400 });
        }

        const connection = await getConnection();
        await connection.execute(`DELETE FROM payment_options WHERE id = ?`, [id]);

        console.log("✅ Payment Method Deleted, ID:", id);
        return NextResponse.json({ success: true, message: "Payment Method deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error Deleting Payment Method:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}