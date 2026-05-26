import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  image_url: { type: String },
  description: { type: String },
  available_materials: { type: [String], default: [] },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
