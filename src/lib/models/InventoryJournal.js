import mongoose from 'mongoose';

const InventoryJournalSchema = new mongoose.Schema({
  operation_id: { type: String, required: true, unique: true, index: true }, // "inv_alloc_${payment_key}"
  checkout_id: { type: String, required: true, index: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'APPLYING', 'APPLIED', 'ROLLING_BACK', 'ROLLED_BACK'], 
    default: 'PENDING' 
  },
  lease_token: { type: String, default: null },
  lease_expires_at: { type: Date, default: null },
  attempt_count: { type: Number, default: 0 },
  items: [{
    variant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
    quantity: { type: Number, required: true },
    allocated: { type: Boolean, default: false } // Tracks individual variant atomic decrement
  }]
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

InventoryJournalSchema.index({ status: 1, lease_expires_at: 1 });

export default mongoose.models.InventoryJournal || mongoose.model('InventoryJournal', InventoryJournalSchema);
