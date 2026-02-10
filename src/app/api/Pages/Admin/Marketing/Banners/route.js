import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

//Add New Banner
export async function POST(req) {
    try {
        const connection = await getConnection();
        const { title, location, status } = await req.json();

        if (!title) {
            return NextResponse.json({ success: false, message: "Title is required" }, { status: 400 });
        }

        await connection.execute(
            `INSERT INTO banners (title, location, status) VALUES (?, ?, ?)`,
            [title, location || null, status !== undefined ? status : true]
        );

        return NextResponse.json({ success: true, message: "Banner added successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error Adding Banner:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}

//Edit Banner
export async function PUT(req) {
    try {
        const connection = await getConnection();
        const { id, title, location, status } = await req.json();

        if (!id || !title) {
            return NextResponse.json({ success: false, message: "ID and Title are required" }, { status: 400 });
        }

        await connection.execute(
            `UPDATE banners SET title = ?, location = ?, status = ? WHERE id = ?`,
            [title, location || null, status !== undefined ? status : true, id]
        );

        return NextResponse.json({ success: true, message: "Banner updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error Editing Banner:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}

//Delete Banner
export async function DELETE(req) {
    try {
        const connection = await getConnection();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
        }

        await connection.execute(
            `DELETE FROM banners WHERE id = ?`,
            [id]
        );

        return NextResponse.json({ success: true, message: "Banner deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error Deleting Banner:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}