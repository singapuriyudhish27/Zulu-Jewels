import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import jwt from "jsonwebtoken";
import { validateAdminSlug } from "@/lib/adminSecurity";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
        if (!rateLimit(ip, 10, 60000)) {
            return NextResponse.json({ message: "Too many login attempts. Please try again in a minute." }, { status: 429 });
        }

        const body = await req.json();
        const { email, password, portalSlug } = body;

        if (!email || !password) {
            return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
        }

        const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!EMAIL_REGEX.test(email)) {
            return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
        }

        if (password.length > 72) {
            return NextResponse.json({ message: "Password exceeds maximum allowed length" }, { status: 400 });
        }

        //If Admin Login
        if (email === process.env.ADMIN_EMAIL) {
            let adminHash = process.env.ADMIN_PASSWORD_HASH;
            if (!adminHash) {
                if (process.env.NODE_ENV === "production") {
                    return NextResponse.json({ message: "Admin login misconfigured: Password hash missing" }, { status: 500 });
                }
                adminHash = "$2a$10$w8T0J4b9XNf.w1E4.mP8I.vF.aC2LpE03eH3U6k5M3/8C3e7F0yC6"; // Fallback hash for ZuluJewels@123
            }
            const isAdminPasswordValid = await bcrypt.compare(password, adminHash);
            if (!isAdminPasswordValid) {
                return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
            }

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
            response.cookies.set("zulu_jewels_admin", token, {
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