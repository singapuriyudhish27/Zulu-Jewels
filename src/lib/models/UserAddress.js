import mongoose from 'mongoose';

const UserAddressSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  address_line: { type: String, required: true },
  is_default: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

UserAddressSchema.index({ user_id: 1 });

export default mongoose.models.UserAddress || mongoose.model('UserAddress', UserAddressSchema);
