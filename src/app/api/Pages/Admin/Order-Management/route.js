import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

//Get The Orders Data
export async function GET() {
    try {
        const connection = await getConnection();

        const [recentOrder] = await connection.execute(`
            SELECT 
                o.id AS order_id,
                o.order_date,
                o.payment_method,
                o.shipping_address,
                o.is_paid,
                o.receipt_url,
                o.status AS order_status,
                o.created_at AS order_created_at,
                c.id AS customer_id,
                c.customer_name,
                c.location,
                u.id AS user_id,
                u.firstName,
                u.lastName,
                u.email,
                u.phone,
                oi.id AS order_item_id,
                oi.quantity,
                oi.price AS item_price,
                p.id AS product_id,
                p.name AS product_name,
                p.price AS product_price,
                cat.id AS category_id,
                cat.name AS category_name
            FROM orders o
            LEFT JOIN customers c ON o.customer_id = c.id
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            LEFT JOIN categories cat ON p.category_id = cat.id
            ORDER BY o.created_at DESC, oi.id ASC
        `);
        console.log("Backend API To Get Users, Categories, Products Images, Products, Order Items, Orders & Customers.");

        //Order Grouping
        const orderMap = {};

        for (const row of recentOrder) {
            if (!orderMap[row.order_id]) {
                orderMap[row.order_id] = {
                    order_id: row.order_id,
                    order_date: row.order_date,
                    payment_method: row.payment_method,
                    shipping_address: row.shipping_address,
                    is_paid: row.is_paid,
                    receipt_url: row.receipt_url,
                    order_status: row.order_status,
                    order_created_at: row.order_created_at,
                    customer: {
                        id: row.customer_id,
                        customer_name: row.customer_name,
                        location: row.location,
                    },
                    user: {
                        id: row.user_id,
                        firstName: row.firstName,
                        lastName: row.lastName,
                        email: row.email,
                        phone: row.phone,
                    },
                    items: [],
                };
            }

            if (row.product_id) {
                orderMap[row.order_id].items.push({
                    order_item_id: row.order_item_id,
                    product_id: row.product_id,
                    product_name: row.product_name,
                    product_price: row.product_price,
                    quantity: row.quantity,
                    item_price: row.item_price,
                    category: {
                        id: row.category_id,
                        name: row.category_name,
                    },
                });
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                recent_orders: Object.values(orderMap),
            },
        }, { status: 200 });
    } catch (error) {
        console.error("Error Getting Orders Data:", error);
        return NextResponse.json({ message: "Error In Backend API Call" });
    }
}

//Edit Orders
export async function PUT(request) {
    try {
        //Database Connection
        const connection = await getConnection();
        const body = await request.json();

        const {
            order_id,
            status,
            is_paid,
            shipping_address,
            receipt_url,
            payment_method
        } = body;

        //Basic Validation Check
        if (!order_id) {
            return NextResponse.json({
                success: false,
                message: "Order ID is required"
            }, { status: 400 });
        }

        // Build dynamic update fields
        const fields = [];
        const values = [];

        if (status !== undefined) {
            fields.push("status = ?");
            values.push(status);
        }

        if (is_paid !== undefined) {
            fields.push("is_paid = ?");
            values.push(is_paid);
        }

        if (shipping_address !== undefined) {
            fields.push("shipping_address = ?");
            values.push(shipping_address);
        }

        if (receipt_url !== undefined) {
            fields.push("receipt_url = ?");
            values.push(receipt_url);
        }

        if (payment_method !== undefined) {
            fields.push("payment_method = ?");
            values.push(payment_method);
        }

        if (fields.length === 0) {
            return NextResponse.json(
                { success: false, message: "No fields provided to update." },
                { status: 400 }
            );
        }
        values.push(order_id);

        // Update Order
        const [result] = await connection.execute(
            `UPDATE orders SET ${fields.join(", ")} WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { success: false, message: "Order not found." },
                { status: 404 }
            );
        }

        // Fetch updated order
        const [updatedOrder] = await connection.execute(
            `SELECT * FROM orders WHERE id = ?`,
            [order_id]
        );

        return NextResponse.json({
            success: true,
            message: "Order updated successfully",
            data: updatedOrder[0]
        }, { status: 200 });
    } catch (error) {
        console.error("Error Editing Orders:", error);
        return NextResponse.json({ message: "Error In Backend API Call" });
    }
}