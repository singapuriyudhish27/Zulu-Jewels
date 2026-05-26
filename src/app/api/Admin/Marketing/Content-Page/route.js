import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ContentPage from "@/lib/models/ContentPage";

//Add New Content Page
export async function POST(req) {
    try {
        await connectDB();
        const { page_name, url, content, status } = await req.json();

        if (!page_name || !url) {
            return NextResponse.json({ success: false, message: "Page name and URL are required" }, { status: 400 });
        }

        await ContentPage.create({
            page_name,
            url,
            content: content || null,
            status: status !== undefined ? status : true
        });

        return NextResponse.json({ success: true, message: "Content page added successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error Adding Content Page:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}

//Edit Content Page
export async function PUT(req) {
    try {
        await connectDB();
        const { id, page_name, url, content, status } = await req.json();

        if (!id || !page_name || !url) {
            return NextResponse.json({ success: false, message: "ID, Page name and URL are required" }, { status: 400 });
        }

        await ContentPage.updateOne({ _id: id }, {
            page_name,
            url,
            content: content || null,
            status: status !== undefined ? status : true
        });

        return NextResponse.json({ success: true, message: "Content page updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error Editing Content Page:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}

//Delete Content Page
export async function DELETE(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
        }

        await ContentPage.deleteOne({ _id: id });

        return NextResponse.json({ success: true, message: "Content page deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error Deleting Content Page:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}