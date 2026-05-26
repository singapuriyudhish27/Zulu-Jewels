import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  order_date: { type: Date, default: Date.now },
  payment_method: { type: String },
  shipping_address: { type: String },
  is_paid: { type: Boolean, default: false },
  receipt_url: { type: String },
  status: { type: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
