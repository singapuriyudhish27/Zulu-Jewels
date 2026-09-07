import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating: { type: Number, min: 1, max: 5 },
  review_message: { type: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

ReviewSchema.index({ rating: -1, created_at: -1 });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
