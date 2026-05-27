import mongoose from 'mongoose';

const ShippingPartnerSchema = new mongoose.Schema({
  partner_name: { type: String },
  type: { type: String },
  tracking_url: { type: String },
  delivery_days: { type: Number, default: 7 },
  status: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export default mongoose.models.ShippingPartner || mongoose.model('ShippingPartner', ShippingPartnerSchema);
