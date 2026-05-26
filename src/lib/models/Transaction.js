import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  amount: { type: Number },
  payment_method: { type: String },
  status: { type: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
