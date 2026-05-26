import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Inquiry from "@/lib/models/Inquiry";
import User from "@/lib/models/User";

export async function GET() {
    try {
        await connectDB();

        const inquiries = await Inquiry.find().sort({ _id: -1 });
        console.log("Backend API To Get Users & Inquiries.");

        const data = [];
        for (const i of inquiries) {
            let user = null;
            if (i.user_id) {
                user = await User.findById(i.user_id).select('firstName lastName email phone is_active is_verified');
            }

            data.push({
                userId: user?._id || null,
                firstName: user?.firstName || null,
                lastName: user?.lastName || null,
                email: user?.email || null,
                phone: user?.phone || null,
                is_active: user?.is_active ?? null,
                is_verified: user?.is_verified ?? null,
                inquiry: {
                    id: i._id,
                    category: i.inquiry_category,
                    message: i.message,
                    status: i.status,
                    created_at: i.created_at,
                }
            });
        }

        return NextResponse.json({
            success: true,
            data,
            adminEmail: process.env.SMTP_USER
        }, { status: 200 });
    } catch (error) {
        console.error("Error Getting Inquiry Data:", error);
        return NextResponse.json({ message: "Error In Backend API Call" });
    }
}

export async function PUT(req) {
    try {
        await connectDB();
        const { id, status } = await req.json();

        if (!id || !status) {
            return NextResponse.json({ success: false, message: "ID and Status are required" }, { status: 400 });
        }

        await Inquiry.updateOne({ _id: id }, { status });

        return NextResponse.json({ success: true, message: "Status updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error updating inquiry status:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
        }

        await Inquiry.deleteOne({ _id: id });

        return NextResponse.json({ success: true, message: "Inquiry deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting inquiry:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}