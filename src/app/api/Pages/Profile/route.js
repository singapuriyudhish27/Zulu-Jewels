import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import {getConnection} from "@/lib/db";

//Get The Logged In User
export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("zulu_jewels")?.value;

        //No Token -> Unauthorized
        if (!token) {
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }

        //Verify Token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }
        const userId = decoded.userId;
        const email = decoded.email;

        //If Admin Login
        if (email === process.env.ADMIN_EMAIL) {
            const user = email;
            return NextResponse.json({user}, { status: 200 });
        }

        //Fetch User From Database
        const conn = await getConnection();
        const [userRows] = await conn.execute(
            "SELECT id, firstName, lastName, email, phone FROM users WHERE id = ? AND email = ?",
            [userId, email]
        );

        if (userRows.length === 0) {
            return NextResponse.json({message: "User Not Found"}, {status: 404});
        }

        const user = userRows[0];

        return NextResponse.json({user}, {status: 200});
    } catch (error) {
        console.error("Profile API Error:", error);
        return NextResponse.json({message: "Internal Server Error"}, {status: 500});
    }
}

//Update any Details
export async function PUT(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("zulu_jewels")?.value;

        //No Token -> Unauthorized
        if (!token) {
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }

        //Verify Token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }
        const { userId, email } = decoded;
        const data = await request.json();

        //Database Connection
        const conn = await getConnection();

        //Update Password In Database
        if (data.currentPassword && data.newPassword) {
            const [rows] = await conn.execute(
                "SELECT password_hash FROM users WHERE id = ? AND email = ?",
                [userId, email]
            );

            if (rows.length === 0) {
                return NextResponse.json({ message: "User Not Found" }, { status: 404 });
            }

            const bcrypt = await import("bcryptjs");
            const isMatch = await bcrypt.compare(data.currentPassword, rows[0].password_hash);

            if (!isMatch) {
                return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });
            }

            const hashedPassword = await bcrypt.hash(data.newPassword, 10);
            await conn.execute(
                "UPDATE users SET password_hash = ? WHERE id = ? AND email = ?",
                [hashedPassword, userId, email]
            );

            return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });
        }

        //Update User In Database
        const { firstName, lastName, phone} = data;

        if (!firstName || !lastName || !phone) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const [result] = await conn.execute(
            "UPDATE users SET firstName = ?, lastName = ?, phone = ? WHERE id = ? AND email = ?",
            [data.firstName, data.lastName, data.phone, userId, email]
        );
        if (result.affectedRows === 0) {
            return NextResponse.json({message: "User Not Found or No Changes Made"}, {status: 404});
        }
        return NextResponse.json({message: "Profile Updated Successfully"}, {status: 200});
    } catch (error) {
        console.error("Profile Update API Error:", error);
        return NextResponse.json({message: "Internal Server Error"}, {status: 500});
    }
}

//Logout Route
export async function POST() {
    const cookieStore = await cookies();
    const token = cookieStore.get('zulu_jewels')?.value;

    const response = NextResponse.json({message: "Logged Out Successfully", hadToken: !!token});

    //Remove the JWT cookie
    response.cookies.set("zulu_jewels", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "development",
        sameSite: "strict",
        path: "/",
        expires: new Date(0), //Imidiately expire the cookie
    });
    console.log("Response Cookies After Deletion:", response.cookies.getAll());
    return response;
}