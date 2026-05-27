import nodemailer from 'nodemailer';

let transporter = null;

/**
 * Returns a singleton Nodemailer transporter using SMTP env vars.
 */
export function getTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // false for STARTTLS (port 587), true for SSL (port 465)
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    return transporter;
}
