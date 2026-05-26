import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(req) {
    try {
        const body = await req.json();
        const { firstName, lastName, contact_number, email, password } = body;

        if (!firstName || !lastName || !contact_number || !email || !password) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        //Get Connection
        await connectDB();
        
        //User Existence Check
        const existingUser = await User.findOne({
            $or: [{ email }, { phone: contact_number }]
        });

        if (existingUser) {
            return NextResponse.json({ message: "User with this email or contact number already exists" }, { status: 409 });
        }

        //Password Hashing
        const hashedPassword = await bcrypt.hash(password, 10);

        //User Insertion
        const newUser = await User.create({
            firstName,
            lastName,
            phone: contact_number,
            email,
            password_hash: hashedPassword
        });

        return NextResponse.json({ message: "User registered successfully", userId: newUser._id }, { status: 201 });
    } catch (error) {
        console.error("Registeration Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}