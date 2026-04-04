import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

// Helper: verify token and return userId
async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("zulu_jewels")?.value;
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return null;
    }
}

// POST /api/Pages/Profile/Addresses  -> Add a new address
export async function POST(request) {
    try {
        const decoded = await getUser();
        if (!decoded) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { address_line, is_default } = await request.json();
        if (!address_line?.trim()) {
            return NextResponse.json({ message: "Address cannot be empty" }, { status: 400 });
        }

        const conn = await getConnection();

        // If this address is being set as default, clear any existing default first
        if (is_default) {
            await conn.execute(
                "UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?",
                [decoded.userId]
            );
        }

        const [result] = await conn.execute(
            "INSERT INTO user_addresses (user_id, address_line, is_default) VALUES (?, ?, ?)",
            [decoded.userId, address_line.trim(), is_default ? true : false]
        );

        return NextResponse.json({
            success: true,
            message: "Address saved successfully",
            id: result.insertId,
        }, { status: 201 });
    } catch (error) {
        console.error("Add Address API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH /api/Pages/Profile/Addresses  -> Set an address as default
export async function PATCH(request) {
    try {
        const decoded = await getUser();
        if (!decoded) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { id } = await request.json();
        if (!id) return NextResponse.json({ message: "Address ID required" }, { status: 400 });

        const conn = await getConnection();

        // Clear old default
        await conn.execute(
            "UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?",
            [decoded.userId]
        );

        // Set new default
        const [result] = await conn.execute(
            "UPDATE user_addresses SET is_default = TRUE WHERE id = ? AND user_id = ?",
            [id, decoded.userId]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "Address not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Default address updated" }, { status: 200 });
    } catch (error) {
        console.error("Set Default Address API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE /api/Pages/Profile/Addresses  -> Remove an address
export async function DELETE(request) {
    try {
        const decoded = await getUser();
        if (!decoded) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { id } = await request.json();
        if (!id) return NextResponse.json({ message: "Address ID required" }, { status: 400 });

        const conn = await getConnection();
        const [result] = await conn.execute(
            "DELETE FROM user_addresses WHERE id = ? AND user_id = ?",
            [id, decoded.userId]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "Address not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Address deleted" }, { status: 200 });
    } catch (error) {
        console.error("Delete Address API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
