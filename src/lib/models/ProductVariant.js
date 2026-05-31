import mongoose from 'mongoose';

const ProductVariantSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  material: { type: String, required: true },
  description: { type: String },
  price: { type: Number },
  stock: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
});

ProductVariantSchema.index({ product_id: 1 });

export default mongoose.models.ProductVariant || mongoose.model('ProductVariant', ProductVariantSchema);
