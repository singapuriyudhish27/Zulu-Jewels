import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Coupon from "@/lib/models/Coupon";
import Banner from "@/lib/models/Banner";
import ContentPage from "@/lib/models/ContentPage";
import { verifyAdminFromRequest } from "@/lib/adminAuth";

//Get The Marketing Data
export async function GET(req) {
    const auth = await verifyAdminFromRequest(req);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        await connectDB();

        const coupons = await Coupon.find().sort({ valid_until: -1 });
        const banners = await Banner.find().sort({ title: 1 });
        const contentPages = await ContentPage.find().sort({ updated_at: -1 });


        return NextResponse.json({
            success: true,
            data: {
                coupons,
                banners,
                content_pages: contentPages
            }
        }, { status: 200 });
    } catch (error) {
        console.error("Error Getting Marketing Data:", error);
        return NextResponse.json({ message: "Error In Backend API Call" }, { status: 500 });
    }
}

//Add New Coupon
export async function POST(req) {
    const auth = await verifyAdminFromRequest(req);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        await connectDB();
        const { coupon_code, discount, discount_type, min_order_amount, max_discount, valid_until, is_active } = await req.json();

        if (!coupon_code || !discount || !discount_type) {
            return NextResponse.json({ success: false, message: "Code, Discount, and Type are required" }, { status: 400 });
        }

        await Coupon.create({
            coupon_code,
            discount,
            discount_type,
            min_order_amount: min_order_amount || null,
            max_discount: max_discount || null,
            valid_until: valid_until || null,
            is_active: is_active !== undefined ? is_active : true
        });

        return NextResponse.json({ success: true, message: "Coupon added successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error Adding Coupon:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}

//Edit Coupon
export async function PUT(req) {
    const auth = await verifyAdminFromRequest(req);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        await connectDB();
        const { id, coupon_code, discount, discount_type, min_order_amount, max_discount, valid_until, is_active } = await req.json();

        if (!id || !coupon_code || !discount || !discount_type) {
            return NextResponse.json({ success: false, message: "ID, Code, Discount, and Type are required" }, { status: 400 });
        }

        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return NextResponse.json({ success: false, message: "Invalid Coupon ID format" }, { status: 400 });
        }

        await Coupon.updateOne({ _id: id }, {
            coupon_code,
            discount,
            discount_type,
            min_order_amount: min_order_amount || null,
            max_discount: max_discount || null,
            valid_until: valid_until || null,
            is_active: is_active !== undefined ? is_active : true
        });

        return NextResponse.json({ success: true, message: "Coupon updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error Editing Coupon:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}

//Delete Coupon
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

        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return NextResponse.json({ success: false, message: "Invalid Coupon ID format" }, { status: 400 });
        }

        await Coupon.deleteOne({ _id: id });

        return NextResponse.json({ success: true, message: "Coupon deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error Deleting Coupon:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}