import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import UserAddress from "@/lib/models/UserAddress";

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
        const MAX_ADDRESS_LEN = 500;
        if (!address_line?.trim()) {
            return NextResponse.json({ message: "Address cannot be empty" }, { status: 400 });
        }
        if (address_line.trim().length > MAX_ADDRESS_LEN) {
            return NextResponse.json({ message: `Address must not exceed ${MAX_ADDRESS_LEN} characters` }, { status: 400 });
        }
        await connectDB();

        // If this address is being set as default, clear any existing default first
        if (is_default) {
            await UserAddress.updateMany(
                { user_id: decoded.userId },
                { is_default: false }
            );
        }

        const newAddress = await UserAddress.create({
            user_id: decoded.userId,
            address_line: address_line.trim(),
            is_default: is_default ? true : false
        });

        return NextResponse.json({
            success: true,
            message: "Address saved successfully",
            id: newAddress._id,
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

        await connectDB();

        // Clear old default
        await UserAddress.updateMany(
            { user_id: decoded.userId },
            { is_default: false }
        );

        // Set new default
        const result = await UserAddress.updateOne(
            { _id: id, user_id: decoded.userId },
            { is_default: true }
        );

        if (result.matchedCount === 0) {
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

        await connectDB();
        const result = await UserAddress.deleteOne({ _id: id, user_id: decoded.userId });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: "Address not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Address deleted" }, { status: 200 });
    } catch (error) {
        console.error("Delete Address API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
