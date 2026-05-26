import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function GET() {
    try {
        const connection = await getConnection();

        //Database Table
        const [rows] = await connection.execute(`
            SELECT
                c.id AS customer_id,
                c.customer_name,
                c.location,
                c.created_at AS customer_created_at,
                u.id AS user_id,
                u.firstName,
                u.lastName,
                u.email,
                u.phone,
                u.is_active,
                u.is_verified,
                o.id AS order_id,
                o.order_date,
                o.payment_method,
                o.shipping_address,
                o.is_paid,
                o.status AS order_status,
                o.receipt_url,
                o.created_at AS order_created_at,
                oi.id AS order_item_id,
                oi.product_id,
                oi.quantity,
                oi.price AS item_price,
                oi.created_at AS item_created_at
            FROM customers c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN orders o ON c.id = o.customer_id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            ORDER BY c.id ASC, o.created_at DESC, oi.created_at DESC
        `);
        console.log("Backend API To Get Users, Customers, Orders & Order Items.");

        //Group Data
        const customerMap = {};

        for (const row of rows) {
            if (!customerMap[row.customer_id]) {
                customerMap[row.customer_id] = {
                    id: row.customer_id,
                    customer_name: row.customer_name,
                    location: row.location,
                    created_at: row.customer_created_at,
                    user: row.user_id
                        ? {
                            id: row.user_id,
                            firstName: row.firstName,
                            lastName: row.lastName,
                            email: row.email,
                            phone: row.phone,
                            is_active: row.is_active,
                            is_verified: row.is_verified,
                        }
                        : null,
                    orders: [],
                };
            }

            if (row.order_id) {
                let order = customerMap[row.customer_id].orders.find(
                    (o) => o.id === row.order_id
                );

                if (!order) {
                    order = {
                        id: row.order_id,
                        order_date: row.order_date,
                        payment_method: row.payment_method,
                        shipping_address: row.shipping_address,
                        is_paid: row.is_paid,
                        status: row.order_status,
                        receipt_url: row.receipt_url,
                        created_at: row.order_created_at,
                        items: [],
                    };
                    customerMap[row.customer_id].orders.push(order);
                }

                if (row.order_item_id) {
                    order.items.push({
                        id: row.order_item_id,
                        product_id: row.product_id,
                        quantity: row.quantity,
                        price: row.item_price,
                        created_at: row.item_created_at,
                    });
                }
            }
        }

        return NextResponse.json({
            success: true,
            data: Object.values(customerMap),
            adminEmail: process.env.SMTP_USER
        }, { status: 200 });
    } catch (error) {
        console.error("Error Getting Customers Data:", error);
        return NextResponse.json({ message: "Error In Backend API Call" });
    }
}