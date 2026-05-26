import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', default: null },
  quantity: { type: Number, required: true, default: 1 },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

CartItemSchema.index({ user_id: 1, product_id: 1, variant_id: 1 }, { unique: true });

export default mongoose.models.CartItem || mongoose.model('CartItem', CartItemSchema);
