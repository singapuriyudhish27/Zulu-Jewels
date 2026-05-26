import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

//Get The Shipping & Payment Data
export async function GET() {
    try {
        const connection = await getConnection();

        //Database Tables
        const [shippingZones] = await connection.execute(`
            SELECT * FROM shipping_zones ORDER BY zone_name ASC
        `);

        const [shippingPartners] = await connection.execute(`
            SELECT * FROM shipping_partners ORDER BY partner_name ASC
        `);

        const [paymentOptions] = await connection.execute(`
            SELECT * FROM payment_options ORDER BY category ASC
        `);

        const [transactions] = await connection.execute(`
            SELECT * FROM transactions ORDER BY created_at DESC
        `);

        console.log("Backend API To Get Shipping Zones, Shipping Partners, Payment Options & Transactions.");
        return NextResponse.json({
            success: true,
            data: {
                shipping_zones: shippingZones,
                shipping_partners: shippingPartners,
                payment_options: paymentOptions,
                transactions: transactions,
            }
        }, { status: 200 });
    } catch (error) {
        console.error("Error Getting Shipping & Payment Data:", error);
        return NextResponse.json({ message: "Error In Backend API Call" });
    }
}