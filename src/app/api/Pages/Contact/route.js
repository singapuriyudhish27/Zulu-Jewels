import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

async function getUserIdFromCookie() {
    const cookieStore = await cookies();
    const cookie = cookieStore.get("zulu_jewels");
    const token = cookie?.value;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded?.userId;
}

export async function POST(req) {
    try {
        const body = await req.json();
        const {subject, message} = body;

        if (!message || !subject) {
            return NextResponse.json({
                success: false,
                message: "Subject and message are required"
            }, { status: 400 });
        }

        //Get User From Cookie
        const userId = await getUserIdFromCookie();

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized. Please login." },
                { status: 401 }
            );
        }

        //Database Connection
        const connection = await getConnection();

        //Get User Details
        const [users] = await connection.execute(`
            SELECT id, firstName, lastName, email, phone FROM users WHERE id = ?
        `, [userId]);

        if (!users.length) {
            return NextResponse.json(
                { success: false, message: "User not found." },
                { status: 404 }
            );
        }
        const user = users[0];

        //Inquiry Insert
        await connection.execute(`
            INSERT INTO inquiries (user_id, inquiry_category, message) VALUES (?, ?, ?)
            `, [
                user.id, 
                subject, 
                JSON.stringify({ 
                    name: `${user.firstName} ${user.lastName}`, 
                    email: user.email, 
                    phone: user.phone, 
                    message 
                })
            ]
        );
        console.log("Backend API To POST New Inquiry.");

        return NextResponse.json({
            success: true,
            message: "Inquiry submitted successfully"
        }, { status: 201 });
    } catch (error) {
        console.error("Error Getting Data:", error);
        NextResponse.json({message: "Error In Backend API Call"});
    }
}