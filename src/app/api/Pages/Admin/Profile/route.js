import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

//Get the List of Users
export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("zulu_jewels")?.value;

        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        //Verify Token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (decoded.role === "admin" && decoded.email === process.env.ADMIN_EMAIL) {
                return NextResponse.json({firstName: "Super", lastName: "Admin", email: process.env.ADMIN_EMAIL});
            } else {
                //DB Connection
                const conn = await getConnection();
                //Fetch Users
                const [rows] = await conn.execute(
                    "SELECT id, firstName, lastName, email, phone, role, created_at FROM users WHERE role != 'admin'"
                );
                await conn.end();
                return NextResponse.json({ users: rows });
            }
        } catch (err) {
            return NextResponse.json({ message: "Error Getting Admin Profile" }, { status: 401 });
        }
    } catch (error) {
        console.error("Error Geting Users:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

//Add a New User
export async function POST(request) {
    try {
        //Get Request Body
        const body = await request.json();
        const role = 'admin';
        const { firstName, lastName, email, phone, password} = body;

        if (!firstName || !lastName || !email || !phone || !password) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        //DB Connection
        const conn = await getConnection();

        //Check if User Already Exists
        const [existingUser] = await conn.execute(
            "SELECT id FROM users WHERE email = ? OR phone = ?",
            [email, phone]
        );

        if (existingUser.length > 0) {
            return NextResponse.json({ message: "User with this email or contact number already exists" }, { status: 409 });
        }

        //Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        //Insert New User
        const [result] = await conn.execute(
            "INSERT INTO users (role, firstName, lastName, email, phone, password_hash) VALUES (?, ?, ?, ?, ?, ?)",
            [role, firstName, lastName, email, phone, hashedPassword]
        );
        await conn.end();

        return NextResponse.json({ message: "User created successfully", userId: result.insertId }, { status: 201 });
    } catch (error) {
        console.error("Error Creating User:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

//Update an Existing User
export async function PUT(request) {
    try {
        const body = await request.json();
        const role = 'admin';
        const { firstName, lastName, email, phone, password } = body;

        if (!firstName || !lastName || !email || !phone) {
            return NextResponse.json({ message: "firstName, lastName, email, and phone are required" }, { status: 400 });
        }

        const conn = await getConnection();

        //Check if email or phone is already used by another user
        const [existingUser] = await conn.execute(
            "SELECT id FROM users WHERE email = ? OR phone = ?",
            [email, phone ]
        );

        if (existingUser.length > 0) {
            await conn.end();
            return NextResponse.json({ message: "Email or phone already in use by another user" }, { status: 409 });
        }

        //If password is provided, hash it
        let hashedPassword;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        //Build the query dynamically based on whether password is updated
        const query = hashedPassword
            ? "UPDATE users SET firstName = ?, lastName = ?, email = ?, phone = ?, password_hash = ? WHERE id = ?"
            : "UPDATE users SET firstName = ?, lastName = ?, email = ?, phone = ?, WHERE id = ?";

        const params = hashedPassword
            ? [firstName, lastName, email, phone, hashedPassword, id]
            : [firstName, lastName, email, phone, id];
        const [result] = await conn.execute(query, params);
        await conn.end();

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "User updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error Updating User:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

//Delete a User
export async function DELETE(request) {
    try {
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ message: "User ID is required" }, { status: 400 });
        }

        const conn = await getConnection();

        const [result] = await conn.execute("DELETE FROM users WHERE id = ?", [id]);
        await conn.end();

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error Deleting User:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}