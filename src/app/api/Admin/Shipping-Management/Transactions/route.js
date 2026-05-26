import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transaction from "@/lib/models/Transaction";

// Download Receipt - Get Transaction Details by ID
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ success: false, message: "Transaction ID is required" }, { status: 400 });
        }

        await connectDB();
        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });
        }

        // Ensure the transaction is eligible for a receipt (e.g., Completed/Success)
        if (transaction.status !== "Completed" && transaction.status !== "Success") {
            return NextResponse.json({ success: false, message: "Receipt available only for completed transactions" }, { status: 400 });
        }

        // Generate a text-based receipt content
        const receiptContent = `
========================================
           ZULU JEWELS RECEIPT
========================================

Transaction ID : TXN${transaction._id.toString().slice(-3).toUpperCase()}
Date           : ${new Date(transaction.created_at).toLocaleString()}
Status         : ${transaction.status}

----------------------------------------
Order Details:
Order ID       : ORD-${new Date(transaction.created_at).getFullYear()}-${transaction.order_id}
Amount Paid    : ₹${parseFloat(transaction.amount).toFixed(2)}
Payment Method : ${transaction.payment_method}

----------------------------------------
Thank you for shopping with Zulu Jewels!
For support, contact: support@zulujewels.com
========================================
        `.trim();

        return new NextResponse(receiptContent, {
            headers: {
                "Content-Type": "text/plain",
                "Content-Disposition": `attachment; filename="receipt_${transaction._id}.txt"`,
            },
        });

    } catch (error) {
        console.error("Error Fetching Transaction Receipt:", error);
        return NextResponse.json({ success: false, message: "Error generating receipt" }, { status: 500 });
    }
}
