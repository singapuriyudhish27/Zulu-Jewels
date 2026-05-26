import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

// Add New Shipping Partner
export async function POST(request) {
    try {
        const body = await request.json();
        const { partner_name, type, tracking_url, status } = body;

        if (!partner_name) {
            return NextResponse.json({ success: false, message: "Partner name is required" }, { status: 400 });
        }

        const connection = await getConnection();
        const [result] = await connection.execute(
            `INSERT INTO shipping_partners (partner_name, type, tracking_url, status)
             VALUES (?, ?, ?, ?)`,
            [partner_name, type || '', tracking_url || '', status !== undefined ? status : true]
        );

        const [newPartner] = await connection.execute(`SELECT * FROM shipping_partners WHERE id = ?`, [result.insertId]);

        console.log("✅ New Shipping Partner Added:", partner_name);
        return NextResponse.json({ success: true, message: "Shipping Partner added successfully", data: newPartner[0] }, { status: 201 });
    } catch (error) {
        console.error("Error Adding Shipping Partner:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}

// Edit Shipping Partner
export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, partner_name, type, tracking_url, status } = body;

        if (!id) {
            return NextResponse.json({ success: false, message: "Partner ID is required" }, { status: 400 });
        }

        const connection = await getConnection();
        await connection.execute(
            `UPDATE shipping_partners SET partner_name = ?, type = ?, tracking_url = ?, status = ? WHERE id = ?`,
            [partner_name, type || '', tracking_url || '', status !== undefined ? status : true, id]
        );

        const [updatedPartner] = await connection.execute(`SELECT * FROM shipping_partners WHERE id = ?`, [id]);

        console.log("✅ Shipping Partner Updated:", partner_name);
        return NextResponse.json({ success: true, message: "Shipping Partner updated successfully", data: updatedPartner[0] }, { status: 200 });
    } catch (error) {
        console.error("Error Editing Shipping Partner:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}

// Delete Shipping Partner
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ success: false, message: "Partner ID is required" }, { status: 400 });
        }

        const connection = await getConnection();
        await connection.execute(`DELETE FROM shipping_partners WHERE id = ?`, [id]);

        console.log("✅ Shipping Partner Deleted, ID:", id);
        return NextResponse.json({ success: true, message: "Shipping Partner deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error Deleting Shipping Partner:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}