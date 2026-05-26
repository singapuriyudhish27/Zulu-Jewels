import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import jwt from "jsonwebtoken";
import { validateAdminSlug } from "@/lib/adminSecurity";

export async function POST(req) {
    try {
        const body = await req.json();
        const { email, password, portalSlug } = body;

        if (!email || !password) {
            return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
        }

        //If Admin Login
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const slugValid = await validateAdminSlug(portalSlug);
            if (!slugValid) {
                return NextResponse.json(
                    { message: "Invalid admin access. Use your current admin portal link." },
                    { status: 401 }
                );
            }
            const token = jwt.sign(
                { userId: "admin", email: process.env.ADMIN_EMAIL, role: "admin" },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );
            const response = NextResponse.json({ message: "Admin login successful", user: {email, role: 'admin'} });
            response.cookies.set("zulu_jewels", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== "development",
                maxAge: 7 * 24 * 60 * 60, // 7 days,
                sameSite: 'strict'
            });
            return response;
        }

        //Get Connection
        await connectDB();
        //User Existence Check
        const user = await User.findOne({ email }).select('firstName lastName email phone password_hash role');

        if (!user) {
            return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
        }

        //Password Verification
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
        }

        //Generate JWT Token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        //Set Cookie
        const response = NextResponse.json({message: "Login successful", 
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
        response.cookies.set("zulu_jewels", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            maxAge: 7 * 24 * 60 * 60, // 7 days,
            sameSite: 'strict'
        });

        return response;
    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}