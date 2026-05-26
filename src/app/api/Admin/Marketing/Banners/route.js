import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Banner from "@/lib/models/Banner";

//Add New Banner
export async function POST(req) {
    try {
        await connectDB();
        const { title, location, status } = await req.json();

        if (!title) {
            return NextResponse.json({ success: false, message: "Title is required" }, { status: 400 });
        }

        await Banner.create({
            title,
            location: location || null,
            status: status !== undefined ? status : true
        });

        return NextResponse.json({ success: true, message: "Banner added successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error Adding Banner:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}

//Edit Banner
export async function PUT(req) {
    try {
        await connectDB();
        const { id, title, location, status } = await req.json();

        if (!id || !title) {
            return NextResponse.json({ success: false, message: "ID and Title are required" }, { status: 400 });
        }

        await Banner.updateOne({ _id: id }, {
            title,
            location: location || null,
            status: status !== undefined ? status : true
        });

        return NextResponse.json({ success: true, message: "Banner updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error Editing Banner:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}

//Delete Banner
export async function DELETE(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
        }

        await Banner.deleteOne({ _id: id });

        return NextResponse.json({ success: true, message: "Banner deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error Deleting Banner:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}