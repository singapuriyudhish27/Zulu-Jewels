import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { verifyAdminFromRequest } from "@/lib/adminAuth";

//Get the Logged-in Admin Profile
export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("zulu_jewels_admin")?.value;

        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        //Verify Token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (decoded.role !== "admin") {
                return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });
            }

            if (decoded.email === process.env.ADMIN_EMAIL) {
                return NextResponse.json({ firstName: "Super", lastName: "Admin", email: process.env.ADMIN_EMAIL });
            } else {
                //DB Connection
                await connectDB();
                //Fetch logged-in admin user details
                const adminUser = await User.findOne({ _id: decoded.userId, role: 'admin' })
                    .select('firstName lastName email phone role');
                if (!adminUser) {
                    return NextResponse.json({ message: "Admin not found" }, { status: 404 });
                }
                return NextResponse.json({
                    firstName: adminUser.firstName,
                    lastName: adminUser.lastName,
                    email: adminUser.email,
                    phone: adminUser.phone,
                    role: adminUser.role
                });
            }
        } catch (err) {
            return NextResponse.json({ message: "Error Getting Admin Profile" }, { status: 401 });
        }
    } catch (error) {
        console.error("Error Getting Admin Profile:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

//Add a New User
export async function POST(request) {
    const auth = await verifyAdminFromRequest(request);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        //Get Request Body
        const body = await request.json();
        const role = 'admin';
        const { firstName, lastName, email, phone, password} = body;

        if (!firstName || !lastName || !email || !phone || !password) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!EMAIL_REGEX.test(email)) {
            return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
        }

        if (password.length < 12 || password.length > 72) {
            return NextResponse.json({ message: "Admin password must be 12–72 characters" }, { status: 400 });
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
        const hashedPassword = await bcrypt.hash(password, 12);

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
    const auth = await verifyAdminFromRequest(request);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        const body = await request.json();
        const role = 'admin';
        const { id, firstName, lastName, email, phone, password } = body;

        if (!firstName || !lastName || !email || !phone) {
            return NextResponse.json({ message: "firstName, lastName, email, and phone are required" }, { status: 400 });
        }

        const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!EMAIL_REGEX.test(email)) {
            return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
        }

        if (id && !/^[0-9a-fA-F]{24}$/.test(id)) {
            return NextResponse.json({ message: "Invalid User ID format" }, { status: 400 });
        }

        await connectDB();

        //Check if email or phone is already used by another user (excluding current user)
        const existingUser = await User.findOne({
            _id: { $ne: id },
            $or: [{ email }, { phone }]
        });

        if (existingUser) {
            return NextResponse.json({ message: "Email or phone already in use by another user" }, { status: 409 });
        }

        //If password is provided, hash it
        const updateFields = { firstName, lastName, email, phone };
        if (password) {
            if (password.length < 12 || password.length > 72) {
                return NextResponse.json({ message: "Admin password must be 12–72 characters" }, { status: 400 });
            }
            updateFields.password_hash = await bcrypt.hash(password, 12);
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
    const auth = await verifyAdminFromRequest(request);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ message: "User ID is required" }, { status: 400 });
        }

        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return NextResponse.json({ message: "Invalid User ID format" }, { status: 400 });
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