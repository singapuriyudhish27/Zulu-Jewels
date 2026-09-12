import crypto from 'crypto';
import { connectDB } from './db';
import OrderSideEffect from './models/OrderSideEffect';
import { sendOrderEmail } from './emailService';
import { buildOrderEmailData } from './orderUtils';

let isWorkerActive = false;

/**
 * Single-worker bounded outbox dispatcher.
 * Guaranteed to execute at most 1 job concurrently on 1-vCPU server.
 * Provides at-least-once delivery with deterministic deduplication keys.
 */
export async function dispatchOutboxJob() {
    if (isWorkerActive) return;
    isWorkerActive = true;

    try {
        await connectDB();
        
        while (true) {
            const leaseToken = crypto.randomUUID();
            const now = new Date();
            const leaseDurationMs = 60000; // 1 minute lease
            const leaseExpiresAt = new Date(now.getTime() + leaseDurationMs);

            // Atomically acquire next eligible side-effect job
            const job = await OrderSideEffect.findOneAndUpdate(
                {
                    status: { $in: ['PENDING', 'FAILED'] },
                    next_attempt_at: { $lte: now },
                    attempt_count: { $lt: 5 },
                    $or: [
                        { lease_token: null },
                        { lease_expires_at: { $lt: now } }
                    ]
                },
                {
                    $set: { 
                        status: 'PROCESSING', 
                        lease_token: leaseToken, 
                        lease_expires_at: leaseExpiresAt 
                    },
                    $inc: { attempt_count: 1 }
                },
                { sort: { next_attempt_at: 1 }, new: true }
            );

            if (!job) {
                break; // No pending jobs in outbox
            }

            try {
                const emailData = await buildOrderEmailData(job.order_id);
                if (emailData) {
                    await sendOrderEmail(job.type, emailData);
                }

                // Mark completed and release lease
                await OrderSideEffect.updateOne(
                    { _id: job._id, lease_token: leaseToken },
                    { 
                        $set: { 
                            status: 'COMPLETED', 
                            lease_token: null, 
                            lease_expires_at: null,
                            last_error: null 
                        } 
                    }
                );
            } catch (jobErr) {
                console.error(`[OrderOutbox] Job ${job.operation_key} failed:`, jobErr.message);
                
                // Exponential backoff: 2s, 4s, 8s, 16s...
                const backoffMs = Math.pow(2, job.attempt_count) * 2000;
                const nextAttempt = new Date(Date.now() + backoffMs);

                await OrderSideEffect.updateOne(
                    { _id: job._id, lease_token: leaseToken },
                    { 
                        $set: { 
                            status: 'FAILED', 
                            lease_token: null, 
                            next_attempt_at: nextAttempt,
                            last_error: jobErr.message 
                        } 
                    }
                );
            }
        }
    } catch (workerErr) {
        console.error('[OrderOutbox] Worker loop error:', workerErr.message);
    } finally {
        isWorkerActive = false;
    }
}

/**
 * Self-healing outbox recovery poller.
 * Ensures backed-off retries are processed even without incoming order triggers.
 */
let schedulerStarted = false;
export function startOutboxScheduler(intervalMs = 30000) {
    if (schedulerStarted || typeof window !== 'undefined') return;
    schedulerStarted = true;
    const timer = setInterval(() => {
        dispatchOutboxJob().catch(err => {
            console.error('[OrderOutbox] Scheduler run error:', err.message);
        });
    }, intervalMs);
    if (timer.unref) timer.unref();
}
