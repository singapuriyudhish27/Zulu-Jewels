import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  material: { type: String },
  gender: { type: String },
  is_active: { type: Boolean, default: true },
  is_deleted: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
