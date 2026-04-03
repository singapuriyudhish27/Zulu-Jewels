import { getConnection } from "./db";

/**
 * Handles the database transaction for creating an order after a successful payment.
 * @param {number} userId - The ID of the user placing the order.
 * @param {object} details - Object containing payment_method, shipping_address, receipt_url, and optional specificItem.
 */
export async function processOrderSuccess(userId, details) {
    const { payment_method, receipt_url, specificItem = null } = details;
    const shipping_address = specificItem?.shippingAddress || details.shipping_address || "N/A";
    const connection = await getConnection();

    let finalAmount = 0;
    try {
        await connection.beginTransaction();

        // 1. Get or Create Customer ID link
        const [customers] = await connection.execute(
            "SELECT id FROM customers WHERE user_id = ?",
            [userId]
        );

        let customerId;
        if (customers.length > 0) {
            customerId = customers[0].id;
        } else {
            // Need to fetch user details to create a minimal customer entry
            const [users] = await connection.execute(
                "SELECT firstName, lastName FROM users WHERE id = ?",
                [userId]
            );
            if (users.length === 0) throw new Error("User not found");
            
            const [result] = await connection.execute(
                "INSERT INTO customers (user_id, customer_name, location) VALUES (?, ?, ?)",
                [userId, `${users[0].firstName} ${users[0].lastName}`, shipping_address]
            );
            customerId = result.insertId;
        }

        // 2. Insert the main Order record
        const [orderResult] = await connection.execute(
            "INSERT INTO orders (customer_id, payment_method, shipping_address, is_paid, receipt_url, status) VALUES (?, ?, ?, ?, ?, ?)",
            [customerId, payment_method, shipping_address, true, receipt_url, "Processing"]
        );
        const orderId = orderResult.insertId;

        // 3. Insert Order Items
        if (specificItem) {
            // Case A: Single Item Purchase (e.g., from Product Details "Checkout Now")
            await connection.execute(
                "INSERT INTO order_items (order_id, product_id, variant_id, quantity, price) VALUES (?, ?, ?, ?, ?)",
                [
                    orderId, 
                    specificItem.productId, 
                    specificItem.variantId || null, 
                    specificItem.quantity || 1, 
                    specificItem.price
                ]
            );
            finalAmount = specificItem.price;
        } else {
            // Case B: Whole Cart Purchase
            const [cartItems] = await connection.execute(`
                SELECT ci.product_id, ci.variant_id, ci.quantity, COALESCE(pv.price, p.price) as unit_price
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                LEFT JOIN product_variants pv ON ci.variant_id = pv.id
                WHERE ci.user_id = ?
            `, [userId]);

            if (cartItems.length === 0) {
                // If the cart is empty but a payment was made, something is wrong
                // but we should still record the order if money was received.
                console.warn(`Payment received but cart is empty for user ${userId}`);
            }

            let totalCartAmount = 0;
            for (const item of cartItems) {
                const itemTotal = item.unit_price * item.quantity;
                totalCartAmount += itemTotal;
                await connection.execute(
                    "INSERT INTO order_items (order_id, product_id, variant_id, quantity, price) VALUES (?, ?, ?, ?, ?)",
                    [orderId, item.product_id, item.variant_id || null, item.quantity, item.unit_price]
                );
            }

            // 4. Clear the User's Cart now that order is placed
            await connection.execute("DELETE FROM cart_items WHERE user_id = ?", [userId]);

            // Set amount for transaction record 
            finalAmount = totalCartAmount;
        }

        // 5. Duplicate the record into Transactions table for record keeping
        await connection.execute(
            "INSERT INTO transactions (order_id, customer_id, amount, payment_method, status) VALUES (?, ?, ?, ?, ?)",
            [orderId, customerId, finalAmount, payment_method, "Success"]
        );

        await connection.commit();
        return { success: true, orderId };
    } catch (error) {
        await connection.rollback();
        console.error("Critical: Order Processing Transaction Failed:", error);
        throw error;
    }
}
