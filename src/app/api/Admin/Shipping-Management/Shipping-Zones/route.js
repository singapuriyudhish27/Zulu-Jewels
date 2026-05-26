import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

// Add New Shipping Zone
export async function POST(request) {
    try {
        const body = await request.json();
        const { zone_name, areas, location, shipping_rate, delivery_time, status } = body;

        if (!zone_name) {
            return NextResponse.json({ success: false, message: "Zone name is required" }, { status: 400 });
        }

        const connection = await getConnection();
        const [result] = await connection.execute(
            `INSERT INTO shipping_zones (zone_name, areas, location, shipping_rate, delivery_time, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [zone_name, areas || '', location || '', shipping_rate || 0, delivery_time || '', status !== undefined ? status : true]
        );

        const [newZone] = await connection.execute(`SELECT * FROM shipping_zones WHERE id = ?`, [result.insertId]);

        console.log("✅ New Shipping Zone Added:", zone_name);
        return NextResponse.json({ success: true, message: "Shipping Zone added successfully", data: newZone[0] }, { status: 201 });
    } catch (error) {
        console.error("Error Adding Shipping Zone:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}

// Edit Shipping Zone
export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, zone_name, areas, location, shipping_rate, delivery_time, status } = body;

        if (!id) {
            return NextResponse.json({ success: false, message: "Zone ID is required" }, { status: 400 });
        }

        const connection = await getConnection();
        await connection.execute(
            `UPDATE shipping_zones SET zone_name = ?, areas = ?, location = ?, shipping_rate = ?, delivery_time = ?, status = ? WHERE id = ?`,
            [zone_name, areas || '', location || '', shipping_rate || 0, delivery_time || '', status !== undefined ? status : true, id]
        );

        const [updatedZone] = await connection.execute(`SELECT * FROM shipping_zones WHERE id = ?`, [id]);

        console.log("✅ Shipping Zone Updated:", zone_name);
        return NextResponse.json({ success: true, message: "Shipping Zone updated successfully", data: updatedZone[0] }, { status: 200 });
    } catch (error) {
        console.error("Error Editing Shipping Zone:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}

// Delete Shipping Zone
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ success: false, message: "Zone ID is required" }, { status: 400 });
        }

        const connection = await getConnection();
        await connection.execute(`DELETE FROM shipping_zones WHERE id = ?`, [id]);

        console.log("✅ Shipping Zone Deleted, ID:", id);
        return NextResponse.json({ success: true, message: "Shipping Zone deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error Deleting Shipping Zone:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}