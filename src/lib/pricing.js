import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import ProductVariant from "@/lib/models/ProductVariant";
import CartItem from "@/lib/models/CartItem";

export const GST_RATE = 0.03; // 3% GST on luxury jewellery in India
export const STANDARD_SHIPPING_FEE = 0; // Complimentary free worldwide shipping

/**
 * Calculates server-authoritative order pricing for single-item ("Buy Now") or full-cart orders.
 * Ensures consistent pricing, tax, promo discount, and shipping across Razorpay and Stripe.
 *
 * @param {object} options
 * @param {string} options.userId - ID of the authenticated user
 * @param {object|null} [options.specificItem] - Single item payload for "Buy Now" flow
 * @param {string|null} [options.promoCode] - Optional discount code (e.g. 'ZULU5')
 * @returns {Promise<{
 *   subtotal: number,
 *   discount: number,
 *   gst: number,
 *   shipping: number,
 *   total: number,
 *   items: Array<object>,
 *   verifiedSpecificItem: object|null
 * }>}
 */
export async function calculateOrderPricing({ userId, specificItem = null, promoCode = null }) {
  await connectDB();

  let subtotal = 0;
  let items = [];
  let verifiedSpecificItem = null;

  if (specificItem) {
    let unitPrice = 0;
    if (specificItem.variantId) {
      const variant = await ProductVariant.findById(specificItem.variantId);
      unitPrice = variant ? variant.price : 0;
    }
    if (!unitPrice && specificItem.productId) {
      const product = await Product.findById(specificItem.productId);
      unitPrice = product ? product.price : 0;
    }

    if (!unitPrice || unitPrice <= 0) {
      throw new Error("Invalid product or price could not be determined");
    }

    const quantity = specificItem.quantity && specificItem.quantity > 0 ? specificItem.quantity : 1;
    subtotal = unitPrice * quantity;

    verifiedSpecificItem = {
      ...specificItem,
      quantity,
      price: unitPrice,
    };

    items.push({
      productId: specificItem.productId,
      variantId: specificItem.variantId || null,
      quantity,
      unitPrice,
      itemTotal: subtotal,
    });
  } else {
    const cartItems = await CartItem.find({ user_id: userId });
    if (!cartItems || cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    for (const ci of cartItems) {
      let unitPrice = 0;
      if (ci.variant_id) {
        const variant = await ProductVariant.findById(ci.variant_id);
        unitPrice = variant ? variant.price : 0;
      }
      if (!unitPrice && ci.product_id) {
        const product = await Product.findById(ci.product_id);
        unitPrice = product ? product.price : 0;
      }

      if (unitPrice > 0) {
        const itemTotal = unitPrice * ci.quantity;
        subtotal += itemTotal;
        items.push({
          cartItemId: ci._id,
          productId: ci.product_id,
          variantId: ci.variant_id || null,
          quantity: ci.quantity,
          unitPrice,
          itemTotal,
        });
      }
    }

    if (subtotal <= 0) {
      throw new Error("Unable to calculate valid cart total");
    }
  }

  // Promo discount calculation (e.g. ZULU5 gives 5% off subtotal)
  let discount = 0;
  if (promoCode && typeof promoCode === "string" && promoCode.trim().toUpperCase() === "ZULU5") {
    discount = Math.round(subtotal * 0.05);
  }

  const taxableSubtotal = Math.max(0, subtotal - discount);
  const gst = Math.round(taxableSubtotal * GST_RATE);
  const shipping = STANDARD_SHIPPING_FEE;
  const total = taxableSubtotal + gst + shipping;

  return {
    subtotal,
    discount,
    gst,
    shipping,
    total,
    items,
    verifiedSpecificItem,
  };
}
