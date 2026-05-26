import mongoose from 'mongoose';

const ShippingZoneSchema = new mongoose.Schema({
  zone_name: { type: String },
  areas: { type: String },
  location: { type: String },
  shipping_rate: { type: Number },
  delivery_time: { type: String },
  partner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ShippingPartner', default: null },
  status: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export default mongoose.models.ShippingZone || mongoose.model('ShippingZone', ShippingZoneSchema);
