import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ShippingZone from "@/lib/models/ShippingZone";
import ShippingPartner from "@/lib/models/ShippingPartner";
import PaymentOption from "@/lib/models/PaymentOption";
import Transaction from "@/lib/models/Transaction";

import { verifyAdminFromRequest } from "@/lib/adminAuth";

//Get The Shipping & Payment Data
export async function GET(req) {
    const auth = await verifyAdminFromRequest(req);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        await connectDB();

        const shippingZones = await ShippingZone.find().sort({ zone_name: 1 });
        const shippingPartners = await ShippingPartner.find().sort({ partner_name: 1 });
        const paymentOptions = await PaymentOption.find().sort({ category: 1 });
        const transactions = await Transaction.find().sort({ created_at: -1 });

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