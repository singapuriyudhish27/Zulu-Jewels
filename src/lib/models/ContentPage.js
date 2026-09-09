import mongoose from 'mongoose';

const ContentPageSchema = new mongoose.Schema({
  page_name: { type: String, required: true },
  url: { type: String },
  slug: { type: String, index: true },
  content: { type: String },
  pdf_url: { type: String, default: null },
  social_links: { type: mongoose.Schema.Types.Mixed },
  status: { type: Boolean, default: true },
}, { timestamps: { createdAt: true, updatedAt: 'updated_at' } });

export default mongoose.models.ContentPage || mongoose.model('ContentPage', ContentPageSchema);
