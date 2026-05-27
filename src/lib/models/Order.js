import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  order_date: { type: Date, default: Date.now },
  payment_method: { type: String },
  shipping_address: { type: String },
  is_paid: { type: Boolean, default: false },
  receipt_url: { type: String },
  status: { type: String },
  
  // Tracking details
  shipping_partner: { type: String },
  tracking_url: { type: String },
  expected_delivery_date: { type: Date },
  
  // Customer delivery confirmation
  delivery_received: { type: Boolean },
  delivery_remarks: { type: String },
  delivery_feedback: { type: String },
  delivery_confirmed_at: { type: Date },
  is_refunded: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
