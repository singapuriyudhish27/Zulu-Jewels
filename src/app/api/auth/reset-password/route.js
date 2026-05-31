import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
    try {
        const { email, token, newPassword } = await req.json();

        if (!email || !token || !newPassword) {
            return NextResponse.json({ message: "Email, token, and new password are required" }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ message: "Password must be at least 8 characters long" }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Verify the JWT token using the dynamic secret (JWT_SECRET + current password hash)
        const tokenSecret = process.env.JWT_SECRET + user.password_hash;
        try {
            jwt.verify(token, tokenSecret);
        } catch (err) {
            console.error("JWT password reset verification failed:", err.message);
            return NextResponse.json({ message: "The password reset link is invalid or has expired." }, { status: 400 });
        }

        // Hash new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await User.updateOne({ email }, { password_hash: hashedPassword });

        return NextResponse.json({ message: "Password updated successfully. You can now log in." }, { status: 200 });

    } catch (error) {
        console.error("Password reset route error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
