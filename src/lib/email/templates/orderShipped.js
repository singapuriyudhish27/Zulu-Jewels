/**
 * Order Shipped Email Template – Zulu Jewels
 * Light, simple, premium theme.
 */

export function getOrderShippedTemplate({ order, customer, user, items, transaction }) {
    const orderId = String(order._id).slice(-8).toUpperCase();
    const orderDate = new Date(order.order_date || order.created_at).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    const totalAmount = transaction?.amount
        ? `₹${Number(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
        : 'N/A';
    const firstName = user?.firstName || customer?.customer_name || 'Valued Customer';
    
    const expectedDelivery = order.expected_delivery_date
        ? new Date(order.expected_delivery_date).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric'
          })
        : 'N/A';

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const itemRows = items.map(item => {
        const productUrl = `${baseUrl}/Pages/Products/${item.product_id}${item.variant_id ? `?variantId=${item.variant_id}` : ''}`;
        return `
        <tr>
            <td style="padding:14px 16px; border-bottom:1px solid #F0EBE3; font-size:14px; color:#2C2C2C; line-height:1.5;">
                <a href="${productUrl}" style="color:#C9A84C; font-weight:600; text-decoration:underline;">
                    ${item.product_name || 'Product'}
                </a>
                ${item.variant_material ? `<br><span style="font-size:12px; color:#9B8B6E;">${item.variant_material}</span>` : ''}
            </td>
            <td style="padding:14px 16px; border-bottom:1px solid #F0EBE3; text-align:center; font-size:14px; color:#6B5B45;">${item.quantity}</td>
            <td style="padding:14px 16px; border-bottom:1px solid #F0EBE3; text-align:right; font-size:14px; font-weight:600; color:#C9A84C;">
                ₹${(Number(item.price) * Number(item.quantity)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </td>
        </tr>
        `;
    }).join('');

    const subject = `Your Zulu Jewels Order #${orderId} Has Been Shipped`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Order Shipped – Zulu Jewels</title>
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
                Your Order Is On Its Way
            </h1>
            <p style="margin:10px 0 0; font-size:14px; color:#9B8B6E;">
                Great news, ${firstName}! Your jewellery has been dispatched.
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
                        <div style="font-size:13px; font-weight:700; color:#3A7BD5;">Shipped</div>
                    </td>
                    <td style="width:1px; background-color:#E8E0D0;">&nbsp;</td>
                    <td style="text-align:center; padding:0 8px;">
                        <div style="font-size:10px; letter-spacing:2px; color:#9B8B6E; text-transform:uppercase; margin-bottom:5px;">Total</div>
                        <div style="font-size:15px; font-weight:700; color:#C9A84C;">${totalAmount}</div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>

    <!-- SHIPPING & TRACKING DETAILS -->
    <tr>
        <td style="padding:32px 48px; border-bottom:1px solid #F0EBE3; background-color:#FAFAF8;">
            <h2 style="margin:0 0 18px; font-size:11px; letter-spacing:3px; color:#C9A84C; text-transform:uppercase; font-weight:600;">
                Shipping & Tracking Details
            </h2>
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="padding-bottom:12px; font-size:13px; color:#9B8B6E; width:40%;">Shipping Partner</td>
                    <td style="padding-bottom:12px; font-size:13px; color:#2C2C2C; font-weight:600;">${order.shipping_partner || 'N/A'}</td>
                </tr>
                <tr>
                    <td style="padding-bottom:12px; font-size:13px; color:#9B8B6E;">Expected Delivery</td>
                    <td style="padding-bottom:12px; font-size:13px; color:#C9A84C; font-weight:700;">${expectedDelivery}</td>
                </tr>
                ${order.tracking_url ? `
                <tr>
                    <td style="font-size:13px; color:#9B8B6E;">Tracking Link</td>
                    <td style="font-size:13px;">
                        <a href="${order.tracking_url}" target="_blank" style="color:#C9A84C; font-weight:600; text-decoration:underline;">
                            Track Shipment
                        </a>
                    </td>
                </tr>
                ` : ''}
            </table>
        </td>
    </tr>

    <!-- SHIPPING ADDRESS -->
    <tr>
        <td style="padding:32px 48px; border-bottom:1px solid #F0EBE3;">
            <h2 style="margin:0 0 14px; font-size:11px; letter-spacing:3px; color:#C9A84C; text-transform:uppercase; font-weight:600;">
                Delivering To
            </h2>
            <div style="background-color:#FAFAF8; border-left:3px solid #C9A84C; padding:14px 18px; border-radius:0 4px 4px 0;">
                <div style="font-size:14px; color:#2C2C2C; font-weight:600; margin-bottom:4px;">${user?.firstName || ''} ${user?.lastName || customer?.customer_name || ''}</div>
                <div style="font-size:13px; color:#6B5B45; line-height:1.6;">${order.shipping_address || 'N/A'}</div>
            </div>
        </td>
    </tr>

    <!-- ITEMS IN SHIPMENT -->
    <tr>
        <td style="padding:32px 48px; border-bottom:1px solid #F0EBE3;">
            <h2 style="margin:0 0 18px; font-size:11px; letter-spacing:3px; color:#C9A84C; text-transform:uppercase; font-weight:600;">
                Items In This Shipment
            </h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #F0EBE3; border-radius:4px; overflow:hidden;">
                <thead>
                    <tr style="background-color:#FAFAF8;">
                        <th style="padding:11px 16px; text-align:left; font-size:10px; letter-spacing:2px; color:#9B8B6E; text-transform:uppercase; font-weight:600; border-bottom:1px solid #F0EBE3;">Item</th>
                        <th style="padding:11px 16px; text-align:center; font-size:10px; letter-spacing:2px; color:#9B8B6E; text-transform:uppercase; font-weight:600; border-bottom:1px solid #F0EBE3;">Qty</th>
                        <th style="padding:11px 16px; text-align:right; font-size:10px; letter-spacing:2px; color:#9B8B6E; text-transform:uppercase; font-weight:600; border-bottom:1px solid #F0EBE3;">Total</th>
                    </tr>
                </thead>
                <tbody>${itemRows}</tbody>
                <tfoot>
                    <tr style="background-color:#FAFAF8;">
                        <td colspan="2" style="padding:14px 16px; text-align:right; font-size:13px; color:#6B5B45; font-weight:600; letter-spacing:1px; text-transform:uppercase; border-top:1px solid #E8E0D0;">Grand Total</td>
                        <td style="padding:14px 16px; text-align:right; font-size:17px; font-weight:700; color:#C9A84C; border-top:1px solid #E8E0D0;">${totalAmount}</td>
                    </tr>
                </tfoot>
            </table>
        </td>
    </tr>

    <!-- FOOTER -->
    <tr>
        <td style="padding:28px 48px; text-align:center;">
            <p style="margin:0 0 8px; font-size:13px; color:#9B8B6E; line-height:1.7;">
                Please ensure someone is available to receive the package.<br/>
                Questions? Simply reply to this email.
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
