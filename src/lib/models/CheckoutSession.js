import mongoose from 'mongoose';

const CheckoutSessionSchema = new mongoose.Schema({
  checkout_id: { type: String, required: true, unique: true, index: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [{
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', default: null },
    quantity: { type: Number, required: true, min: 1 },
    unit_price_paise: { type: Number, required: true },
    item_total_paise: { type: Number, required: true }
  }],
  pricing: {
    subtotal_paise: { type: Number, required: true },
    discount_paise: { type: Number, required: true, default: 0 },
    tax_paise: { type: Number, required: true, default: 0 },
    shipping_paise: { type: Number, required: true, default: 0 },
    total_paise: { type: Number, required: true },
    promo_code: { type: String, default: null },
    currency: { type: String, required: true, default: 'INR' }
  },
  shipping_address: { type: String, default: '' },
  provider: { type: String, enum: ['stripe', 'razorpay'], default: null },
  provider_order_id: { type: String, default: null }, // Stripe PaymentIntent ID (pi_xxx) or Razorpay Order ID (order_xxx)
  status: { 
    type: String, 
    enum: ['OPEN', 'LOCKED', 'COMPLETED', 'EXPIRED'], 
    default: 'OPEN' 
  },
  expires_at: { type: Date, required: true, index: true } // Business validity expiration (retained permanently for audit & reconciliation)
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.models.CheckoutSession || mongoose.model('CheckoutSession', CheckoutSessionSchema);
