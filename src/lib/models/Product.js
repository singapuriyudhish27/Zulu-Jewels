import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  material: { type: String },
  gender: { type: String },
  craftsmanship_video: { type: String, default: '' },
  is_active: { type: Boolean, default: true },
  is_deleted: { type: Boolean, default: false },
  specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

ProductSchema.index({ is_deleted: 1, category_id: 1 });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
