import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
        if (!rateLimit(ip, 5, 60000)) {
            return NextResponse.json({ message: "Too many registration attempts. Please try again in a minute." }, { status: 429 });
        }

        const body = await req.json();
        const { firstName, lastName, contact_number, email, password } = body;

        if (!firstName || !lastName || !contact_number || !email || !password) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!EMAIL_REGEX.test(email)) {
            return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
        }

        if (firstName.trim().length > 100 || lastName.trim().length > 100) {
            return NextResponse.json({ message: "Name fields must not exceed 100 characters" }, { status: 400 });
        }

        if (!/^\+?[\d\s\-()]{7,20}$/.test(contact_number)) {
            return NextResponse.json({ message: "Invalid phone number format" }, { status: 400 });
        }

        if (password.length < 8 || password.length > 72) {
            return NextResponse.json({ message: "Password must be between 8 and 72 characters long" }, { status: 400 });
        }

        //Get Connection
        await connectDB();


        
        const normalizedEmail = email.toLowerCase().trim();

        //User Existence Check
        const existingUser = await User.findOne({
            $or: [{ email: normalizedEmail }, { phone: contact_number }]
        });

        if (existingUser) {
            return NextResponse.json({ message: "User with this email or contact number already exists" }, { status: 409 });
        }

        //Password Hashing
        const hashedPassword = await bcrypt.hash(password, 10);

        //User Insertion
        const newUser = await User.create({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: contact_number,
            email: normalizedEmail,
            password_hash: hashedPassword
        });

        return NextResponse.json({ message: "User registered successfully", userId: newUser._id }, { status: 201 });
    } catch (error) {
        console.error("Registeration Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}