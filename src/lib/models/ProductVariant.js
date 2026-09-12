import mongoose from 'mongoose';

const ProductVariantSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  material: { type: String, required: true },
  metal_type: { type: String },
  metal_purity: { type: String },
  metal_color: { type: String },
  metal_weight: { type: Number },
  gemstone_type: { type: String, default: "None" },
  gemstone_tcw: { type: Number },
  gemstone_color: { type: String },
  gemstone_clarity: { type: String },
  gemstone_cut: { type: String },
  gemstone_shape: { type: String },
  gemstone_setting: { type: String },
  gemstone_center_carat: { type: Number },
  gemstone_cert_agency: { type: String },
  gemstone_cert_number: { type: String },
  description: { type: String },
  price: { type: Number },
  stock: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
});

ProductVariantSchema.index({ product_id: 1, is_active: 1 });

export default mongoose.models.ProductVariant || mongoose.model('ProductVariant', ProductVariantSchema);

