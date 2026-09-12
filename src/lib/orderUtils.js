import mongoose from 'mongoose';
import crypto from 'crypto';
import { connectDB } from './db';
import Customer from './models/Customer';
import User from './models/User';
import Order from './models/Order';
import OrderItem from './models/OrderItem';
import CartItem from './models/CartItem';
import ProductVariant from './models/ProductVariant';
import Product from './models/Product';
import Transaction from './models/Transaction';
import UserAddress from './models/UserAddress';
import CheckoutSession from './models/CheckoutSession';
import PaymentProcessing from './models/PaymentProcessing';
import InventoryJournal from './models/InventoryJournal';
import OrderSideEffect from './models/OrderSideEffect';
import RefundRecord from './models/RefundRecord';
import { dispatchOutboxJob, startOutboxScheduler } from './orderOutbox';

/**
 * Builds the full enriched data object needed by email templates & the PDF invoice.
 * Uses batched lookups to eliminate N+1 queries.
 */
export async function buildOrderEmailData(orderId) {
    try {
        await connectDB();
        const order = await Order.findById(orderId).lean();
        if (!order) return null;

        const customer = order.customer_id ? await Customer.findById(order.customer_id).lean() : null;
        const user = customer?.user_id
            ? await User.findById(customer.user_id).select('firstName lastName email phone').lean()
            : null;

        const rawItems = await OrderItem.find({ order_id: orderId }).sort({ _id: 1 }).lean();
        
        const productIds = [...new Set(rawItems.map(i => i.product_id?.toString()).filter(Boolean))];
        const variantIds = [...new Set(rawItems.map(i => i.variant_id?.toString()).filter(Boolean))];

        const [products, variants] = await Promise.all([
            productIds.length > 0 ? Product.find({ _id: { $in: productIds } }).select('_id name price').lean() : [],
            variantIds.length > 0 ? ProductVariant.find({ _id: { $in: variantIds } }).select('_id material price').lean() : []
        ]);

        const productMap = new Map(products.map(p => [p._id.toString(), p]));
        const variantMap = new Map(variants.map(v => [v._id.toString(), v]));

        const items = rawItems.map(oi => {
            const product = oi.product_id ? productMap.get(oi.product_id.toString()) : null;
            const variant = oi.variant_id ? variantMap.get(oi.variant_id.toString()) : null;
            return {
                product_name: product?.name || 'Jewelry Item',
                product_id: oi.product_id,
                variant_id: oi.variant_id || null,
                quantity: oi.quantity,
                price: oi.price,
                variant_material: variant?.material || null,
            };
        });

        const transaction = await Transaction.findOne({ order_id: orderId }).lean();

        return { order, customer, user, items, transaction };
    } catch (err) {
        console.error('[OrderUtils] buildOrderEmailData error:', err.message);
        return null;
    }
}

/**
 * Core Resumable Payment Processing Pipeline.
 * 
 * Guarantees:
 * 1. Provider-scoped identity (`payment_key = "${provider}:${payment_id}"`)
 * 2. Atomic lease fencing preventing concurrent worker execution collisions
 * 3. Durable 3-state InventoryJournal (`PENDING -> APPLYING -> APPLIED`) with safe crash reclamation
 * 4. Stepwise resumability across crashes (at-least-once processing with durable idempotency)
 * 5. REQUIRES_RECONCILIATION state + automated refund scheduling if inventory allocation fails
 */
