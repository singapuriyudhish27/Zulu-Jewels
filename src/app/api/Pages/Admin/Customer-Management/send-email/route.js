import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req) {
    try {
        const { to, subject, message } = await req.json();

        if (!to || !subject || !message) {
            return NextResponse.json({
                success: false,
                message: "To, Subject, and Message are required"
            }, { status: 400 });
        }

        // Configure Nodemailer
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Set up email options
        const mailOptions = {
            from: `"Zulu Jewels" <${process.env.SMTP_USER}>`,
            to: to,
            subject: subject,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #2c2c2c;">
                    <h2 style="color: #d4af37; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Message from Zulu Jewels</h2>
                    <p>${message.replace(/\n/g, '<br>')}</p>
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
