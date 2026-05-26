import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customer_name: { type: String, required: true },
  location: { type: String, required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
