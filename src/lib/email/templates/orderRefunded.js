/**
 * Order Refunded Email Template – Zulu Jewels
 * Light, simple, premium theme.
 */

export function getOrderRefundedTemplate({ order, customer, user, items, transaction }) {
    const orderId = String(order._id).slice(-8).toUpperCase();
    const orderDate = new Date(order.order_date || order.created_at).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    const totalAmount = transaction?.amount
        ? `₹${Number(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
        : 'N/A';
    const firstName = user?.firstName || customer?.customer_name || 'Valued Customer';

    const subject = `Your Zulu Jewels Order #${orderId} Refund Processed`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Refund Confirmed – Zulu Jewels</title>
</head>
<body style="margin:0; padding:0; background-color:#F5F1EC; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F1EC; padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:#FFFFFF; border-radius:4px; overflow:hidden; box-shadow:0 2px 16px rgba(0,0,0,0.08);">

    <!-- TOP GOLD BAR -->
    <tr>
        <td style="background-color:#C9A84C; height:4px; font-size:0; line-height:0;">&nbsp;</td>
    </tr>

    <!-- HEADER -->
    <tr>
        <td style="padding:40px 48px 32px; text-align:center; border-bottom:1px solid #F0EBE3;">
            <div style="font-size:11px; letter-spacing:5px; color:#C9A84C; text-transform:uppercase; font-weight:600; margin-bottom:12px;">
                ZULU JEWELS
            </div>
            <div style="width:40px; height:1px; background-color:#C9A84C; margin:0 auto 16px;"></div>
            <h1 style="margin:0; font-size:24px; font-weight:300; color:#1A1A1A; letter-spacing:1px;">
                Refund Confirmed
            </h1>
            <p style="margin:10px 0 0; font-size:14px; color:#9B8B6E; line-height:1.6;">
                Hello ${firstName}. We've processed a refund for your cancelled order <strong>#${orderId}</strong>.
            </p>
        </td>
    </tr>

    <!-- REFUND DETAILS STRIP -->
    <tr>
        <td style="background-color:#FAFAF8; padding:20px 48px; border-bottom:1px solid #F0EBE3;">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="text-align:center; padding:0 8px;">
                        <div style="font-size:10px; letter-spacing:2px; color:#9B8B6E; text-transform:uppercase; margin-bottom:5px;">Order</div>
                        <div style="font-size:15px; font-weight:700; color:#C9A84C; letter-spacing:1px;">#${orderId}</div>
                    </td>
                    <td style="width:1px; background-color:#E8E0D0;">&nbsp;</td>
                    <td style="text-align:center; padding:0 8px;">
                        <div style="font-size:10px; letter-spacing:2px; color:#9B8B6E; text-transform:uppercase; margin-bottom:5px;">Date</div>
                        <div style="font-size:13px; font-weight:600; color:#2C2C2C;">${orderDate}</div>
                    </td>
                    <td style="width:1px; background-color:#E8E0D0;">&nbsp;</td>
                    <td style="text-align:center; padding:0 8px;">
                        <div style="font-size:10px; letter-spacing:2px; color:#9B8B6E; text-transform:uppercase; margin-bottom:5px;">Status</div>
                        <div style="font-size:13px; font-weight:700; color:#4A8C5C;">Refunded</div>
                    </td>
                    <td style="width:1px; background-color:#E8E0D0;">&nbsp;</td>
                    <td style="text-align:center; padding:0 8px;">
                        <div style="font-size:10px; letter-spacing:2px; color:#9B8B6E; text-transform:uppercase; margin-bottom:5px;">Refunded Amount</div>
                        <div style="font-size:15px; font-weight:700; color:#C9A84C;">${totalAmount}</div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>

    <!-- REFUND MESSAGE BOX -->
    <tr>
        <td style="padding:32px 48px; border-bottom:1px solid #F0EBE3;">
            <div style="background-color:#FDF9F5; border-left:3px solid #C9A84C; padding:18px; border-radius:0 4px 4px 0;">
                <h3 style="margin:0 0 8px; font-size:11px; letter-spacing:2px; color:#C9A84C; text-transform:uppercase; font-weight:600;">Refund Notice</h3>
                <p style="margin:0; font-size:13px; color:#6B5B45; line-height:1.7;">
                    The total amount of <strong>${totalAmount}</strong> has been refunded back to your original payment method. Depending on your bank's processing times, it should reflect in your account in <strong style="color:#2C2C2C;">5–7 business days</strong>.
                </p>
            </div>
        </td>
    </tr>

    <!-- FOOTER -->
    <tr>
        <td style="padding:28px 48px; text-align:center;">
            <p style="margin:0 0 8px; font-size:13px; color:#9B8B6E; line-height:1.7;">
                If you have any questions or have not received your refund after 7 business days, please reply directly to this email.
            </p>
            <div style="width:32px; height:1px; background-color:#C9A84C; margin:16px auto;"></div>
            <p style="margin:0; font-size:10px; letter-spacing:3px; color:#C9A84C; text-transform:uppercase;">Zulu Jewels</p>
            <p style="margin:6px 0 0; font-size:11px; color:#C8BDB0; letter-spacing:1px;">© ${new Date().getFullYear()} Zulu Jewels. All rights reserved.</p>
        </td>
    </tr>

    <!-- BOTTOM GOLD BAR -->
    <tr>
        <td style="background-color:#C9A84C; height:3px; font-size:0; line-height:0;">&nbsp;</td>
    </tr>

</table>
</td></tr>
</table>
</body>
</html>`;

    return { subject, html };
}
