import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {getConnection} from "@/lib/db";

export async function POST(req) {
    try {
        const body = await req.json();
        const { firstName, lastName, contact_number, email, password } = body;

        if (!firstName || !lastName || !contact_number || !email || !password) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        //Get Connection
        const conn = await getConnection();
        
        //User Existence Check
        const [existingUser] = await conn.execute(
            "SELECT id FROM users WHERE email = ? OR phone = ?",
            [email, contact_number]
        );

        if (existingUser.length > 0) {
            return NextResponse.json({ message: "User with this email or contact number already exists" }, { status: 409 });
        }

        //Password Hashing
        const hashedPassword = await bcrypt.hash(password, 10);

        //User Insertion
        const [result] = await conn.execute(
            "INSERT INTO users (firstName, lastName, phone, email, password_hash) VALUES (?, ?, ?, ?, ?)",
            [firstName, lastName, contact_number, email, hashedPassword]
        );

        return NextResponse.json({ message: "User registered successfully", userId: result.insertId }, { status: 201 });
    } catch (error) {
        console.error("Registeration Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}