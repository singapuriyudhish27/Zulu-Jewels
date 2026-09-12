import mongoose from 'mongoose';

const RefundRecordSchema = new mongoose.Schema({
  refund_operation_id: { type: String, required: true, unique: true, index: true }, // "ref_${order_id}_${reason}"
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  payment_key: { type: String, required: true, index: true },
  provider: { type: String, enum: ['stripe', 'razorpay'], required: true },
  amount_paise: { type: Number, required: true },
  currency: { type: String, required: true, default: 'INR' },
  provider_refund_id: { type: String, default: null },
  status: { 
    type: String, 
    enum: ['REQUESTED', 'PROCESSING', 'REFUNDED', 'FAILED'], 
    default: 'REQUESTED' 
  },
  lease_token: { type: String, default: null },
  lease_expires_at: { type: Date, default: null },
  attempt_count: { type: Number, default: 0 },
  last_error: { type: String, default: null }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

RefundRecordSchema.index({ status: 1, lease_expires_at: 1 });

export default mongoose.models.RefundRecord || mongoose.model('RefundRecord', RefundRecordSchema);
