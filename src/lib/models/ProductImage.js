import mongoose from 'mongoose';

const ProductImageSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', default: null },
  media_url: { type: String, required: true },
  media_type: { type: String, enum: ['image', 'video'], default: 'image' },
  is_primary: { type: Boolean, default: false },
  is_hover: { type: Boolean, default: false },
});

ProductImageSchema.index({ product_id: 1 });
ProductImageSchema.index({ variant_id: 1 });

export default mongoose.models.ProductImage || mongoose.model('ProductImage', ProductImageSchema);
