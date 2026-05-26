import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Inquiry from "@/lib/models/Inquiry";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

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
        const body = await req.json();
        const { name, email, phone, subject, message } = body;

        if (!message || !subject) {
            return NextResponse.json({
                success: false,
                message: "Subject and message are required"
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
        
        console.log("Inquiry stored in database.");

        return NextResponse.json({
            success: true,
            message: "Inquiry submitted successfully"
        }, { status: 201 });
    } catch (error) {
        console.error("Contact API Error:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Error in backend API call",
            error: error.message 
        }, { status: 500 });
    }
}