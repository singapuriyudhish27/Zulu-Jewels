import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  checkout_id: { type: String, index: true },
  order_date: { type: Date, default: Date.now },
  payment_method: { type: String },
  provider: { type: String, enum: ['stripe', 'razorpay', null], default: null },
  payment_key: { type: String, sparse: true }, // "${provider}:${payment_id}"
  payment_id: { type: String, sparse: true },
  receipt_url: { type: String },
  shipping_address: { type: String },
  is_paid: { type: Boolean, default: false },

  // Integer Minor Units (Paise)
  subtotal_paise: { type: Number },
  discount_paise: { type: Number, default: 0 },
  tax_paise: { type: Number, default: 0 },
  shipping_paise: { type: Number, default: 0 },
  total_paise: { type: Number },

  // Order Lifecycle State Machine
  status: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'RefundPending', 'Refunded'],
    default: 'Processing'
  },
  
  // Refund Tracking
  is_refunded: { type: Boolean, default: false },
  refund_status: { 
    type: String, 
    enum: ['NONE', 'REFUND_PENDING', 'REFUND_REQUESTED', 'REFUND_PROCESSING', 'REFUNDED', 'REFUND_FAILED'], 
    default: 'NONE' 
  },
  refund_id: { type: String, default: null },
  refund_amount_paise: { type: Number, default: 0 },
  refund_reason: { type: String, default: null },

  // Tracking details
  shipping_partner: { type: String },
  tracking_url: { type: String },
  expected_delivery_date: { type: Date },
  
  // Customer delivery confirmation
  delivery_received: { type: Boolean },
  delivery_remarks: { type: String },
  delivery_feedback: { type: String },
  delivery_confirmed_at: { type: Date },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

OrderSchema.index({ payment_key: 1 }, { unique: true, sparse: true });
OrderSchema.index({ payment_id: 1 }, { unique: true, sparse: true });
OrderSchema.index({ customer_id: 1, created_at: -1 });
OrderSchema.index({ status: 1, created_at: -1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
