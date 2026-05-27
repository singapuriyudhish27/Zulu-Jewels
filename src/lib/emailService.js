/**
 * Central Email Service – Zulu Jewels
 * Dispatches branded transactional emails for each order lifecycle event.
 */

import { getTransporter } from './email/mailer';
import { generateInvoicePDF } from './email/invoiceGenerator';
import { getOrderPlacedTemplate }    from './email/templates/orderPlaced';
import { getOrderShippedTemplate }   from './email/templates/orderShipped';
import { getOrderDeliveredTemplate } from './email/templates/orderDelivered';
import { getOrderCancelledTemplate } from './email/templates/orderCancelled';
import { getOrderRefundedTemplate }  from './email/templates/orderRefunded';

const EMAIL_TYPES = {
    order_placed:    getOrderPlacedTemplate,
    order_shipped:   getOrderShippedTemplate,
    order_delivered: getOrderDeliveredTemplate,
    order_cancelled: getOrderCancelledTemplate,
    order_refunded:  getOrderRefundedTemplate,
};

/**
 * Sends a transactional order email.
 * The PDF invoice is attached ONLY for the 'order_placed' event.
 *
 * @param {'order_placed'|'order_shipped'|'order_delivered'|'order_cancelled'} type
 * @param {object} data
 * @param {object}  data.order         - Order document
 * @param {object}  data.customer      - Customer document
 * @param {object}  data.user          - User document (has .email, .firstName, etc.)
 * @param {Array}   data.items         - Enriched order items array
 * @param {object}  [data.transaction] - Transaction document (for amount)
 * @returns {Promise<void>}
 */
export async function sendOrderEmail(type, data) {
    const templateFn = EMAIL_TYPES[type];
    if (!templateFn) {
        console.warn(`[EmailService] Unknown email type: "${type}". Skipping.`);
        return;
    }

    const toEmail = data.user?.email;
    if (!toEmail) {
        console.warn(`[EmailService] No recipient email found for order ${data.order?._id}. Skipping.`);
        return;
    }

    // Build template (subject + HTML body)
    const { subject, html } = templateFn(data);

    const orderId = String(data.order._id).slice(-8).toUpperCase();

    const mailOptions = {
        from: `"Zulu Jewels" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject,
        html,
    };

    // Attach PDF invoice ONLY on order creation
    if (type === 'order_placed') {
        try {
            const invoiceBuffer = await generateInvoicePDF(data);
            mailOptions.attachments = [{
                filename: `Invoice_${orderId}.pdf`,
                content: invoiceBuffer,
                contentType: 'application/pdf',
            }];
        } catch (pdfErr) {
            console.error('[EmailService] Failed to generate PDF invoice:', pdfErr.message);
            // Continue sending the email even without the attachment
        }
    }

    const transporter = getTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] ✅ "${type}" email sent to ${toEmail} | MessageId: ${info.messageId}`);
}
