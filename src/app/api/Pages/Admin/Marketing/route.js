import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

//Get The Marketing Data
export async function GET() {
    try {
        const connection = await getConnection();

        //Database Table
        const [coupons] = await connection.execute(`
            SELECT * FROM coupons ORDER BY valid_until DESC
        `);

        const [banners] = await connection.execute(`
            SELECT * FROM banners ORDER BY title ASC
        `);

        const [contentPages] = await connection.execute(`
            SELECT * FROM content_pages ORDER BY updated_at DESC
        `);
        console.log("Backend API To Get Banners, Coupons & Content Pages.");

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
        return NextResponse.json({ message: "Error In Backend API Call" });
    }
}

//Add New Coupon
export async function POST(req) {
    try {
        const connection = await getConnection();
        const { coupon_code, discount, discount_type, min_order_amount, max_discount, valid_until, is_active } = await req.json();

        if (!coupon_code || !discount || !discount_type) {
            return NextResponse.json({ success: false, message: "Code, Discount, and Type are required" }, { status: 400 });
        }

        await connection.execute(
            `INSERT INTO coupons (coupon_code, discount, discount_type, min_order_amount, max_discount, valid_until, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [coupon_code, discount, discount_type, min_order_amount || null, max_discount || null, valid_until || null, is_active !== undefined ? is_active : true]
        );

        return NextResponse.json({ success: true, message: "Coupon added successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error Adding Coupon:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}

//Edit Coupon
export async function PUT(req) {
    try {
        const connection = await getConnection();
        const { id, coupon_code, discount, discount_type, min_order_amount, max_discount, valid_until, is_active } = await req.json();

        if (!id || !coupon_code || !discount || !discount_type) {
            return NextResponse.json({ success: false, message: "ID, Code, Discount, and Type are required" }, { status: 400 });
        }

        await connection.execute(
            `UPDATE coupons SET coupon_code = ?, discount = ?, discount_type = ?, min_order_amount = ?, max_discount = ?, valid_until = ?, is_active = ? 
             WHERE id = ?`,
            [coupon_code, discount, discount_type, min_order_amount || null, max_discount || null, valid_until || null, is_active !== undefined ? is_active : true, id]
        );

        return NextResponse.json({ success: true, message: "Coupon updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error Editing Coupon:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}

//Delete Coupon
export async function DELETE(req) {
    try {
        const connection = await getConnection();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
        }

        await connection.execute(
            `DELETE FROM coupons WHERE id = ?`,
            [id]
        );

        return NextResponse.json({ success: true, message: "Coupon deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error Deleting Coupon:", error);
        return NextResponse.json({ success: false, message: "Error In Backend API Call" }, { status: 500 });
    }
}