import mongoose from 'mongoose';

const SiteSettingSchema = new mongoose.Schema({
  maintenance_enabled: { type: Boolean, default: false },
  maintenance_message: { type: String, default: null },
  maintenance_starts_at: { type: Date, default: null },
  maintenance_ends_at: { type: Date, default: null },
}, { timestamps: { createdAt: false, updatedAt: 'updated_at' } });

export default mongoose.models.SiteSetting || mongoose.model('SiteSetting', SiteSettingSchema);
