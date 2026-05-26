import mongoose from 'mongoose';

const AdminSecuritySchema = new mongoose.Schema({
  route_slug: { type: String, required: true },
  rotated_at: { type: Date, default: Date.now },
}, { timestamps: { createdAt: false, updatedAt: 'updated_at' } });

export default mongoose.models.AdminSecurity || mongoose.model('AdminSecurity', AdminSecuritySchema);
