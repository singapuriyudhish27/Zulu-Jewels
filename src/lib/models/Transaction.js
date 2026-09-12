import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  provider: { type: String, enum: ['stripe', 'razorpay', null], default: null },
  payment_key: { type: String, sparse: true }, // "${provider}:${payment_id}"
  payment_id: { type: String, sparse: true },
  amount: { type: Number }, // In Rupees
  amount_paise: { type: Number }, // In integer minor units (paise)
  currency: { type: String, default: 'INR' },
  payment_method: { type: String },
  status: { type: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

TransactionSchema.index({ payment_key: 1 }, { unique: true, sparse: true });
TransactionSchema.index({ payment_id: 1 }, { unique: true, sparse: true });
TransactionSchema.index({ created_at: -1 });
TransactionSchema.index({ order_id: 1 });
TransactionSchema.index({ customer_id: 1, created_at: -1 });

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
