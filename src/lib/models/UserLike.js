import mongoose from 'mongoose';

const UserLikeSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', default: null },
  is_custom: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

UserLikeSchema.index({ user_id: 1, product_id: 1, variant_id: 1 }, { unique: true });

export default mongoose.models.UserLike || mongoose.model('UserLike', UserLikeSchema);
