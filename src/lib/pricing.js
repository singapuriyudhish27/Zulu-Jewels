import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import ProductVariant from "@/lib/models/ProductVariant";
import CartItem from "@/lib/models/CartItem";

export const GST_RATE_PERCENT = 3; // 3% GST on luxury jewellery in India
export const STANDARD_SHIPPING_FEE_PAISE = 0; // Complimentary free worldwide shipping

/**
 * Calculates server-authoritative order pricing using 100% integer minor units (paise).
 * Eliminates floating point drift across taxes, discounts, and line-item sums.
 *
 * @param {object} options
 * @param {string} options.userId - ID of the authenticated user
 * @param {object|null} [options.specificItem] - Single item payload for "Buy Now" flow
 * @param {string|null} [options.promoCode] - Optional discount code (e.g. 'ZULU5')
 * @returns {Promise<{
 *   subtotal_paise: number,
 *   discount_paise: number,
 *   tax_paise: number,
 *   shipping_paise: number,
 *   total_paise: number,
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

  let subtotal_paise = 0;
  const items = [];
  let verifiedSpecificItem = null;

  if (specificItem) {
    let unitPrice = 0;
    if (specificItem.variantId) {
      const variant = await ProductVariant.findById(specificItem.variantId).lean();
      unitPrice = variant ? variant.price : 0;
    }
    if (!unitPrice && specificItem.productId) {
      const product = await Product.findById(specificItem.productId).lean();
      unitPrice = product ? product.price : 0;
    }

    const unit_price_paise = Math.round(Number(unitPrice || 0) * 100);

    if (unit_price_paise <= 0) {
      throw new Error("Invalid product or price could not be determined");
    }

    const quantity = Math.max(parseInt(specificItem.quantity || 1, 10), 1);
    const item_total_paise = unit_price_paise * quantity;
    subtotal_paise = item_total_paise;

    verifiedSpecificItem = {
      ...specificItem,
      quantity,
      price: unit_price_paise / 100,
      price_paise: unit_price_paise,
    };

    items.push({
      product_id: specificItem.productId,
      variant_id: specificItem.variantId || null,
      quantity,
      unit_price_paise,
      item_total_paise,
      unitPrice: unit_price_paise / 100,
      itemTotal: item_total_paise / 100,
    });
  } else {
    const cartItems = await CartItem.find({ user_id: userId }).lean();
    if (!cartItems || cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    // Batch fetch variants and products to avoid N+1 query loop
    const variantIds = [...new Set(cartItems.map(c => c.variant_id?.toString()).filter(Boolean))];
    const productIds = [...new Set(cartItems.map(c => c.product_id?.toString()).filter(Boolean))];

    const [variants, products] = await Promise.all([
      variantIds.length > 0 ? ProductVariant.find({ _id: { $in: variantIds } }).lean() : [],
      productIds.length > 0 ? Product.find({ _id: { $in: productIds } }).lean() : []
    ]);

    const variantMap = new Map(variants.map(v => [v._id.toString(), v]));
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    for (const ci of cartItems) {
      const variant = ci.variant_id ? variantMap.get(ci.variant_id.toString()) : null;
      const product = ci.product_id ? productMap.get(ci.product_id.toString()) : null;

      const unitPrice = variant ? variant.price : (product ? product.price : 0);
      const unit_price_paise = Math.round(Number(unitPrice || 0) * 100);

      if (unit_price_paise > 0) {
        const quantity = Math.max(parseInt(ci.quantity || 1, 10), 1);
        const item_total_paise = unit_price_paise * quantity;
        subtotal_paise += item_total_paise;

        items.push({
          cartItemId: ci._id,
          product_id: ci.product_id,
          variant_id: ci.variant_id || null,
          quantity,
          unit_price_paise,
          item_total_paise,
          unitPrice: unit_price_paise / 100,
          itemTotal: item_total_paise / 100,
        });
      }
    }

    if (subtotal_paise <= 0) {
      throw new Error("Unable to calculate valid cart total");
    }
  }

  // Integer Minor Unit Discount Calculation: 5% off for ZULU5
  let discount_paise = 0;
  if (promoCode && typeof promoCode === "string" && promoCode.trim().toUpperCase() === "ZULU5") {
    discount_paise = Math.floor((subtotal_paise * 5) / 100);
  }

  // Integer Minor Unit Tax Calculation: 3% GST
  const taxable_paise = Math.max(0, subtotal_paise - discount_paise);
  const tax_paise = Math.floor((taxable_paise * GST_RATE_PERCENT) / 100);
  const shipping_paise = STANDARD_SHIPPING_FEE_PAISE;
  const total_paise = taxable_paise + tax_paise + shipping_paise;

  return {
    // Integer minor units (authoritative for payment verification & records)
    subtotal_paise,
    discount_paise,
    tax_paise,
    shipping_paise,
    total_paise,

    // Display units in Rupees (backward compatibility)
    subtotal: subtotal_paise / 100,
    discount: discount_paise / 100,
    gst: tax_paise / 100,
    shipping: shipping_paise / 100,
    total: total_paise / 100,

    items,
    verifiedSpecificItem,
  };
}
