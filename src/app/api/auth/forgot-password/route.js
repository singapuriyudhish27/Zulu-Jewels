import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

function generatePassword() {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const special = "!@#$%^&*()_+[]{}|;:,.<>?";

    const all = upper + lower + special + digits;

    let password = [
        upper[Math.floor(Math.random() * upper.length)],
        lower[Math.floor(Math.random() * lower.length)],
        special[Math.floor(Math.random() * special.length)],
        digits[Math.floor(Math.random() * digits.length)],
    ];

    while (password.length < 8) {
        password.push(all[Math.floor(Math.random() * all.length)]);
    }

    return password.sort(() => Math.random() - 0.5).join("");
}

export async function POST(req) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({message: "Email Not Found"}, {status: 400});
        }

        //DB Connection
        const db = await getConnection();

        //Check User Exists Or Not
        const [users] = await db.execute(
            `SELECT * FROM users WHERE email = ?`,
            [email]
        );

        if (users.length === 0) {
            return NextResponse.json({message: "No User Found, Register First."}, {status: 401});
        }
        const user = users[0];

        //Generate New Password
        const newPassword = generatePassword();
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        //Update the password in DB
        await db.execute(
            `UPDATE users SET password_hash = ? WHERE email = ?`,
            [hashedPassword, email]
        );

        //Send An Email
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: `"Zulu Jewellers Support" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Your New Login Password - Zulu Jewellers",
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Login Credentials</h2>
                    <p>Hello <strong>${user.firstName + user.lastName}</strong>,</p>
                    <p>Your password has been reset successfully. Here are your new login details:</p>
                    <table style="border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px;"><strong>Name:</strong></td>
                            <td style="padding: 8px;">${user.firstName + user.lastName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px;"><strong>Email:</strong></td>
                            <td style="padding: 8px;">${user.phone}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px;"><strong>Email:</strong></td>
                            <td style="padding: 8px;">${email}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px;"><strong>New Password:</strong></td>
                            <td style="padding: 8px;">${newPassword}</td>
                        </tr>
                    </table>
                    <p>For security reasons, please log in and change your password immediately.</p>
                    <p>If you did not request this reset, please contact our support team immediately.</p>
                    <br/>
                    <p>Best regards,<br/>Zulu Jewellers Support Team</p>
                </div>
            `,
        };
        await transporter.sendMail(mailOptions);

        return NextResponse.json({message: "Login credentials sent to your email."}, {status: 200});
    } catch (error) {
        console.error("Error Sending Email:", error);
        return NextResponse.json({message: "Internal Server Error In API Route"}, {status: 500});
    }
}