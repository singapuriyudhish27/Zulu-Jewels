import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ShippingZone from "@/lib/models/ShippingZone";
import { verifyAdminFromRequest } from "@/lib/adminAuth";

// Add New Shipping Zone
export async function POST(request) {
    const auth = await verifyAdminFromRequest(request);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        const body = await request.json();
        const { zone_name, areas, location, shipping_rate, delivery_time, status } = body;

        if (!zone_name) {
            return NextResponse.json({ success: false, message: "Zone name is required" }, { status: 400 });
        }

        await connectDB();
        const newZone = await ShippingZone.create({
            zone_name,
            areas: areas || '',
            location: location || '',
            shipping_rate: shipping_rate || 0,
            delivery_time: delivery_time || '',
            status: status !== undefined ? status : true
        });


        return NextResponse.json({ success: true, message: "Shipping Zone added successfully", data: newZone }, { status: 201 });
    } catch (error) {
        console.error("Error Adding Shipping Zone:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}

// Edit Shipping Zone
export async function PUT(request) {
    const auth = await verifyAdminFromRequest(request);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        const body = await request.json();
        const { id, zone_name, areas, location, shipping_rate, delivery_time, status } = body;

        if (!id) {
            return NextResponse.json({ success: false, message: "Zone ID is required" }, { status: 400 });
        }

        await connectDB();
        const updatedZone = await ShippingZone.findByIdAndUpdate(id, {
            zone_name,
            areas: areas || '',
            location: location || '',
            shipping_rate: shipping_rate || 0,
            delivery_time: delivery_time || '',
            status: status !== undefined ? status : true
        }, { new: true });


        return NextResponse.json({ success: true, message: "Shipping Zone updated successfully", data: updatedZone }, { status: 200 });
    } catch (error) {
        console.error("Error Editing Shipping Zone:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}

// Delete Shipping Zone
export async function DELETE(request) {
    const auth = await verifyAdminFromRequest(request);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ success: false, message: "Zone ID is required" }, { status: 400 });
        }

        await connectDB();
        await ShippingZone.deleteOne({ _id: id });


        return NextResponse.json({ success: true, message: "Shipping Zone deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error Deleting Shipping Zone:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}