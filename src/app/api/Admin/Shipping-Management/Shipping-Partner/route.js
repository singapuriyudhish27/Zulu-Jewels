import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ShippingPartner from "@/lib/models/ShippingPartner";
import { verifyAdminFromRequest } from "@/lib/adminAuth";

// Add New Shipping Partner
export async function POST(request) {
    const auth = await verifyAdminFromRequest(request);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        const body = await request.json();
        const { partner_name, type, tracking_url, delivery_days, status } = body;

        if (!partner_name) {
            return NextResponse.json({ success: false, message: "Partner name is required" }, { status: 400 });
        }

        await connectDB();
        const newPartner = await ShippingPartner.create({
            partner_name,
            type: type || '',
            tracking_url: tracking_url || '',
            delivery_days: delivery_days !== undefined ? Number(delivery_days) : 7,
            status: status !== undefined ? status : true
        });


        return NextResponse.json({ success: true, message: "Shipping Partner added successfully", data: newPartner }, { status: 201 });
    } catch (error) {
        console.error("Error Adding Shipping Partner:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}

// Edit Shipping Partner
export async function PUT(request) {
    const auth = await verifyAdminFromRequest(request);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        const body = await request.json();
        const { id, partner_name, type, tracking_url, delivery_days, status } = body;

        if (!id) {
            return NextResponse.json({ success: false, message: "Partner ID is required" }, { status: 400 });
        }

        await connectDB();
        const updatedPartner = await ShippingPartner.findByIdAndUpdate(id, {
            partner_name,
            type: type || '',
            tracking_url: tracking_url || '',
            delivery_days: delivery_days !== undefined ? Number(delivery_days) : 7,
            status: status !== undefined ? status : true
        }, { new: true });


        return NextResponse.json({ success: true, message: "Shipping Partner updated successfully", data: updatedPartner }, { status: 200 });
    } catch (error) {
        console.error("Error Editing Shipping Partner:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}

// Delete Shipping Partner
export async function DELETE(request) {
    const auth = await verifyAdminFromRequest(request);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ success: false, message: "Partner ID is required" }, { status: 400 });
        }

        await connectDB();
        await ShippingPartner.deleteOne({ _id: id });


        return NextResponse.json({ success: true, message: "Shipping Partner deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error Deleting Shipping Partner:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}