import mongoose from 'mongoose';

const ContentPageSchema = new mongoose.Schema({
  page_name: { type: String },
  url: { type: String },
  content: { type: String },
  social_links: { type: mongoose.Schema.Types.Mixed },
  status: { type: Boolean, default: true },
}, { timestamps: { createdAt: false, updatedAt: 'updated_at' } });

export default mongoose.models.ContentPage || mongoose.model('ContentPage', ContentPageSchema);
