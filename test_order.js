const { processOrderSuccess } = require('./src/lib/orderUtils');
const { getConnection } = require('./src/lib/db');

async function test() {
    console.log("Starting order processing test...");
    try {
        // Use a dummy userId (make sure user ID 1 exists or change it)
        const userId = 1; 
        
        const details = {
            payment_method: "TestMethod",
            shipping_address: "123 Test St, Test City",
            receipt_url: "http://test.com/receipt",
            specificItem: {
                productId: 1, // Make sure product ID 1 exists
                variantId: null,
                quantity: 1,
                price: 999
            }
        };

        const result = await processOrderSuccess(userId, details);
        console.log("✅ Test successful! Result:", result);

        const connection = await getConnection();
        const [orders] = await connection.execute("SELECT * FROM orders WHERE id = ?", [result.orderId]);
        console.log("Order found in DB:", orders[0]);

        const [items] = await connection.execute("SELECT * FROM order_items WHERE order_id = ?", [result.orderId]);
        console.log("Order items found in DB:", items);

    } catch (error) {
        console.error("❌ Test failed:", error);
    } finally {
        process.exit();
    }
}

test();
