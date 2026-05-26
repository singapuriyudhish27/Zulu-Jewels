import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

//Add New Content Page
export async function POST(req) {
    try {
        const connection = await getConnection();
        const { page_name, url, content, status } = await req.json();

        if (!page_name || !url) {
            return NextResponse.json({ success: false, message: "Page name and URL are required" }, { status: 400 });
        }

        await connection.execute(
            `INSERT INTO content_pages (page_name, url, content, status) VALUES (?, ?, ?, ?)`,
            [page_name, url, content || null, status !== undefined ? status : true]
        );

        return NextResponse.json({ success: true, message: "Content page added successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error Adding Content Page:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}

//Edit Content Page
export async function PUT(req) {
    try {
        const connection = await getConnection();
        const { id, page_name, url, content, status } = await req.json();

        if (!id || !page_name || !url) {
            return NextResponse.json({ success: false, message: "ID, Page name and URL are required" }, { status: 400 });
        }

        await connection.execute(
            `UPDATE content_pages SET page_name = ?, url = ?, content = ?, status = ? WHERE id = ?`,
            [page_name, url, content || null, status !== undefined ? status : true, id]
        );

        return NextResponse.json({ success: true, message: "Content page updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error Editing Content Page:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}

//Delete Content Page
export async function DELETE(req) {
    try {
        const connection = await getConnection();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
        }

        await connection.execute(
            `DELETE FROM content_pages WHERE id = ?`,
            [id]
        );

        return NextResponse.json({ success: true, message: "Content page deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error Deleting Content Page:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}