export async function processOrderSuccess(userId, details) {
    const { 
        provider = 'stripe', 
        payment_id = null, 
        payment_method = provider === 'stripe' ? 'Stripe' : 'RazorPay',
        receipt_url = null, 
        specificItem = null,
        checkout_id: passedCheckoutId = null
    } = details;

    if (!payment_id) {
        throw new Error("Missing required payment_id for order processing");
    }

    const payment_key = `${provider.toLowerCase()}:${payment_id}`;
    await connectDB();

    // 1. Fast path: Check if order already fully completed
    const existingCompleted = await PaymentProcessing.findOne({ payment_key, status: 'COMPLETED' }).lean();
    if (existingCompleted && existingCompleted.order_id) {
        console.log(`[OrderUtils] Idempotency fast-path: Order ${existingCompleted.order_id} already completed for ${payment_key}`);
        return { success: true, orderId: existingCompleted.order_id, duplicate: true };
    }

    // 2. Fallback check on Order directly (handles legacy orders)
    const existingOrder = await Order.findOne({ 
        $or: [
            { payment_key },
            { payment_id }
        ] 
    }).lean();

    if (existingOrder) {
        console.log(`[OrderUtils] Existing order ${existingOrder._id} found for payment ${payment_key}`);
        // Backfill payment_key if missing on legacy order
        if (!existingOrder.payment_key) {
            await Order.updateOne({ _id: existingOrder._id }, { $set: { payment_key } });
        }
        return { success: true, orderId: existingOrder._id, duplicate: true };
    }

    // 3. Resolve CheckoutSession
    let checkoutSession = null;
    const checkout_id = passedCheckoutId || details.checkoutId || details.checkout_id;
    if (checkout_id) {
        checkoutSession = await CheckoutSession.findOne({ checkout_id }).lean();
    }
    if (!checkoutSession) {
        checkoutSession = await CheckoutSession.findOne({ provider_order_id: payment_id }).lean();
    }

    const amount_paise = checkoutSession?.pricing?.total_paise || Math.round(Number(details.amount || 0) * 100);
    const currency = checkoutSession?.pricing?.currency || details.currency || 'INR';

    // 4. Acquire / Resume Lease on PaymentProcessing
    const leaseToken = crypto.randomUUID();
    const leaseDurationMs = 30000; // 30 second lease
    const now = new Date();
    const leaseExpiresAt = new Date(now.getTime() + leaseDurationMs);

    let procRecord = await PaymentProcessing.findOneAndUpdate(
        {
            payment_key,
            $or: [
                { lease_token: null },
                { lease_expires_at: { $lt: now } },
                { status: { $in: ['INITIATED', 'VERIFIED', 'INVENTORY_ALLOCATING', 'ORDER_CREATING'] } }
            ]
        },
        {
            $set: { lease_token: leaseToken, lease_expires_at: leaseExpiresAt },
            $inc: { attempt_count: 1 },
            $setOnInsert: {
                provider: provider.toLowerCase(),
                payment_id,
                checkout_id: checkout_id || `chk_${payment_id}`,
                user_id: userId,
                amount_paise,
                currency,
                status: 'VERIFIED'
            }
        },
        { upsert: true, new: true }
    );

    if (!procRecord || (procRecord.lease_token !== leaseToken && procRecord.lease_expires_at > now)) {
        // Another active worker holds the lease; return clean in-progress response
        console.log(`[OrderUtils] Lease locked by another active process for ${payment_key}. Yielding.`);
        return { success: true, inProgress: true };
    }

    try {
        // 5. Build Items List for Inventory Allocation & Order Items
        let itemsToProcess = [];
        if (checkoutSession && checkoutSession.items && checkoutSession.items.length > 0) {
            itemsToProcess = checkoutSession.items.map(it => ({
                product_id: it.product_id,
                variant_id: it.variant_id || null,
                quantity: it.quantity,
                unit_price_paise: it.unit_price_paise,
                item_total_paise: it.item_total_paise,
                price: it.unit_price_paise / 100
            }));
        } else if (specificItem) {
            const qty = Math.max(parseInt(specificItem.quantity || 1, 10), 1);
            const unitPrice = Math.round(Number(specificItem.price || 0));
            itemsToProcess = [{
                product_id: specificItem.productId || specificItem.product_id,
                variant_id: specificItem.variantId || specificItem.variant_id || null,
                quantity: qty,
                unit_price_paise: unitPrice * 100,
                item_total_paise: unitPrice * qty * 100,
                price: unitPrice
            }];
        } else {
            // Cart item fallback
            const cartItems = await CartItem.find({ user_id: userId }).lean();
            if (cartItems.length > 0) {
                const pIds = [...new Set(cartItems.map(c => c.product_id?.toString()).filter(Boolean))];
                const vIds = [...new Set(cartItems.map(c => c.variant_id?.toString()).filter(Boolean))];
                const [products, variants] = await Promise.all([
                    pIds.length > 0 ? Product.find({ _id: { $in: pIds } }).lean() : [],
                    vIds.length > 0 ? ProductVariant.find({ _id: { $in: vIds } }).lean() : []
                ]);
                const pMap = new Map(products.map(p => [p._id.toString(), p]));
                const vMap = new Map(variants.map(v => [v._id.toString(), v]));

                for (const ci of cartItems) {
                    const variant = ci.variant_id ? vMap.get(ci.variant_id.toString()) : null;
                    const product = ci.product_id ? pMap.get(ci.product_id.toString()) : null;
                    const unitPrice = variant ? variant.price : (product ? product.price : 0);
                    const qty = Math.max(parseInt(ci.quantity || 1, 10), 1);
                    itemsToProcess.push({
                        product_id: ci.product_id,
                        variant_id: ci.variant_id || null,
                        quantity: qty,
                        unit_price_paise: Math.round(unitPrice * 100),
                        item_total_paise: Math.round(unitPrice * qty * 100),
                        price: unitPrice
                    });
                }
            }
        }

        // 6. Concurrency-Safe Inventory Allocation via InventoryJournal
        const invOperationId = `inv_${payment_key}`;
        let journal = await InventoryJournal.findOne({ operation_id: invOperationId });

        if (!journal || journal.status !== 'APPLIED') {
            await PaymentProcessing.updateOne(
                { _id: procRecord._id, lease_token: leaseToken },
                { $set: { status: 'INVENTORY_ALLOCATING' } }
            );

            // Initialize or claim journal
            const journalItems = itemsToProcess
                .filter(it => it.variant_id)
                .map(it => ({ variant_id: it.variant_id, quantity: it.quantity, allocated: false }));

            if (!journal) {
                journal = await InventoryJournal.create({
                    operation_id: invOperationId,
                    checkout_id: procRecord.checkout_id,
                    status: 'APPLYING',
                    lease_token: leaseToken,
                    lease_expires_at: leaseExpiresAt,
                    attempt_count: 1,
                    items: journalItems
                });
            } else {
                journal = await InventoryJournal.findOneAndUpdate(
                    { 
                        operation_id: invOperationId, 
                        status: { $in: ['PENDING', 'APPLYING'] } 
                    },
                    { 
                        $set: { status: 'APPLYING', lease_token: leaseToken, lease_expires_at: leaseExpiresAt },
                        $inc: { attempt_count: 1 }
                    },
                    { new: true }
                );
            }

            // Decrement variant stock atomically for unallocated items
            let allocationFailed = false;
            let failedVariantId = null;

            for (let i = 0; i < journal.items.length; i++) {
                const item = journal.items[i];
                if (item.allocated) continue; // Already allocated in prior attempt

                const updateRes = await ProductVariant.updateOne(
                    { _id: item.variant_id, stock: { $gte: item.quantity } },
                    { $inc: { stock: -item.quantity } }
                );

                if (updateRes.matchedCount === 0) {
                    allocationFailed = true;
                    failedVariantId = item.variant_id;
                    break;
                }

                // Flag variant allocated in journal
                await InventoryJournal.updateOne(
                    { operation_id: invOperationId, 'items.variant_id': item.variant_id },
                    { $set: { 'items.$.allocated': true } }
                );
            }

            if (allocationFailed) {
                console.error(`[OrderUtils] INSUFFICIENT_STOCK: Variant ${failedVariantId} out of stock for ${payment_key}`);
                
                // Rollback allocated variants atomically
                await InventoryJournal.updateOne(
                    { operation_id: invOperationId },
                    { $set: { status: 'ROLLING_BACK' } }
                );

                const currentJournal = await InventoryJournal.findOne({ operation_id: invOperationId }).lean();
                for (const allocatedItem of currentJournal.items.filter(it => it.allocated)) {
                    await ProductVariant.updateOne(
                        { _id: allocatedItem.variant_id },
                        { $inc: { stock: allocatedItem.quantity } }
                    );
                }

                await InventoryJournal.updateOne(
                    { operation_id: invOperationId },
                    { $set: { status: 'ROLLED_BACK' } }
                );

                // Transition to REQUIRES_RECONCILIATION and schedule automated refund
                await PaymentProcessing.updateOne(
                    { _id: procRecord._id, lease_token: leaseToken },
                    { 
                        $set: { 
                            status: 'REQUIRES_RECONCILIATION', 
                            last_error: `INSUFFICIENT_STOCK: Variant ${failedVariantId}`,
                            lease_token: null 
                        } 
                    }
                );

                const refundOpId = `ref_reconcile_${payment_key.replace(':', '_')}`;
                await RefundRecord.findOneAndUpdate(
                    { refund_operation_id: refundOpId },
                    {
                        $setOnInsert: {
                            refund_operation_id: refundOpId,
                            order_id: new mongoose.Types.ObjectId(), // placeholder
                            payment_key,
                            provider: provider.toLowerCase(),
                            amount_paise,
                            currency,
                            status: 'REQUESTED'
                        }
                    },
                    { upsert: true }
                );

                throw new Error(`INSUFFICIENT_STOCK: Inventory allocation failed for variant ${failedVariantId}`);
            }

            // Successfully allocated all variants
            await InventoryJournal.updateOne(
                { operation_id: invOperationId },
                { $set: { status: 'APPLIED', lease_token: null } }
            );

            await PaymentProcessing.updateOne(
                { _id: procRecord._id, lease_token: leaseToken },
                { $set: { status: 'INVENTORY_ALLOCATED' } }
            );
        }

        // 7. Resolve Customer & Shipping Address
        let shipping_address = checkoutSession?.shipping_address || details.shipping_address;
        if (!shipping_address || shipping_address === "N/A") {
            const defaultAddr = await UserAddress.findOne({ user_id: userId, is_default: true }).lean();
            shipping_address = defaultAddr ? defaultAddr.address_line : "N/A";
        }

        let customer = await Customer.findOne({ user_id: userId }).lean();
        let customerId;
        if (customer) {
            customerId = customer._id;
        } else {
            const user = await User.findById(userId).lean();
            const newCustomer = await Customer.create([{
                user_id: userId,
                customer_name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Valued Customer',
                location: shipping_address
            }]);
            customerId = newCustomer[0]._id;
        }

        // 8. Resumable Order Creation
        await PaymentProcessing.updateOne(
            { _id: procRecord._id, lease_token: leaseToken },
            { $set: { status: 'ORDER_CREATING' } }
        );

        let order = await Order.findOne({ payment_key });
        if (!order) {
            const createdOrders = await Order.create([{
                customer_id: customerId,
                checkout_id: procRecord.checkout_id,
                payment_method,
                provider: provider.toLowerCase(),
                payment_key,
                payment_id,
                receipt_url: receipt_url || `https://dashboard.${provider}.com/payments/${payment_id}`,
                shipping_address,
                is_paid: true,
                status: "Processing",
                subtotal_paise: checkoutSession?.pricing?.subtotal_paise || amount_paise,
                discount_paise: checkoutSession?.pricing?.discount_paise || 0,
                tax_paise: checkoutSession?.pricing?.tax_paise || 0,
                shipping_paise: checkoutSession?.pricing?.shipping_paise || 0,
                total_paise: amount_paise
            }]);
            order = createdOrders[0];
        }

        await PaymentProcessing.updateOne(
            { _id: procRecord._id, lease_token: leaseToken },
            { $set: { status: 'ORDER_CREATED', order_id: order._id } }
        );

        // 9. Resumable OrderItems Creation
        const existingItemCount = await OrderItem.countDocuments({ order_id: order._id });
        if (existingItemCount === 0 && itemsToProcess.length > 0) {
            const orderItemsPayload = itemsToProcess.map(it => ({
                order_id: order._id,
                product_id: it.product_id,
                variant_id: it.variant_id || null,
                quantity: it.quantity,
                price: it.price
            }));
            await OrderItem.create(orderItemsPayload);
        }

        // 10. Resumable Transaction Creation
        let transaction = await Transaction.findOne({ payment_key });
        if (!transaction) {
            const createdTx = await Transaction.create([{
                order_id: order._id,
                customer_id: customerId,
                provider: provider.toLowerCase(),
                payment_key,
                payment_id,
                amount: amount_paise / 100,
                amount_paise,
                currency,
                payment_method,
                status: "Success"
            }]);
            transaction = createdTx[0];
        }

        await PaymentProcessing.updateOne(
            { _id: procRecord._id, lease_token: leaseToken },
            { $set: { status: 'TRANSACTION_CREATED', transaction_id: transaction._id } }
        );

        // 11. Scoped Cart Cleanup (Do NOT wipe unrelated cart items or "Buy Now" specificItem checkouts)
        if (!specificItem && itemsToProcess.length > 0) {
            const variantIdsToClear = itemsToProcess.map(it => it.variant_id).filter(Boolean);
            const productIdsToClear = itemsToProcess.map(it => it.product_id).filter(Boolean);

            await CartItem.deleteMany({
                user_id: userId,
                $or: [
                    ...(variantIdsToClear.length > 0 ? [{ variant_id: { $in: variantIdsToClear } }] : []),
                    { product_id: { $in: productIdsToClear } }
                ]
            });
        }

        // 12. Mark CheckoutSession as COMPLETED
        if (checkoutSession) {
            await CheckoutSession.updateOne(
                { _id: checkoutSession._id },
                { $set: { status: 'COMPLETED' } }
            );
        }

        // 13. Enqueue Transactional Side Effects into Durable Outbox
        const emailOpKey = `email_placed_${order._id}`;
        await OrderSideEffect.findOneAndUpdate(
            { operation_key: emailOpKey },
            {
                $setOnInsert: {
                    operation_key: emailOpKey,
                    type: 'order_placed',
                    order_id: order._id,
                    status: 'PENDING',
                    next_attempt_at: new Date()
                }
            },
            { upsert: true }
        );

        // 14. Terminal Success Transition
        await PaymentProcessing.updateOne(
            { _id: procRecord._id, lease_token: leaseToken },
            { 
                $set: { 
                    status: 'COMPLETED',
                    lease_token: null,
                    lease_expires_at: null,
                    last_error: null 
                } 
            }
        );

        // Trigger asynchronous outbox dispatch & self-healing poller
        startOutboxScheduler();
        dispatchOutboxJob().catch(err => console.error('[OrderUtils] Outbox trigger error:', err.message));

        return { success: true, orderId: order._id };

    } catch (error) {
        console.error("[OrderUtils] Error in processOrderSuccess:", error.message);
        
        // Release lease on unhandled crash so retries or reconciliation can resume
        await PaymentProcessing.updateOne(
            { _id: procRecord._id, lease_token: leaseToken },
            { 
                $set: { 
                    lease_token: null,
                    last_error: error.message 
                } 
            }
        );

        throw error;
    }
}
