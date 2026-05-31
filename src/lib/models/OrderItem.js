import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', default: null },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

OrderItemSchema.index({ order_id: 1 });
OrderItemSchema.index({ product_id: 1 });

export default mongoose.models.OrderItem || mongoose.model('OrderItem', OrderItemSchema);
