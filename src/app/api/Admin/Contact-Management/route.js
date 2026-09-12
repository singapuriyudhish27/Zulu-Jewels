import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Inquiry from "@/lib/models/Inquiry";
import User from "@/lib/models/User";
import { verifyAdminFromRequest } from "@/lib/adminAuth";

export async function GET(req) {
    const auth = await verifyAdminFromRequest(req);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        await connectDB();

        const url = new URL(req.url);
        const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
        const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "20", 10), 1), 100);
        const skip = (page - 1) * limit;

        const totalInquiries = await Inquiry.countDocuments();
        const inquiries = await Inquiry.find().sort({ _id: -1 }).skip(skip).limit(limit).lean();


        const userIds = inquiries.map(i => i.user_id).filter(Boolean);

        // Fetch users in bulk
        const users = await User.find({ _id: { $in: userIds } })
            .select('firstName lastName email phone is_active is_verified')
            .lean();
        
        const usersMap = {};
        for (const u of users) {
            usersMap[u._id.toString()] = u;
        }

        const data = inquiries.map(i => {
            const user = i.user_id ? usersMap[i.user_id.toString()] : null;

            // Prefer dedicated schema fields; fall back to linked User document
            const contactName  = i.name  || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : null) || null;
            const contactEmail = i.email || user?.email || null;
            const contactPhone = i.phone || user?.phone || null;

            return {
                userId: user?._id || null,
                firstName: user?.firstName || null,
                lastName: user?.lastName || null,
                email: contactEmail,
                phone: contactPhone,
                name: contactName,
                is_active: user?.is_active ?? null,
                is_verified: user?.is_verified ?? null,
                inquiry: {
                    id: i._id,
                    category: i.inquiry_category,
                    message: i.message,
                    status: i.status,
                    created_at: i.created_at,
                }
            };
        });

        return NextResponse.json({
            success: true,
            data,
            pagination: {
                totalInquiries,
                totalPages: Math.ceil(totalInquiries / limit),
                currentPage: page,
                limit
            }
        }, { status: 200 });
    } catch (error) {
        console.error("Error Getting Inquiry Data:", error);
        return NextResponse.json({ message: "Error In Backend API Call" }, { status: 500 });
    }
}

export async function PUT(req) {
    const auth = await verifyAdminFromRequest(req);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
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
    const auth = await verifyAdminFromRequest(req);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
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