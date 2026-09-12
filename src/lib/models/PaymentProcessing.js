import mongoose from 'mongoose';

const PaymentProcessingSchema = new mongoose.Schema({
  payment_key: { type: String, required: true, unique: true, index: true }, // "${provider}:${payment_id}"
  provider: { type: String, enum: ['stripe', 'razorpay'], required: true },
  payment_id: { type: String, required: true },
  checkout_id: { type: String, required: true, index: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount_paise: { type: Number, required: true },
  currency: { type: String, required: true, default: 'INR' },
  status: {
    type: String,
    enum: [
      'INITIATED',
      'VERIFIED',
      'INVENTORY_ALLOCATING',
      'INVENTORY_ALLOCATED',
      'ORDER_CREATING',
      'ORDER_CREATED',
      'TRANSACTION_CREATED',
      'COMPLETED',
      'FAILED',
      'REQUIRES_RECONCILIATION'
    ],
    default: 'INITIATED'
  },
  lease_token: { type: String, default: null },
  lease_expires_at: { type: Date, default: null },
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  transaction_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', default: null },
  attempt_count: { type: Number, default: 0 },
  last_error: { type: String, default: null }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

PaymentProcessingSchema.index({ status: 1, lease_expires_at: 1 });

export default mongoose.models.PaymentProcessing || mongoose.model('PaymentProcessing', PaymentProcessingSchema);
