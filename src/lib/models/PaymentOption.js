import mongoose from 'mongoose';

const PaymentOptionSchema = new mongoose.Schema({
  category: { type: String },
  bank_details: { type: mongoose.Schema.Types.Mixed },
  option_details: { type: mongoose.Schema.Types.Mixed },
  status: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export default mongoose.models.PaymentOption || mongoose.model('PaymentOption', PaymentOptionSchema);
