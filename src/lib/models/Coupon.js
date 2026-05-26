import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
  coupon_code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true },
  discount_type: { type: String, enum: ['%', '$'], required: true },
  min_order_amount: { type: Number, default: null },
  max_discount: { type: Number, default: null },
  valid_until: { type: Date, default: null },
  is_active: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export default mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
