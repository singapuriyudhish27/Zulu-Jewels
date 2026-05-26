import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ShippingZone from "@/lib/models/ShippingZone";

// Add New Shipping Zone
export async function POST(request) {
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

        console.log("✅ New Shipping Zone Added:", zone_name);
        return NextResponse.json({ success: true, message: "Shipping Zone added successfully", data: newZone }, { status: 201 });
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

        await connectDB();
        const updatedZone = await ShippingZone.findByIdAndUpdate(id, {
            zone_name,
            areas: areas || '',
            location: location || '',
            shipping_rate: shipping_rate || 0,
            delivery_time: delivery_time || '',
            status: status !== undefined ? status : true
        }, { new: true });

        console.log("✅ Shipping Zone Updated:", zone_name);
        return NextResponse.json({ success: true, message: "Shipping Zone updated successfully", data: updatedZone }, { status: 200 });
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

        await connectDB();
        await ShippingZone.deleteOne({ _id: id });

        console.log("✅ Shipping Zone Deleted, ID:", id);
        return NextResponse.json({ success: true, message: "Shipping Zone deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error Deleting Shipping Zone:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}