import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import jwt from "jsonwebtoken";
import { rateLimit } from "@/lib/rateLimit";
import { getTransporter } from "@/lib/email/mailer";

export async function POST(req) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
        if (!rateLimit(ip, 3, 300000)) {
            return NextResponse.json({ message: "Too many requests. Please try again in 5 minutes." }, { status: 429 });
        }

        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }

        const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!EMAIL_REGEX.test(email)) {
            return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
        }

        //DB Connection
        await connectDB();

        //Check User Exists Or Not
        const user = await User.findOne({ email });

        // Generic response to prevent user enumeration
        const genericResponse = NextResponse.json(
            { message: "If an account is associated with this email, a password reset link has been sent." },
            { status: 200 }
        );

        if (!user) {
            return genericResponse;
        }

        // Generate dynamic secure JWT token using JWT_SECRET + user's current password hash.
        // This ensures the token is automatically invalidated once the password changes.
        const tokenSecret = process.env.JWT_SECRET + user.password_hash;
        const resetToken = jwt.sign(
            { email: user.email },
            tokenSecret,
            { expiresIn: "15m" }
        );

        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

        //Send An Email
        const transporter = getTransporter();

        const mailOptions = {
            from: `"Zulu Jewellers Support" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Reset Your Password - Zulu Jewellers",
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0eeb3; border-radius: 5px;">
                    <h2 style="color: #c9a84c;">Password Reset Request</h2>
                    <p>Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
                    <p>We received a request to reset your password for your Zulu Jewellers account. Click the button below to choose a new password. This link is valid for 15 minutes.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; border: 1px solid #c9a84c;">Reset Password</a>
                    </div>
                    <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
                    <p><a href="${resetUrl}" style="color: #c9a84c;">${resetUrl}</a></p>
                    <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #888;">Best regards,<br/>Zulu Jewellers Support Team</p>
                </div>
            `,
        };
        await transporter.sendMail(mailOptions);

        return genericResponse;
    } catch (error) {
        console.error("Error Sending Email:", error);
        return NextResponse.json({ message: "Internal Server Error In API Route" }, { status: 500 });
    }
}