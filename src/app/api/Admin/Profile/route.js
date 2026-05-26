import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
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
                await connectDB();
                //Fetch Users
                const rows = await User.find({ role: { $ne: 'admin' } })
                    .select('firstName lastName email phone role created_at');
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
        await connectDB();

        //Check if User Already Exists
        const existingUser = await User.findOne({
            $or: [{ email }, { phone }]
        });

        if (existingUser) {
            return NextResponse.json({ message: "User with this email or contact number already exists" }, { status: 409 });
        }

        //Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        //Insert New User
        const newUser = await User.create({
            role,
            firstName,
            lastName,
            email,
            phone,
            password_hash: hashedPassword
        });

        return NextResponse.json({ message: "User created successfully", userId: newUser._id }, { status: 201 });
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
        const { id, firstName, lastName, email, phone, password } = body;

        if (!firstName || !lastName || !email || !phone) {
            return NextResponse.json({ message: "firstName, lastName, email, and phone are required" }, { status: 400 });
        }

        await connectDB();

        //Check if email or phone is already used by another user
        const existingUser = await User.findOne({
            $or: [{ email }, { phone }]
        });

        if (existingUser) {
            return NextResponse.json({ message: "Email or phone already in use by another user" }, { status: 409 });
        }

        //If password is provided, hash it
        const updateFields = { firstName, lastName, email, phone };
        if (password) {
            updateFields.password_hash = await bcrypt.hash(password, 10);
        }

        const result = await User.updateOne({ _id: id }, updateFields);

        if (result.matchedCount === 0) {
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

        await connectDB();

        const result = await User.deleteOne({ _id: id });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error Deleting User:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}