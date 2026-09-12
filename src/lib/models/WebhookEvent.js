import mongoose from 'mongoose';

const WebhookEventSchema = new mongoose.Schema({
  provider: { type: String, enum: ['stripe', 'razorpay'], required: true },
  event_id: { type: String, required: true },
  event_type: { type: String, required: true },
  processing_status: { 
    type: String, 
    enum: ['RECEIVED', 'PROCESSING', 'PROCESSED', 'FAILED', 'IGNORED'], 
    default: 'RECEIVED' 
  },
  attempt_count: { type: Number, default: 0 },
  last_error: { type: String, default: null },
  processed_at: { type: Date, default: null }
}, { timestamps: { createdAt: 'received_at', updatedAt: 'updated_at' } });

// Compound unique index ensuring idempotency per provider event
WebhookEventSchema.index({ provider: 1, event_id: 1 }, { unique: true });

export default mongoose.models.WebhookEvent || mongoose.model('WebhookEvent', WebhookEventSchema);
