import mongoose from 'mongoose';

const InquirySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  name: { type: String, default: null },
  email: { type: String, default: null },
  phone: { type: String, default: null },
  inquiry_category: { type: String },
  message: { type: String },
  status: { type: String, default: 'Unread' },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

InquirySchema.index({ created_at: -1 });
InquirySchema.index({ status: 1 });

export default mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);
