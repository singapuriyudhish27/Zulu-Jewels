/**
 * Order Cancelled Email Template – Zulu Jewels
 * Light, simple, premium theme.
 */

export function getOrderCancelledTemplate({ order, customer, user, items, transaction }) {
    const orderId = String(order._id).slice(-8).toUpperCase();
    const orderDate = new Date(order.order_date || order.created_at).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    const totalAmount = transaction?.amount
        ? `₹${Number(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
        : 'N/A';
    const firstName = user?.firstName || customer?.customer_name || 'Valued Customer';

    const itemRows = items.map(item => `
        <tr>
            <td style="padding:14px 16px; border-bottom:1px solid #F0EBE3; font-size:14px; color:#9B8B6E; line-height:1.5;">
                <span style="text-decoration:line-through;">${item.product_name || 'Product'}</span>
                ${item.variant_material ? `<br><span style="font-size:12px; color:#C0B0A0;">${item.variant_material}</span>` : ''}
            </td>
            <td style="padding:14px 16px; border-bottom:1px solid #F0EBE3; text-align:center; font-size:14px; color:#C0B0A0;">${item.quantity}</td>
            <td style="padding:14px 16px; border-bottom:1px solid #F0EBE3; text-align:right; font-size:14px; color:#C0B0A0; text-decoration:line-through;">
                ₹${(Number(item.price) * Number(item.quantity)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </td>
        </tr>
    `).join('');

    const subject = `Your Zulu Jewels Order #${orderId} Has Been Cancelled`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Order Cancelled – Zulu Jewels</title>
</head>
<body style="margin:0; padding:0; background-color:#F5F1EC; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F1EC; padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:#FFFFFF; border-radius:4px; overflow:hidden; box-shadow:0 2px 16px rgba(0,0,0,0.08);">

    <!-- TOP MUTED BAR -->
    <tr>
        <td style="background-color:#C9B99A; height:4px; font-size:0; line-height:0;">&nbsp;</td>
    </tr>

    <!-- HEADER -->
    <tr>
        <td style="padding:40px 48px 32px; text-align:center; border-bottom:1px solid #F0EBE3;">
            <div style="font-size:11px; letter-spacing:5px; color:#C9A84C; text-transform:uppercase; font-weight:600; margin-bottom:12px;">
                ZULU JEWELS
            </div>
            <div style="width:40px; height:1px; background-color:#C9B99A; margin:0 auto 16px;"></div>
            <h1 style="margin:0; font-size:24px; font-weight:300; color:#1A1A1A; letter-spacing:1px;">
                Order Cancelled
            </h1>
            <p style="margin:10px 0 0; font-size:14px; color:#9B8B6E;">
                We're sorry to hear that, ${firstName}. Your order has been cancelled.
            </p>
        </td>
    </tr>

    <!-- ORDER DETAILS STRIP -->
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
                        <div style="font-size:13px; font-weight:700; color:#B05050;">Cancelled</div>
                    </td>
                    <td style="width:1px; background-color:#E8E0D0;">&nbsp;</td>
                    <td style="text-align:center; padding:0 8px;">
                        <div style="font-size:10px; letter-spacing:2px; color:#9B8B6E; text-transform:uppercase; margin-bottom:5px;">Order Total</div>
                        <div style="font-size:15px; font-weight:700; color:#C0B0A0; text-decoration:line-through;">${totalAmount}</div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>

    <!-- CANCELLED ITEMS -->
    <tr>
        <td style="padding:32px 48px; border-bottom:1px solid #F0EBE3;">
            <h2 style="margin:0 0 18px; font-size:11px; letter-spacing:3px; color:#9B8B6E; text-transform:uppercase; font-weight:600;">
                Cancelled Items
            </h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #F0EBE3; border-radius:4px; overflow:hidden;">
                <thead>
                    <tr style="background-color:#FAFAF8;">
                        <th style="padding:11px 16px; text-align:left; font-size:10px; letter-spacing:2px; color:#9B8B6E; text-transform:uppercase; font-weight:600; border-bottom:1px solid #F0EBE3;">Item</th>
                        <th style="padding:11px 16px; text-align:center; font-size:10px; letter-spacing:2px; color:#9B8B6E; text-transform:uppercase; font-weight:600; border-bottom:1px solid #F0EBE3;">Qty</th>
                        <th style="padding:11px 16px; text-align:right; font-size:10px; letter-spacing:2px; color:#9B8B6E; text-transform:uppercase; font-weight:600; border-bottom:1px solid #F0EBE3;">Amount</th>
                    </tr>
                </thead>
                <tbody>${itemRows}</tbody>
            </table>
        </td>
    </tr>

    <!-- REFUND NOTICE -->
    <tr>
        <td style="padding:24px 48px; background-color:#FDF9F5; border-bottom:1px solid #F0EBE3; border-left:3px solid #C9A84C;">
            <h3 style="margin:0 0 8px; font-size:11px; letter-spacing:2px; color:#C9A84C; text-transform:uppercase; font-weight:600;">Refund Information</h3>
            <p style="margin:0; font-size:13px; color:#6B5B45; line-height:1.7;">
                If a payment was made for this order, a refund will be processed to your original
                payment method within <strong style="color:#2C2C2C;">5–7 business days</strong>.
                Please reach out if you haven't received it after this period.
            </p>
        </td>
    </tr>

    <!-- SHOP AGAIN CTA -->
    <tr>
        <td style="padding:32px 48px; text-align:center; border-bottom:1px solid #F0EBE3;">
            <p style="margin:0 0 20px; font-size:14px; color:#6B5B45; line-height:1.7;">
                We hope to see you again.<br/>
                Explore our latest collection of fine jewellery.
            </p>
            <a href="${process.env.BASE_URL || 'http://localhost:3000'}/Pages/Products"
               style="display:inline-block; background-color:#C9A84C; color:#FFFFFF; font-size:12px;
                      font-weight:600; letter-spacing:2px; text-transform:uppercase; text-decoration:none;
                      padding:12px 32px; border-radius:2px;">
                Explore Collection
            </a>
        </td>
    </tr>

    <!-- FOOTER -->
    <tr>
        <td style="padding:28px 48px; text-align:center;">
            <p style="margin:0 0 8px; font-size:13px; color:#9B8B6E; line-height:1.7;">
                If this cancellation was made in error, please reply to this email.
            </p>
            <div style="width:32px; height:1px; background-color:#C9A84C; margin:16px auto;"></div>
            <p style="margin:0; font-size:10px; letter-spacing:3px; color:#C9A84C; text-transform:uppercase;">Zulu Jewels</p>
            <p style="margin:6px 0 0; font-size:11px; color:#C8BDB0; letter-spacing:1px;">© ${new Date().getFullYear()} Zulu Jewels. All rights reserved.</p>
        </td>
    </tr>

    <!-- BOTTOM MUTED BAR -->
    <tr>
        <td style="background-color:#C9B99A; height:3px; font-size:0; line-height:0;">&nbsp;</td>
    </tr>

</table>
</td></tr>
</table>
</body>
</html>`;

    return { subject, html };
}
