import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Inquiry from "@/lib/models/Inquiry";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { rateLimit } from "@/lib/rateLimit";

async function getUserIdFromCookie() {
    try {
        const cookieStore = await cookies();
        const cookie = cookieStore.get("zulu_jewels");
        const token = cookie?.value;
        if (!token) return null;
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded?.userId || null;
    } catch (error) {
        return null; // Return null instead of throwing on invalid tokens
    }
}

export async function POST(req) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
        if (!rateLimit(ip, 5, 300000)) {
            return NextResponse.json({
                success: false,
                message: "Too many requests. Please try again in 5 minutes."
            }, { status: 429 });
        }

        const body = await req.json();
        const { name, email, phone, subject, message } = body;

        const MAX_SUBJECT_LEN = 200;
        const MAX_MESSAGE_LEN = 2000;

        if (!message || !subject) {
            return NextResponse.json({
                success: false,
                message: "Subject and message are required"
            }, { status: 400 });
        }

        if (subject.length > MAX_SUBJECT_LEN) {
            return NextResponse.json({
                success: false,
                message: `Subject must not exceed ${MAX_SUBJECT_LEN} characters`
            }, { status: 400 });
        }

        if (message.length > MAX_MESSAGE_LEN) {
            return NextResponse.json({
                success: false,
                message: `Message must not exceed ${MAX_MESSAGE_LEN} characters`
            }, { status: 400 });
        }

        // Get User if logged in
        const userId = await getUserIdFromCookie();
        await connectDB();

        let userData = { name, email, phone };

        // If logged in, fetch user details to complement/verify
        if (userId) {
            const user = await User.findById(userId).select('firstName lastName email phone');

            if (user) {
                userData.name = userData.name || `${user.firstName} ${user.lastName}`;
                userData.email = userData.email || user.email;
                userData.phone = userData.phone || user.phone;
            }
        }

        // Inquiry Insert
        await Inquiry.create({
            user_id: userId, // Can be NULL for guest inquiries
            inquiry_category: subject,
            message: JSON.stringify({ 
                name: userData.name || 'Anonymous', 
                email: userData.email || 'N/A', 
                phone: userData.phone || 'N/A', 
                message 
            })
        });

        return NextResponse.json({
            success: true,
            message: "Inquiry submitted successfully"
        }, { status: 201 });
    } catch (error) {
        console.error("Contact API Error:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Internal Server Error"
        }, { status: 500 });
    }
}