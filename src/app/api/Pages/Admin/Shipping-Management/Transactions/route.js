import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

// Download Receipt - Get Transaction Details by ID
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ success: false, message: "Transaction ID is required" }, { status: 400 });
        }

        const connection = await getConnection();
        const [transactions] = await connection.execute(
            `SELECT * FROM transactions WHERE id = ?`,
            [id]
        );

        if (transactions.length === 0) {
            return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });
        }

        const transaction = transactions[0];

        // Ensure the transaction is eligible for a receipt (e.g., Completed/Success)
        if (transaction.status !== "Completed" && transaction.status !== "Success") {
            return NextResponse.json({ success: false, message: "Receipt available only for completed transactions" }, { status: 400 });
        }

        // Generate a text-based receipt content
        const receiptContent = `
========================================
           ZULU JEWELS RECEIPT
========================================

Transaction ID : TXN${transaction.id.toString().padStart(3, '0')}
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

        // Check if the request is for downloading (could check header or query param, but returning text/plain is usually fine for download if configured on frontend)
        // Alternatively, we can return JSON with the content, and let frontend handle blob creation.
        // Or return a Response with headers for download.
        
        // Let's return JSON data and let frontend handle the file download blob creation for better UX (no page refresh).
        // BUT, the user asked for a "Backend Route" that handles it. Usually this implies the backend serves the file.
        // Let's return a proper response with Content-Disposition attachment if desired, or just data.
        // The prompt says "download the Receipt", so serving a file stream is robust.

        // However, a simple text return is easiest to debug. Let's return JSON with receipt content.
        // Wait, normally a backend route for download should return the file stream.
        
        return new NextResponse(receiptContent, {
            headers: {
                "Content-Type": "text/plain",
                "Content-Disposition": `attachment; filename="receipt_${transaction.id}.txt"`,
            },
        });

    } catch (error) {
        console.error("Error Fetching Transaction Receipt:", error);
        return NextResponse.json({ success: false, message: "Error generating receipt" }, { status: 500 });
    }
}
