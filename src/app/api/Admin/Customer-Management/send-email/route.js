import { NextResponse } from "next/server";
import { verifyAdminFromRequest } from "@/lib/adminAuth";
import { getTransporter } from "@/lib/email/mailer";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";

function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req) {
    const auth = await verifyAdminFromRequest(req);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    try {
        const { to, subject, message } = await req.json();

        if (!to || !subject || !message) {
            return NextResponse.json({
                success: false,
                message: "To, Subject, and Message are required"
            }, { status: 400 });
        }

        await connectDB();
        // Check database to ensure target is a registered user
        const customerExists = await User.findOne({ email: to });
        if (!customerExists) {
            return NextResponse.json({
                success: false,
                message: "Recipient must be a registered customer"
            }, { status: 400 });
        }

        // Configure Nodemailer
        const transporter = getTransporter();
        const escapedMessage = escapeHtml(message).replace(/\n/g, '<br>');

        // Set up email options
        const mailOptions = {
            from: `"Zulu Jewels" <${process.env.SMTP_USER}>`,
            to: to,
            subject: subject,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #2c2c2c;">
                    <h2 style="color: #d4af37; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Message from Zulu Jewels</h2>
                    <p>${escapedMessage}</p>
                    <br/>
                    <div style="margin-top: 20px; border-top: 1px solid #d9d9d9; padding-top: 10px; font-size: 12px; color: #4a4a4a;">
                        <p>Best regards,<br/>
                        <strong>Zulu Jewels Administration</strong></p>
                        <p>Website: <a href="${process.env.BASE_URL}" style="color: #d4af37; text-decoration: none;">zulu_jewels.com</a></p>
                    </div>
                </div>
            `,
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        return NextResponse.json({
            success: true,
            message: "Email sent successfully"
        }, { status: 200 });

    } catch (error) {
        console.error("Error sending customer email:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to send email. Please check server configuration."
        }, { status: 500 });
    }
}
