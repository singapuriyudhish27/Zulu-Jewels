import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PaymentOption from "@/lib/models/PaymentOption";
import { verifyAdminFromRequest } from "@/lib/adminAuth";

// Add New Payment Method
export async function POST(request) {
    const auth = await verifyAdminFromRequest(request);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        const body = await request.json();
        const { category, bank_details, option_details, status } = body;

        if (!category) {
            return NextResponse.json({ success: false, message: "Category is required" }, { status: 400 });
        }

        await connectDB();
        const newMethod = await PaymentOption.create({
            category,
            bank_details: bank_details || null,
            option_details: option_details || null,
            status: status !== undefined ? status : true
        });


        return NextResponse.json({ success: true, message: "Payment Method added successfully", data: newMethod }, { status: 201 });
    } catch (error) {
        console.error("Error Adding Payment Method:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}

// Edit Payment Method (also used for toggling status)
export async function PUT(request) {
    const auth = await verifyAdminFromRequest(request);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id) {
            return NextResponse.json({ success: false, message: "Payment Method ID is required" }, { status: 400 });
        }

        await connectDB();

        // If only status is provided, just toggle active/inactive
        if (Object.keys(body).length === 2 && status !== undefined) {
            await PaymentOption.updateOne({ _id: id }, { status });
        } else {
            // Full update
            const { category, bank_details, option_details } = body;
            await PaymentOption.updateOne({ _id: id }, {
                category,
                bank_details: bank_details || null,
                option_details: option_details || null,
                status: status !== undefined ? status : true
            });
        }

        const updatedMethod = await PaymentOption.findById(id);


        return NextResponse.json({ success: true, message: "Payment Method updated successfully", data: updatedMethod }, { status: 200 });
    } catch (error) {
        console.error("Error Editing Payment Method:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}

// Delete Payment Method
export async function DELETE(request) {
    const auth = await verifyAdminFromRequest(request);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ success: false, message: "Payment Method ID is required" }, { status: 400 });
        }

        await connectDB();
        await PaymentOption.deleteOne({ _id: id });


        return NextResponse.json({ success: true, message: "Payment Method deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error Deleting Payment Method:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}