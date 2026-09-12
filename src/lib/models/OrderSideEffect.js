import mongoose from 'mongoose';

const OrderSideEffectSchema = new mongoose.Schema({
  operation_key: { type: String, required: true, unique: true, index: true }, // e.g. "email_placed_${order_id}"
  type: { 
    type: String, 
    enum: ['order_placed', 'order_shipped', 'order_delivered', 'order_cancelled', 'order_refunded'], 
    required: true 
  },
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'], 
    default: 'PENDING' 
  },
  lease_token: { type: String, default: null },
  lease_expires_at: { type: Date, default: null },
  attempt_count: { type: Number, default: 0 },
  next_attempt_at: { type: Date, default: Date.now, index: true },
  last_error: { type: String, default: null }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

OrderSideEffectSchema.index({ status: 1, next_attempt_at: 1 });

export default mongoose.models.OrderSideEffect || mongoose.model('OrderSideEffect', OrderSideEffectSchema);
