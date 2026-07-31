'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Navbar from '@/components/layout/Navbar';
import TrustBadge from '@/components/home/trustBadge';
import Footer from '@/components/layout/Footer';
import { Heart, Share2, ShoppingBag, CreditCard, ChevronLeft, ChevronRight, Star, ThumbsUp, ThumbsDown, Plus, ShoppingCart } from 'lucide-react';
import PriceDisplay from '@/components/price/PriceDisplay';
import { useCurrency } from '@/context/CurrencyContext';

const LocationMap = dynamic(() => import('@/components/map/LocationMap'), { ssr: false });

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function StripeCheckoutForm({ onSuccess, onClose }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + '/payment-success' },
      redirect: 'if_required',
    });
    if (error) {
      toast.error(error.message);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', color: '#1a1a1a', marginBottom: '8px' }}>Pay with Card</h3>
      <PaymentElement />
      <button type="submit" className="pd-pay-btn" disabled={loading || !stripe}>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
      <button type="button" className="pd-pay-cancel-btn" onClick={onClose}>Cancel</button>
    </form>
  );
}

// Removed hardcoded PRODUCT constant for dynamic fetching
const MOCKUP_OPTIONS = {
  carats: ["0.25 ct", "0.50 ct", "0.75 ct", "1.00 ct", "1.25 ct", "1.50 ct"],
  diamonds: ["Natural", "Lab Grown"]
};

const REVIEWS = [
  { id: 1, name: "Priya Sharma", rating: 5, date: "2 days ago", text: "This ring is absolutely gorgeous! The diamond sparkles beautifully and the quality is exceptional. Received so many compliments already.", helpful: 128, avatar: "PS" },
  { id: 2, name: "Raj Patel", rating: 5, date: "1 week ago", text: "Bought this as an engagement ring — she said YES! The packaging was beautiful and delivery was earlier than expected.", helpful: 94, avatar: "RP" },
  { id: 3, name: "Anjali Verma", rating: 4, date: "2 weeks ago", text: "Stunning ring, Love the craftsmanship. Took one star off only because the ring sizing ran slightly small.", helpful: 67, avatar: "AV" },
  { id: 4, name: "Darrell Steward", rating: 5, date: "3 weeks ago", text: "This is an amazing product. The craftsmanship is perfect and the diamond quality is everything they promised.", helpful: 45, avatar: "DS" },
];

const RATING_BREAKDOWN = [
  { stars: 5, count: 2100, percent: 74 },
  { stars: 4, count: 440, percent: 16 },
  { stars: 3, count: 200, percent: 7 },
  { stars: 2, count: 55, percent: 2 },
  { stars: 1, count: 28, percent: 1 },
];

const RELATED_PRODUCTS = [
  { id: 2, name: "Men's Ring", price: "₹1,332 – ₹1,866", swatches: ["#D4AF37","#F5C85A","#E8D5A3","#C0C0C0","#E8E8E8","#B8860B","#8B7355"] },
  { id: 3, name: "Pavé Band", price: "₹1,800 – ₹2,400", swatches: ["#D4AF37","#F5C85A","#E8D5A3","#C0C0C0","#E8E8E8","#B8860B","#8B7355"] },
  { id: 4, name: "Diamond Halo Ring", price: "₹3,100 – ₹4,500", swatches: ["#D4AF37","#F5C85A","#E8D5A3","#C0C0C0","#E8E8E8","#B8860B","#8B7355"] },
  { id: 5, name: "Eternity Band", price: "₹2,800 – ₹3,600", swatches: ["#D4AF37","#F5C85A","#E8D5A3","#C0C0C0","#E8E8E8","#B8860B","#8B7355"] },
];

export default function ProductDetailsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { formatPrice } = useCurrency();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [activeFaq, setActiveFaq] = useState(null);
  const [selectedCarat, setSelectedCarat] = useState(1);
  const [selectedDiamond, setSelectedDiamond] = useState(1); // Lab Grown
  const [activeThumb, setActiveThumb] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [inCartVariantIds, setInCartVariantIds] = useState([]);
  const [reviewFilter, setReviewFilter] = useState('all');
  const [helpfulVotes, setHelpfulVotes] = useState({});
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [addressError, setAddressError] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]); // User's saved addresses from profile
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [houseNumber, setHouseNumber] = useState('');
  const [landmark, setLandmark] = useState('');
  const [autoAddress, setAutoAddress] = useState('');
  const [addressTag, setAddressTag] = useState('Home');
  const [addressLoading, setAddressLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('stripe');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const id = params.Product_Details;
        const res = await fetch(`/api/Pages/Products/${id}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (data.success) {
          setProduct(data.product);
          if (data.product.is_wishlisted) setIsWishlisted(true);
          if (data.product.cart_variants) setInCartVariantIds(data.product.cart_variants.map(id => id === 'base' ? null : id));
          
          // Parse variantId from query parameters to support auto-selection
          let urlVariantId = null;
          if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            urlVariantId = urlParams.get('variantId');
          }

          if (data.product.variants && data.product.variants.length > 0) {
            const matchedVariant = urlVariantId
              ? data.product.variants.find(v => (v._id?.toString() || v.id?.toString()) === urlVariantId)
              : null;
            setSelectedVariant(matchedVariant || data.product.variants[0]);
          }
        } else {
          toast.error(data.message || "Product not found");
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (params.Product_Details) fetchProduct();
  }, [params.Product_Details]);


  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  if (!product) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Product not found</div>;

  // Derived Values
  const currentPrice = selectedVariant ? 1 * selectedVariant.price : 1 * product.price;
  const currentDesc = (selectedVariant && selectedVariant.description) ? selectedVariant.description : product.description;
  const currentImages = selectedVariant 
    ? product.images.filter(img => img.variant_id?.toString() === (selectedVariant._id?.toString() || selectedVariant.id?.toString()))
    : product.images.filter(img => !img.variant_id);
    
  // If a variant has no images, show base images
  const displayImages = currentImages.length > 0 ? currentImages : product.images.filter(img => !img.variant_id);
  // If still no images, use a placeholder
  const finalImages = displayImages.length > 0 ? displayImages : [{ media_url: '/placeholder.jpg' }];

  const thumbs = finalImages.map(img => ({
    url: img.media_url,
    type: img.media_type || (img.media_url.match(/\.(mp4|webm|ogg|mov)$/i) ? 'video' : 'image')
  }));

  const addToCart = async () => {
    try {
      const id = product.id;
      const res = await fetch(`/api/Pages/Products/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: id, variant_id: selectedVariant?._id || selectedVariant?.id || null, action: 'cart', quantity: 1 })
      });
      
      if (res.status === 401) {
        router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        const currentId = selectedVariant?._id || selectedVariant?.id || null;
        if (data.status === "added") {
          setInCartVariantIds(prev => [...prev, currentId]);
        } else {
          setInCartVariantIds(prev => prev.filter(id => id !== currentId));
        }
        toast.success(data.message || (data.status === "added" ? 'Product added to cart!' : 'Product removed from cart'));
      } else {
        toast.error(data.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error(error.message || "An error occurred");
    }
  };

  const addToWishlist = async () => {
    try {
      const id = product.id;
      const res = await fetch(`/api/Pages/Products/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: id, variant_id: selectedVariant?._id || selectedVariant?.id || null, action: 'wishlist' })
      });

      if (res.status === 401) {
        router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setIsWishlisted(data.status === "added");
        toast.success(data.message || (data.status === "added" ? 'Added to wishlist!' : 'Removed from wishlist'));
      } else {
        toast.error(data.message || 'Failed to add to wishlist');
      }
    } catch (error) {
      console.error("Add to wishlist error:", error);
      toast.error(error.message || "An error occurred");
    }
  };

  const loadRazorpay = () =>
    new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleRazorpayPayment = async (amountInRupees, specificItem) => {
    setPaymentLoading(true);
    try {
      const res = await fetch('/api/Pages/Payments/RazorPay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currency: "INR",
          specificItem,
          totalPayable: amountInRupees
       }),
      });
      const order = await res.json();
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast.error('Razorpay SDK failed to load');
        return;
      }
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Zulu Jewellers',
        description: `Order: ${product.name}`,
        order_id: order.id,
        handler: async function (response) {
          await fetch('/api/Pages/Payments/RazorPay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ ...response, specificItem }),
          });
          toast.success('Payment Successful! Thank you for your order.');
        },
        prefill: { name: 'Customer Name', email: 'customer@example.com', contact: '9999999999' },
        theme: { color: '#CEA268' },
      };
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      toast.error('Razorpay payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleStripePayment = async (amountInRupees, specificItem) => {
    setPaymentLoading(true);
    try {
      const res = await fetch('/api/Pages/Payments/Stripe/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountInRupees, specificItem }),
      });
      const { clientSecret } = await res.json();
      if (!clientSecret) {
        toast.error('Failed to create payment. Please try again.');
        return;
      }
      setStripeClientSecret(clientSecret);
      setShowStripeModal(true);
    } catch (err) {
      toast.error('Stripe payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCheckout = async () => {
    try {
      // 1. Check authentication & fetch saved addresses
      const authRes = await fetch('/api/Pages/Profile');
      if (authRes.status === 401) {
        router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
        return;
      }
      const profileData = await authRes.json();
      setSavedAddresses(profileData.addresses || []);

      // 2. Pre-fill with default address if one exists
      const defaultAddr = (profileData.addresses || []).find(a => a.is_default);
      setShippingAddress(defaultAddr ? defaultAddr.address_line : '');

      // 3. Add to cart if not already present
      const currentVariantId = selectedVariant?._id || selectedVariant?.id || null;
      const isThisVariantInCart = inCartVariantIds.includes(currentVariantId);
      if (!isThisVariantInCart) {
        await addToCart();
      }

      // 4. Pre-detect location to set default payment method
      try {
        const geoRes = await fetch('https://ipapi.co/json/');
        const geoData = await geoRes.json();
        if (geoData.country_code === 'IN') {
          setSelectedPaymentMethod('razorpay');
        } else {
          setSelectedPaymentMethod('stripe');
        }
      } catch (_) {
        setSelectedPaymentMethod('stripe'); // fallback
      }

      // 5. Open Order Review Modal and set to step 1
      setCheckoutStep(1);
      setAddressError(false);
      setShowOrderModal(true);
    } catch (error) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  };

  const handleLocationSelect = (location) => {
    setAutoAddress(location.address);
  };

  const handleAddAddress = async () => {
    if (!autoAddress.trim()) {
      toast.error('Please select your location on the map');
      return;
    }
    if (!houseNumber.trim()) {
      toast.error('Please enter flat, house no., or building name');
      return;
    }
    
    const finalAddress = `${addressTag.toUpperCase()}: ${houseNumber.trim()}, ${autoAddress.trim()}${landmark.trim() ? ` (Landmark: ${landmark.trim()})` : ''}`;

    setAddressLoading(true);
    try {
      const isFirst = savedAddresses.length === 0;
      const res = await fetch('/api/Pages/Profile/Addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ address_line: finalAddress, is_default: isFirst }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      
      const newAddress = {
        _id: result.id,
        address_line: finalAddress,
        is_default: isFirst,
      };
      
      setSavedAddresses(prev => [...prev, newAddress]);
      setHouseNumber('');
      setLandmark('');
      setAutoAddress('');
      setAddressTag('Home');
      setMapCenter(null);
      setShowAddressModal(false);
      
      // Auto-select the newly added address
      setShippingAddress(finalAddress);
      setAddressError(false);
      
      toast.success('Address saved!');
    } catch (err) {
      toast.error(err.message || 'Failed to save address');
    } finally {
      setAddressLoading(false);
    }
  };

  const confirmAndPay = async () => {
    if (!shippingAddress.trim()) {
      setAddressError(true);
      return;
    }
    setAddressError(false);
    setShowOrderModal(false);

    const price = selectedVariant ? selectedVariant.price : product.price;
    const specificItem = {
      productId: product.id,
      variantId: selectedVariant?._id || selectedVariant?.id || null,
      quantity: 1,
      price: price,
      shippingAddress: shippingAddress.trim()
    };

    if (selectedPaymentMethod === 'razorpay') {
      toast('Opening Razorpay', { icon: '💳' });
      await handleRazorpayPayment(price, specificItem);
    } else {
      toast('Opening Stripe for international payment 🌐', { icon: '💳' });
      await handleStripePayment(price, specificItem);
    }
  };

  const getProductFAQs = (prod) => {
    const category = prod.category_name || "Jewelry";
    const name = prod.name || "piece";
    
    return [
      {
        q: `Is this ${name} customizable in other precious metals?`,
        a: `Yes, this ${category.toLowerCase()} can be custom-ordered in 18K Yellow Gold, 18K White Gold, 18K Rose Gold, and Platinum. Please select your preferred metal variant from the options above or contact our concierge team for custom specifications.`
      },
      {
        q: `How do I select the perfect size for this ${name}?`,
        a: `For all our ${category.toLowerCase()} designs, we offer standard sizing. If you're unsure of your size, please visit our sizing guide or contact customer support. We offer one complimentary resizing within 30 days of purchase.`
      },
      {
        q: `What is the quality of the diamonds in this ${name}?`,
        a: `We use premium-grade diamonds of VS-VVS clarity and F-G color. All solitaire diamonds above 0.3 carats come with a grading report from GIA or IGI, verifying their cut, clarity, color, and carat weight.`
      },
      {
        q: `Can I add a personalized engraving to this ${name}?`,
        a: `Most of our ${category.toLowerCase()} collections support custom engraving. Please get in touch with our customer service team immediately after placing your order to specify the message or inscription you'd like.`
      }
    ];
  };

  return (
    <>
      <style>{`
        /* Payment Modal Styles */
        .pd-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .pd-modal {
          background: #ffffff;
          padding: 40px;
          max-width: 480px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 4px;
        }

        /* Order Review Modal */
        .pd-order-modal {
          background: #ffffff;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 8px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.06);
          animation: pd-modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes pd-modal-in {
          from { opacity: 0; transform: translateY(10px) scale(0.99); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .pd-om-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 32px 16px;
          border-bottom: 1px solid #F5F5F5;
        }
        .pd-om-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px;
          font-weight: 400;
          color: #111111;
          letter-spacing: -0.01em;
        }
        .pd-om-close {
          border: none;
          background: transparent;
          cursor: pointer;
          color: #888888;
          font-size: 16px;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }
        .pd-om-close:hover { color: #000000; }
        .pd-om-body { padding: 24px 32px; }

        /* Product Card inside modal */
        .pd-om-product {
          display: flex;
          gap: 16px;
          align-items: center;
          padding-bottom: 20px;
          border-bottom: 1px solid #F5F5F5;
          margin-bottom: 20px;
        }
        .pd-om-img {
          width: 80px;
          height: 80px;
          flex-shrink: 0;
          background: #FAF9F8;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .pd-om-img img { width: 100%; height: 100%; object-fit: cover; }
        .pd-om-product-info { flex: 1; }
        .pd-om-product-name {
          font-size: 14px;
          font-weight: 500;
          color: #111111;
          margin-bottom: 4px;
          line-height: 1.4;
        }
        .pd-om-product-variant {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #888888;
          margin-bottom: 4px;
        }
        .pd-om-product-price {
          font-family: 'Montserrat', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #111111;
        }

        /* Price Breakdown */
        .pd-om-breakdown {
          margin-bottom: 24px;
          background: #FAF9F8;
          padding: 16px 20px;
          border-radius: 6px;
        }
        .pd-om-breakdown-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #666666;
          margin-bottom: 8px;
        }
        .pd-om-breakdown-row.total {
          font-size: 14px;
          font-weight: 600;
          color: #111111;
          border-top: 1px solid #EAEAEA;
          padding-top: 12px;
          margin-top: 8px;
          margin-bottom: 0;
        }
        .pd-om-breakdown-row.total span:last-child {
          font-family: 'Montserrat', sans-serif;
          font-size: 16px;
          font-weight: 700;
        }

        /* Address Section */
        .pd-om-section-label {
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 700;
          color: #888888;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .pd-om-address-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #EAEAEA;
          background: #ffffff;
          font-size: 12px;
          font-family: 'Montserrat', sans-serif;
          color: #111111;
          outline: none;
          resize: none;
          height: 80px;
          border-radius: 4px;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .pd-om-address-input:focus { border-color: #111111; }
        .pd-om-address-input.error { border-color: #dc2626; }
        .pd-om-error { color: #dc2626; font-size: 11px; margin-top: 6px; }

        /* Footer buttons */
        .pd-om-footer {
          padding: 16px 32px 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-top: 1px solid #F5F5F5;
        }
        .pd-om-confirm-btn {
          width: 100%;
          padding: 15px;
          background: #111111;
          color: #ffffff;
          border: none;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease;
          font-family: 'Montserrat', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 4px;
        }
        .pd-om-confirm-btn:hover { background: #333333; }
        .pd-om-confirm-btn:disabled { background: #EFEFEF; color: #aaaaaa; cursor: not-allowed; }
        .pd-om-cancel-btn {
          width: 100%;
          padding: 12px;
          background: transparent;
          color: #666666;
          border: none;
          font-size: 11px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s ease;
          font-family: 'Montserrat', sans-serif;
          border-radius: 4px;
        }
        .pd-om-cancel-btn:hover { color: #111111; }\n\n        /* Map Preview */\n        .pd-om-map-wrap {\n          margin-top: 14px;\n          border-radius: 4px;\n          overflow: hidden;\n        }\n        .pd-om-map-loading {\n          display: flex;\n          align-items: center;\n          gap: 10px;\n          font-size: 12px;\n          color: #888;\n          padding: 14px;\n          background: #F9F9F9;\n          border: 1px solid #EFEFEF;\n          border-radius: 4px;\n        }\n        @keyframes pd-spin { to { transform: rotate(360deg); } }\n        .pd-om-map-spinner {\n          display: inline-block;\n          width: 14px;\n          height: 14px;\n          border: 2px solid #EFEFEF;\n          border-top-color: #000;\n          border-radius: 50%;\n          animation: pd-spin 0.7s linear infinite;\n          flex-shrink: 0;\n        }\n        .pd-om-map-found {\n          font-size: 11px;\n          color: #555;\n          padding: 8px 2px 10px;\n          line-height: 1.5;\n          white-space: nowrap;\n          overflow: hidden;\n          text-overflow: ellipsis;\n        }\n        .pd-om-map-iframe {\n          width: 100%;\n          height: 220px;\n          border: 1px solid #EFEFEF;\n          border-radius: 4px;\n          display: block;\n        }\n        .pd-om-map-link {\n          display: inline-block;\n          margin-top: 8px;\n          font-size: 11px;\n          color: #555;\n          text-decoration: underline;\n          transition: color 0.2s;\n        }\n        .pd-om-map-link:hover { color: #000; }\n        .pd-om-map-notfound {\n          font-size: 11px;\n          color: #d97706;\n          padding: 10px 12px;\n          background: #FFFBEB;\n          border: 1px solid #FDE68A;\n          border-radius: 4px;\n          margin-top: 8px;\n        }
        .pd-pay-btn {
          width: 100%;
          padding: 15px;
          background: #000000;
          color: #ffffff;
          border: none;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Montserrat', sans-serif;
        }
        .pd-pay-btn:hover { background: #EAB308; color: #000000; }
        .pd-pay-btn:disabled { background: #EFEFEF; cursor: not-allowed; color: #aaaaaa; }
        .pd-pay-cancel-btn {
          width: 100%;
          padding: 13px;
          background: transparent;
          color: #000000;
          border: 1px solid #000000;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Montserrat', sans-serif;
        }
        .pd-pay-cancel-btn:hover { background: #000000; color: #ffffff; }
        .pd-page { font-family: 'Montserrat', sans-serif; background: #ffffff; padding-top: 80px; }

        /* General Variables */
        :root {
          --zj-black: #000000;
          --zj-white: #ffffff;
          --zj-gold: #EAB308;
          --zj-bg: #F9F9F9;
          --zj-green: #15803D;
        }

        /* Breadcrumb */
        .pd-breadcrumb-wrapper {
          background: #F9F9F9;
          width: 100%;
          border-bottom: 1px solid #EFEFEF;
        }
        .pd-breadcrumb {
          max-width: 1280px; margin: 0 auto; padding: 16px 24px;
          font-size: 11px; color: #666666; display: flex; gap: 12px; align-items: center;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .pd-breadcrumb a { color: #666666; text-decoration: none; transition: color 0.2s ease; }
        .pd-breadcrumb a:hover { color: #CEA268; }
        .pd-bc-sep { color: #999999; }
        .pd-bc-cur { color: #1a1a1a; font-weight: 600; }

        /* Main Product Area */
        .pd-product-area {
          max-width: 1280px; margin: 0 auto; padding: 0 24px 80px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start;
        }

        /* Gallery */
        .pd-gallery { display: flex; flex-direction: column; gap: 16px; }
        .pd-main-img {
          position: relative;
          width: 100%; aspect-ratio: 1;
          background: #F9F9F9;
          display: flex; align-items: center; justify-content: center;
          font-size: 140px;
          overflow: hidden;
        }
        .pd-share-btn {
          position: absolute; top: 16px; right: 16px;
          background: #ffffff; border: 1px solid #EFEFEF; border-radius: 50%;
          width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #555555; transition: all 0.2s ease;
        }
        .pd-share-btn:hover { border-color: #000000; color: #000000; }
        .pd-gallery-arrows {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: space-between;
          pointer-events: none; padding: 0 16px;
        }
        .pd-gallery-arrow {
          width: 40px; height: 40px; background: rgba(255,255,255,0.9);
          border: 1px solid #EFEFEF; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; pointer-events: all; color: #000000;
          transition: all 0.2s ease;
        }
        .pd-gallery-arrow:hover { border-color: #000000; }
        .pd-thumbnails {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          scrollbar-width: none;
          scroll-snap-type: x mandatory;
        }
        .pd-thumbnails::-webkit-scrollbar {
          display: none;
        }
        .pd-thumb {
          width: 76px; height: 76px; background: #F9F9F9;
          display: flex; align-items: center; justify-content: center;
          font-size: 32px; cursor: pointer; border: 2px solid transparent;
          transition: border-color 0.2s ease;
          flex-shrink: 0;
          scroll-snap-align: start;
        }
        .pd-thumb.active { border-color: #000000; }
        .pd-thumb:hover { border-color: #cccccc; }

        /* Product Info */
        .pd-info { display: flex; flex-direction: column; gap: 0; padding-top: 20px; }
        .pd-product-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(32px, 4vw, 42px);
          color: #000000; font-weight: 500;
          line-height: 1.15; margin-bottom: 16px;
        }
        .pd-price-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 12px; }
        .pd-price { font-size: 32px; font-weight: 600; color: #000000; font-family: 'Cormorant Garamond', serif; }
        .pd-mrp { font-size: 16px; color: #888888; text-decoration: line-through; }
        .pd-discount-badge {
          background: #DCFCE7; color: #15803D;
          font-size: 11px; font-weight: 700; padding: 4px 10px;
          border-radius: 2px; letter-spacing: 0.08em; text-transform: uppercase;
        }
        .pd-meta-row { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; font-size: 13px; color: #666666; }
        .pd-rating-pill { display: flex; align-items: center; gap: 6px; color: #EAB308; font-weight: 600; }
        .pd-divider { border: none; border-top: 1px solid #EFEFEF; margin: 24px 0; }
        .pd-emi-text { font-size: 13px; color: #000000; font-weight: 500; margin-bottom: 20px; }
        .pd-emi-text a { color: inherit; text-decoration: underline; }

        /* Options */
        .pd-option-group { margin-bottom: 24px; }
        .pd-option-label {
          font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;
          color: #888888; font-weight: 600; margin-bottom: 12px;
        }
        .pd-option-label span { color: #000000; font-weight: 700; }
        .pd-option-pills { display: flex; gap: 12px; flex-wrap: wrap; }
        .pd-pill {
          padding: 12px 20px; border: 1px solid #EFEFEF;
          background: #ffffff; font-size: 13px; color: #000000; font-weight: 500;
          cursor: pointer; transition: all 0.2s ease; border-radius: 2px;
          font-family: 'Montserrat', sans-serif;
        }
        .pd-pill:hover { border-color: #000000; }
        .pd-pill.active { border-color: #000000; background: #000000; color: #ffffff; }

        /* Action Buttons */
        .pd-actions { display: flex; flex-direction: column; gap: 12px; margin-top: 24px; }
        .pd-actions-row { display: flex; gap: 12px; }
        .pd-btn-primary {
          flex: 1; padding: 14px 20px; background: #111111; color: #ffffff;
          border: none; font-size: 15px; font-weight: 500; cursor: pointer;
          transition: all 0.3s ease; font-family: 'Montserrat', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          border-radius: 8px;
        }
        .pd-btn-primary:hover { background: #333333; }
        .pd-btn-secondary {
          flex: 1; padding: 14px 20px; background: #ffffff; color: #111111;
          border: 1px solid #dddddd; font-size: 15px; font-weight: 500; cursor: pointer;
          transition: all 0.3s ease; font-family: 'Montserrat', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          border-radius: 8px;
        }
        .pd-btn-secondary:hover { border-color: #111111; }
        .pd-btn-wishlist {
          width: 100%; max-width: 320px; margin: 0 auto;
          padding: 12px 20px; background: #ffffff; color: #111111;
          border: 1px solid #dddddd; font-size: 15px; font-weight: 500; cursor: pointer;
          transition: all 0.3s ease; font-family: 'Montserrat', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          border-radius: 8px;
        }
        .pd-btn-wishlist.active { color: #EAB308; border-color: #EAB308; }
        .pd-btn-wishlist:hover { border-color: #111111; }

        /* Value Props */
        .pd-value-props {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 0; border: 1px solid #EFEFEF; margin-top: 32px; border-radius: 2px;
        }
        .pd-vp-item {
          padding: 20px 12px; text-align: center; border-right: 1px solid #EFEFEF;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
        }
        .pd-vp-item:last-child { border-right: none; }
        .pd-vp-icon { font-size: 24px; }
        .pd-vp-title { font-size: 10px; font-weight: 700; color: #000000; text-transform: uppercase; letter-spacing: 0.1em; }
        .pd-vp-sub { font-size: 10px; color: #666666; }

        /* Tabs Section */
        .pd-tabs-section { max-width: 1280px; margin: 0 auto; padding: 0 24px 80px; }
        .pd-tab-nav { display: flex; border-bottom: 1px solid #EFEFEF; margin-bottom: 48px; }
        .pd-tab-btn {
          padding: 16px 0; margin-right: 48px; background: none; border: none;
          font-size: 14px; font-weight: 600; color: #888888; cursor: pointer;
          transition: color 0.2s ease; border-bottom: 2px solid transparent;
          margin-bottom: -1px; font-family: 'Montserrat', sans-serif;
          letter-spacing: 0.04em;
        }
        .pd-tab-btn.active { color: #000000; border-bottom-color: #EAB308; }
        .pd-tab-btn:hover { color: #000000; }

        /* Description Tab */
        .pd-desc-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px; color: #000000; font-weight: 500;
          margin-bottom: 20px;
        }
        .pd-desc-text { font-size: 15px; color: #555555; line-height: 1.8; margin-bottom: 40px; }
        .pd-benefits-title { font-size: 13px; font-weight: 700; color: #000000; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 20px; }
        .pd-benefits-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; border: 1px solid #EFEFEF; border-radius: 2px; }
        .pd-benefit-row { display: flex; border-bottom: 1px solid #EFEFEF; }
        .pd-benefit-row:nth-last-child(-n+3) { border-bottom: none; }
        .pd-benefit-label { padding: 16px 20px; background: #F9F9F9; font-size: 11px; font-weight: 700; color: #666666; min-width: 160px; text-transform: uppercase; letter-spacing: 0.1em; border-right: 1px solid #EFEFEF; }
        .pd-benefit-val { padding: 16px 20px; font-size: 14px; color: #000000; font-weight: 500; }

        /* Reviews Tab */
        .pd-reviews-layout { display: grid; grid-template-columns: 280px 1fr; gap: 64px; }
        .pd-reviews-sidebar { display: flex; flex-direction: column; gap: 32px; }
        .pd-rating-summary {
          display: flex; flex-direction: column; align-items: center; gap: 20px;
          padding: 32px; border: 1px solid #EFEFEF; background: #F9F9F9; border-radius: 2px;
        }
        .pd-big-rating {
          font-family: 'Cormorant Garamond', serif;
          font-size: 72px; color: #000000; font-weight: 400; line-height: 1;
        }
        .pd-stars-row { color: #EAB308; font-size: 24px; letter-spacing: 4px; }
        .pd-rating-count { font-size: 12px; color: #666666; }
        .pd-breakdown { width: 100%; display: flex; flex-direction: column; gap: 10px; }
        .pd-breakdown-row { display: flex; align-items: center; gap: 12px; }
        .pd-bd-stars { font-size: 12px; color: #555555; white-space: nowrap; font-weight: 600; }
        .pd-bd-bar-wrap { flex: 1; height: 6px; background: #EFEFEF; border-radius: 3px; overflow: hidden; }
        .pd-bd-bar { height: 100%; background: #EAB308; border-radius: 3px; }
        .pd-bd-count { font-size: 12px; color: #888888; min-width: 30px; text-align: right; }

        /* Sidebar Filter */
        .pd-review-sidebar-filter { display: flex; flex-direction: column; gap: 0; }
        .pd-rsf-title { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 700; color: #000000; margin-bottom: 16px; border-bottom: 1px solid #EFEFEF; padding-bottom: 10px; }
        .pd-rsf-list { display: flex; flex-direction: column; gap: 12px; }
        .pd-rsf-label { font-size: 13px; color: #555555; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: color 0.2s; }
        .pd-rsf-label:hover { color: #000000; }
        .pd-rsf-checkbox { width: 16px; height: 16px; accent-color: #000000; cursor: pointer; }

        /* Top Review Filter */
        .pd-review-filter { display: flex; gap: 0; margin-bottom: 32px; border: 1px solid #EFEFEF; width: fit-content; border-radius: 2px; background: #F9F9F9; }
        .pd-rf-btn {
          padding: 12px 24px; background: transparent; border: none; border-right: 1px solid #EFEFEF;
          font-size: 12px; font-weight: 600; color: #666666; cursor: pointer; transition: all 0.2s ease;
          font-family: 'Montserrat', sans-serif; letter-spacing: 0.04em;
        }
        .pd-rf-btn:last-child { border-right: none; }
        .pd-rf-btn.active { background: #000000; color: #ffffff; }
        .pd-rf-btn:hover:not(.active) { color: #000000; }

        /* Review Cards */
        .pd-review-list { display: flex; flex-direction: column; gap: 24px; }
        .pd-review-card { padding: 32px; border: 1px solid #EFEFEF; border-radius: 2px; }
        .pd-review-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .pd-reviewer { display: flex; gap: 16px; align-items: center; }
        .pd-reviewer-avatar {
          width: 44px; height: 44px; border-radius: 50%; background: #F9F9F9; border: 1px solid #EFEFEF;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: #000000; flex-shrink: 0;
        }
        .pd-reviewer-name { font-size: 14px; font-weight: 700; color: #000000; margin-bottom: 4px; }
        .pd-reviewer-date { font-size: 12px; color: #888888; }
        .pd-review-stars { color: #EAB308; font-size: 14px; letter-spacing: 2px; }
        .pd-review-text { font-size: 14px; color: #555555; line-height: 1.8; margin: 16px 0; }
        .pd-review-actions { display: flex; align-items: center; gap: 16px; margin-top: 20px; }
        .pd-helpful-label { font-size: 12px; color: #888888; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; }
        .pd-helpful-btn {
          display: flex; align-items: center; gap: 6px;
          background: #F9F9F9; border: 1px solid #EFEFEF; padding: 8px 16px; border-radius: 30px;
          font-size: 11px; font-weight: 600; color: #555555; cursor: pointer; transition: all 0.2s ease;
          font-family: 'Montserrat', sans-serif;
        }
        .pd-helpful-btn:hover { border-color: #000000; color: #000000; }
        .pd-helpful-btn.voted { border-color: #EAB308; color: #EAB308; background: #ffffff; }

        /* Review Pagination */
        .pd-rev-pagination { display: flex; gap: 6px; margin-top: 48px; }
        .pd-rev-page-btn {
          width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
          border: 1px solid #EFEFEF; background: #ffffff; font-size: 13px; font-weight: 500;
          cursor: pointer; color: #555555; transition: all 0.2s ease; font-family: 'Montserrat', sans-serif; border-radius: 4px;
        }
        .pd-rev-page-btn:hover { border-color: #000000; color: #000000; }
        .pd-rev-page-btn.active { background: #000000; color: #ffffff; border-color: #000000; }

        /* Related Products */
        .pd-related-section { max-width: 1280px; margin: 0 auto; padding: 0 24px 100px; }
        .pd-related-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px; color: #000000; font-weight: 500;
          margin-bottom: 32px; padding-bottom: 16px; border-bottom: 1px solid #EFEFEF;
        }
        .pd-related-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; }
        .pd-rel-card { cursor: pointer; }
        .pd-rel-img {
          width: 100%; aspect-ratio: 1; background: #F9F9F9;
          display: flex; align-items: center; justify-content: center;
          font-size: 64px; margin-bottom: 16px; transition: transform 0.3s ease;
        }
        .pd-rel-card:hover .pd-rel-img { transform: scale(1.05); }
        .pd-rel-name { font-size: 14px; font-weight: 600; color: #000000; margin-bottom: 6px; }
        .pd-rel-price { font-size: 13px; color: #666666; margin-bottom: 12px; }
        .pd-rel-swatches { display: flex; gap: 6px; }
        .pd-rel-swatch { width: 14px; height: 14px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.1); }

        @media (max-width: 900px) {
          .pd-product-area { grid-template-columns: 1fr; gap: 48px; }
          .pd-reviews-layout { grid-template-columns: 1fr; }
          .pd-related-grid { grid-template-columns: repeat(2, 1fr); }
          .pd-benefits-grid { grid-template-columns: repeat(1, 1fr); }
          .pd-value-props { grid-template-columns: repeat(2, 1fr); }
          .pd-vp-item { border-right: 1px solid #EFEFEF; border-bottom: 1px solid #EFEFEF; }
          .pd-vp-item:nth-child(2n) { border-right: none; }
          .pd-vp-item:nth-last-child(-n+2) { border-bottom: none; }
        }
        @media (max-width: 600px) {
          .pd-value-props { grid-template-columns: 1fr; }
          .pd-vp-item { border-right: none; border-bottom: 1px solid #EFEFEF; }
          .pd-vp-item:last-child { border-bottom: none; }
          .pd-actions-row { flex-direction: column; }
          .pd-btn-primary, .pd-btn-secondary { width: 100%; }
        }
        @media (max-width: 480px) {
          .pd-related-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .pd-product-name { font-size: 24px; }
          .pd-price { font-size: 26px; }
          .pd-btn-wishlist { max-width: 100%; }
          .pd-tab-btn { margin-right: 20px; font-size: 13px; }
        }

        /* FAQ Section styling */
        .pd-faq-section {
          max-width: 900px;
          margin: 0 auto;
          padding: 80px 24px;
          font-family: 'Montserrat', sans-serif;
        }
        .pd-faq-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 36px;
          font-weight: 500;
          text-align: center;
          color: #000;
          margin-bottom: 48px;
          letter-spacing: 0.02em;
        }
        .pd-faq-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .pd-faq-item {
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          padding-bottom: 16px;
          transition: all 0.3s ease;
        }
        .pd-faq-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          padding: 8px 0;
          gap: 20px;
        }
        .pd-faq-question {
          font-size: 15px;
          font-weight: 600;
          color: #1a1a1a;
          letter-spacing: 0.02em;
          margin: 0;
          transition: color 0.2s;
        }
        .pd-faq-item:hover .pd-faq-question {
          color: #EAB308;
        }
        .pd-faq-icon {
          font-size: 24px;
          font-weight: 300;
          color: #555;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease, color 0.3s;
          user-select: none;
        }
        .pd-faq-icon.active {
          color: #EAB308;
          transform: rotate(45deg);
        }
        .pd-faq-answer-container {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease, opacity 0.3s ease;
          opacity: 0;
        }
        .pd-faq-answer-container.open {
          max-height: 200px;
          opacity: 1;
        }
        .pd-faq-answer {
          font-size: 14px;
          color: #555;
          line-height: 1.8;
          font-weight: 300;
          padding: 12px 0 8px;
          margin: 0;
        }
        @media (max-width: 600px) {
          .pd-faq-section {
            padding: 50px 16px;
          }
          .pd-faq-title {
            font-size: 28px;
            margin-bottom: 32px;
          }
          .pd-faq-question {
            font-size: 14px;
          }
          .pd-faq-answer {
            font-size: 13px;
          }
        }
      `}</style>

      <Navbar />
      <div className="pd-page">

      {/* Breadcrumb */}
      <div className="pd-breadcrumb-wrapper">
        <div className="pd-breadcrumb">
          <Link href="/Pages">Home</Link>
          <span className="pd-bc-sep">›</span>
          <Link href="/Pages/Products">Rings</Link>
          <span className="pd-bc-sep">›</span>
          <span className="pd-bc-cur">{product.name}</span>
        </div>
      </div>

      {/* Product Area */}
      <div className="pd-product-area">
        {/* Gallery */}
        <div className="pd-gallery">
          <div className="pd-main-img">
            {thumbs[activeThumb]?.type === 'video' ? (
              <video 
                key={thumbs[activeThumb].url}
                src={thumbs[activeThumb].url} 
                controls 
                autoPlay 
                muted 
                playsInline
                preload="auto"
                loop 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <img src={thumbs[activeThumb]?.url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            )}
            <button className="pd-share-btn" onClick={() => toast.success('Link copied!')}><Share2 size={16} /></button>
            <div className="pd-gallery-arrows">
              <button className="pd-gallery-arrow" onClick={() => setActiveThumb(t => (t - 1 + thumbs.length) % thumbs.length)}><ChevronLeft size={16} /></button>
              <button className="pd-gallery-arrow" onClick={() => setActiveThumb(t => (t + 1) % thumbs.length)}><ChevronRight size={16} /></button>
            </div>
          </div>
          <div className="pd-thumbnails">
            {thumbs.map((t, i) => (
              <div key={i} className={`pd-thumb ${activeThumb === i ? 'active' : ''}`} onClick={() => setActiveThumb(i)} style={{ position: 'relative' }}>
                {t.type === 'video' ? (
                  <div style={{ width: '100%', height: '100%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <video src={t.url} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                      <div style={{ background: 'rgba(255,255,255,0.8)', borderRadius: '50%', padding: '4px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  <img src={t.url} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="pd-info">
          <h1 className="pd-product-name">{product.name}</h1>
          <div className="pd-price-row">
            <PriceDisplay amountInINR={currentPrice} className="pd-price" />
            <PriceDisplay amountInINR={currentPrice * 1.2} className="pd-mrp" style={{ textDecoration: 'line-through', color: '#888', fontSize: '16px' }} />
            <span className="pd-discount-badge">20% OFF</span>
          </div>
          <div className="pd-meta-row">
            <span className="pd-rating-pill"><Star size={13} fill="#EAB308" color="#EAB308" /> 4.5</span>
            <span>2,823 reviews</span>
            <span>·</span>
            <span>1,238 sold</span>
          </div>
          <p className="pd-emi-text">EMI Starting at <PriceDisplay amountInINR={currentPrice / 24} />/month</p>
          <p style={{ fontSize: '14px', color: '#556', marginTop: '16px', lineHeight: '1.6' }}>{product.description}</p>


          <hr className="pd-divider" />

          {/* Metal Type / Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="pd-option-group">
              <p className="pd-option-label">Metal Type: <span>{selectedVariant?.material || "Select"}</span></p>
              <div className="pd-option-pills">
                {product.variants.map((v, i) => {
                  const isVActive = (selectedVariant?._id?.toString() || selectedVariant?.id?.toString()) === (v._id?.toString() || v.id?.toString());
                  return (
                    <button key={i} className={`pd-pill ${isVActive ? 'active' : ''}`} onClick={() => { setSelectedVariant(v); setActiveThumb(0); }}>{v.material}</button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Diamond Carat (Mockup) */}
          <div className="pd-option-group">
            <p className="pd-option-label">Diamond Carat Weight: <span>{MOCKUP_OPTIONS.carats[selectedCarat]}</span></p>
            <div className="pd-option-pills">
              {MOCKUP_OPTIONS.carats.map((c, i) => (
                <button key={i} className={`pd-pill ${selectedCarat === i ? 'active' : ''}`} onClick={() => setSelectedCarat(i)}>{c}</button>
              ))}
            </div>
          </div>

          {/* Diamond Type (Mockup) */}
          <div className="pd-option-group">
            <p className="pd-option-label">Diamond Type: <span>{MOCKUP_OPTIONS.diamonds[selectedDiamond]}</span></p>
            <div className="pd-option-pills">
              {MOCKUP_OPTIONS.diamonds.map((d, i) => (
                <button key={i} className={`pd-pill ${selectedDiamond === i ? 'active' : ''}`} onClick={() => setSelectedDiamond(i)}>{d}</button>
              ))}
            </div>
          </div>

          <hr className="pd-divider" />

          {/* Action Buttons */}
          <div className="pd-actions">
            <div className="pd-actions-row">
              <button 
                className={`pd-btn-primary ${inCartVariantIds.includes(selectedVariant?._id || selectedVariant?.id || null) ? 'active' : ''}`} 
                onClick={addToCart}
              >
                {inCartVariantIds.includes(selectedVariant?._id || selectedVariant?.id || null) ? <ShoppingBag size={18} /> : <Plus size={18} />} 
                {inCartVariantIds.includes(selectedVariant?._id || selectedVariant?.id || null) ? 'In Cart' : 'Add To Cart'}
              </button>
              <button className="pd-btn-secondary" onClick={handleCheckout} disabled={paymentLoading}>
                <ShoppingCart size={18} /> {paymentLoading ? 'Processing...' : 'Checkout Now'}
              </button>
            </div>
            <button className={`pd-btn-wishlist ${isWishlisted ? 'active' : ''}`} onClick={addToWishlist}>
              <Heart size={18} fill={isWishlisted ? '#EAB308' : 'none'} /> {isWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>
      <TrustBadge />

      {/* Tabs */}
      <div className="pd-tabs-section">
        <div className="pd-tab-nav">
          <button className={`pd-tab-btn ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>Description</button>
          <button className={`pd-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
            Reviews (2,823)
          </button>
        </div>

        {/* Description Tab */}
        {activeTab === 'description' && (
          <div>
            <h2 className="pd-desc-title">Product Description</h2>
            <p className="pd-desc-text">{currentDesc || product.description}</p>
            <p className="pd-benefits-title">Benefits &amp; Specifications</p>
            <div className="pd-benefits-grid" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="pd-benefit-row">
                  <span className="pd-benefit-label">Material</span>
                  <span className="pd-benefit-val">{selectedVariant?.material || product.material || "N/A"}</span>
                </div>
                <div className="pd-benefit-row">
                  <span className="pd-benefit-label">Gender</span>
                  <span className="pd-benefit-val">{product.gender}</span>
                </div>
                <div className="pd-benefit-row">
                  <span className="pd-benefit-label">Category</span>
                  <span className="pd-benefit-val">{product.category_name || "Jewelry"}</span>
                </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="pd-reviews-layout">
            <div className="pd-reviews-sidebar">
              {/* Rating Summary */}
              <div className="pd-rating-summary">
                <div className="pd-big-rating">4.5</div>
                <div className="pd-stars-row">{'★'.repeat(5)}</div>
                <div className="pd-rating-count">2,823 reviews</div>
                <div className="pd-breakdown">
                  {RATING_BREAKDOWN.map((r, i) => (
                    <div key={i} className="pd-breakdown-row">
                      <span className="pd-bd-stars">{r.stars}★</span>
                      <div className="pd-bd-bar-wrap">
                        <div className="pd-bd-bar" style={{ width: `${r.percent}%` }} />
                      </div>
                      <span className="pd-bd-count">{r.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Added Sidebar Filters */}
              <div className="pd-review-sidebar-filter">
                <h3 className="pd-rsf-title">Filter by Topic</h3>
                <div className="pd-rsf-list">
                  <label className="pd-rsf-label"><input type="checkbox" className="pd-rsf-checkbox"/> Product Quality</label>
                  <label className="pd-rsf-label"><input type="checkbox" className="pd-rsf-checkbox"/> Seller Services</label>
                  <label className="pd-rsf-label"><input type="checkbox" className="pd-rsf-checkbox"/> Value for Money</label>
                  <label className="pd-rsf-label"><input type="checkbox" className="pd-rsf-checkbox"/> Packaging</label>
                </div>

                <h3 className="pd-rsf-title" style={{ marginTop: '32px' }}>Rating</h3>
                <div className="pd-rsf-list">
                  <label className="pd-rsf-label"><input type="checkbox" className="pd-rsf-checkbox"/> 5 Stars</label>
                  <label className="pd-rsf-label"><input type="checkbox" className="pd-rsf-checkbox"/> 4 Stars</label>
                  <label className="pd-rsf-label"><input type="checkbox" className="pd-rsf-checkbox"/> 3 Stars</label>
                </div>
              </div>
            </div>

            {/* Review List */}
            <div>
              <div className="pd-review-filter">
                {['All Reviews', 'With Photo & Video', 'With Description'].map((f, i) => (
                  <button key={i} className={`pd-rf-btn ${reviewFilter === f ? 'active' : ''}`} onClick={() => setReviewFilter(f)}>{f}</button>
                ))}
              </div>
              <div className="pd-review-list">
                {REVIEWS.map(r => (
                  <div key={r.id} className="pd-review-card">
                    <div className="pd-review-header">
                      <div className="pd-reviewer">
                        <div className="pd-reviewer-avatar">{r.avatar}</div>
                        <div>
                          <p className="pd-reviewer-name">{r.name}</p>
                          <p className="pd-reviewer-date">{r.date}</p>
                        </div>
                      </div>
                      <div className="pd-review-stars">{'★'.repeat(r.rating)}</div>
                    </div>
                    <p className="pd-review-text">{r.text}</p>
                    <div className="pd-review-actions">
                      <span className="pd-helpful-label">Helpful?</span>
                      <button
                        className={`pd-helpful-btn ${helpfulVotes[r.id] === 'up' ? 'voted' : ''}`}
                        onClick={() => setHelpfulVotes(prev => ({ ...prev, [r.id]: 'up' }))}
                      >
                        <ThumbsUp size={12} /> {r.helpful + (helpfulVotes[r.id] === 'up' ? 1 : 0)}
                      </button>
                      <button
                        className={`pd-helpful-btn ${helpfulVotes[r.id] === 'down' ? 'voted' : ''}`}
                        onClick={() => setHelpfulVotes(prev => ({ ...prev, [r.id]: 'down' }))}
                      >
                        <ThumbsDown size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pd-rev-pagination">
                {[1, 2, 3, '...', 19].map((p, i) => (
                  <button key={i} className={`pd-rev-page-btn ${p === 1 ? 'active' : ''}`}>{p}</button>
                ))}
                <button className="pd-rev-page-btn">→</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Related Products */}
      <div className="pd-related-section">
        <h2 className="pd-related-title">You May Also Like</h2>
        <div className="pd-related-grid">
          {RELATED_PRODUCTS.map(p => (
            <Link key={p.id} href={`/Pages/Products/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="pd-rel-card">
                <div className="pd-rel-img">💍</div>
                <p className="pd-rel-name">{p.name}</p>
                <p className="pd-rel-price">{p.price}</p>
                <div className="pd-rel-swatches">
                  {p.swatches.map((s, i) => <span key={i} className="pd-rel-swatch" style={{ background: s }} />)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Product Specific FAQs Section (Accordion style) */}
      <section className="pd-faq-section">
        <h2 className="pd-faq-title">Frequently Asked Questions</h2>
        <div className="pd-faq-list">
          {getProductFAQs(product).map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div key={index} className="pd-faq-item">
                <div className="pd-faq-header" onClick={() => setActiveFaq(isOpen ? null : index)}>
                  <h3 className="pd-faq-question">{faq.q}</h3>
                  <span className={`pd-faq-icon ${isOpen ? 'active' : ''}`}>+</span>
                </div>
                <div className={`pd-faq-answer-container ${isOpen ? 'open' : ''}`}>
                  <p className="pd-faq-answer">{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      </div>

      {/* Order Review Modal */}
      {showOrderModal && product && (() => {
        const price = selectedVariant ? selectedVariant.price : product.price;
        const gst = Math.round(price * 0.03);
        const shipping = price > 50000 ? 0 : 999;
        const total = price + gst + shipping;
        const selectedVarId = selectedVariant?._id?.toString() || selectedVariant?.id?.toString();
        const img = selectedVariant
          ? product.images?.find(img => img.variant_id?.toString() === selectedVarId)?.media_url || product.images?.find(img => !img.variant_id)?.media_url
          : product.images?.find(img => !img.variant_id)?.media_url;
        return (
          <div className="pd-modal-overlay" onClick={e => e.target === e.currentTarget && setShowOrderModal(false)}>
            <div className="pd-order-modal">
              {/* Header */}
              <div className="pd-om-header" style={{ paddingBottom: '12px' }}>
                <h2 className="pd-om-title">Review Order</h2>
                <button className="pd-om-close" onClick={() => setShowOrderModal(false)}>✕</button>
              </div>

              {/* Step indicator header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', borderBottom: '1px solid #F5F5F5', background: '#FAF9F8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: checkoutStep >= 1 ? '#111111' : '#E5E5E5',
                    color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: 600, fontFamily: 'Montserrat, sans-serif'
                  }}>1</div>
                  <span style={{ fontSize: '11px', fontWeight: checkoutStep === 1 ? '600' : '500', color: checkoutStep === 1 ? '#111111' : '#888888', fontFamily: 'Montserrat, sans-serif' }}>Shipping</span>
                </div>
                <div style={{ flex: 1, height: '1px', background: '#E5E5E5', margin: '0 12px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: checkoutStep >= 2 ? '#111111' : '#E5E5E5',
                    color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: 600, fontFamily: 'Montserrat, sans-serif'
                  }}>2</div>
                  <span style={{ fontSize: '11px', fontWeight: checkoutStep === 2 ? '600' : '500', color: checkoutStep === 2 ? '#111111' : '#888888', fontFamily: 'Montserrat, sans-serif' }}>Payment</span>
                </div>
                <div style={{ flex: 1, height: '1px', background: '#E5E5E5', margin: '0 12px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: checkoutStep >= 3 ? '#111111' : '#E5E5E5',
                    color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: 600, fontFamily: 'Montserrat, sans-serif'
                  }}>3</div>
                  <span style={{ fontSize: '11px', fontWeight: checkoutStep === 3 ? '600' : '500', color: checkoutStep === 3 ? '#111111' : '#888888', fontFamily: 'Montserrat, sans-serif' }}>Review</span>
                </div>
              </div>

              {/* Body */}
              <div className="pd-om-body">

                {/* STEP 1: Address Selection */}
                {checkoutStep === 1 && (
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'Cormorant Garamond, serif', marginBottom: '16px', color: '#111111' }}>Select Shipping Address</h3>
                    
                    {/* Quick Select from Saved Addresses */}
                    {savedAddresses.length > 0 ? (
                      <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#888888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px', fontFamily: 'Montserrat, sans-serif' }}>Saved Addresses</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                          {savedAddresses.map((addr) => (
                            <button
                              key={addr._id || addr.id}
                              type="button"
                              onClick={() => {
                                setShippingAddress(addr.address_line);
                                setAddressError(false);
                              }}
                              style={{
                                textAlign: 'left',
                                padding: '12px 16px',
                                background: shippingAddress === addr.address_line ? '#ffffff' : '#FAF9F8',
                                border: `1px solid ${shippingAddress === addr.address_line ? '#111111' : '#EAEAEA'}`,
                                borderRadius: '4px',
                                fontSize: '12px',
                                color: '#111111',
                                cursor: 'pointer',
                                width: '100%',
                                transition: 'all 0.2s ease',
                                fontFamily: 'Montserrat, sans-serif',
                              }}
                            >
                              {addr.is_default && (
                                <span style={{ fontSize: '9px', fontWeight: 600, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>Default Address</span>
                              )}
                              {addr.address_line}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: '12px', color: '#666666', marginBottom: '16px', fontFamily: 'Montserrat, sans-serif' }}>No saved locations found. Please add a location using the selector below.</p>
                    )}

                    {/* Add New Address Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressModal(true);
                        setHouseNumber('');
                        setLandmark('');
                        setAutoAddress('');
                        setAddressTag('Home');
                        setMapCenter(null);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '12px 16px',
                        background: 'transparent',
                        color: '#111111',
                        border: '1px dashed #111111',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginBottom: '16px',
                        transition: 'all 0.2s ease',
                        fontFamily: 'Montserrat, sans-serif',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#F9F9F9'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Plus size={16} /> Add New Address
                    </button>

                    {shippingAddress && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px 16px',
                        background: '#FAF9F8',
                        border: '1px solid #EAEAEA',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#111111',
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        <span style={{ fontSize: '9px', fontWeight: 600, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Selected Shipping Address</span>
                        {shippingAddress}
                      </div>
                    )}

                    {addressError && (
                      <p className="pd-om-error">⚠ Please select or add a shipping address to proceed.</p>
                    )}
                  </div>
                )}

                {/* STEP 2: Payment Gateway Selection */}
                {checkoutStep === 2 && (
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'Cormorant Garamond, serif', marginBottom: '10px', color: '#111111' }}>Amount &amp; Payment Method</h3>
                    
                    {/* Product Card */}
                    <div className="pd-om-product" style={{ paddingBottom: '10px', marginBottom: '10px', gap: '12px' }}>
                      <div className="pd-om-img" style={{ width: '56px', height: '56px' }}>
                        {img
                          ? <img src={img} alt={product.name} />
                          : <span style={{ fontSize: 24 }}>💍</span>
                        }
                      </div>
                      <div className="pd-om-product-info">
                        <p className="pd-om-product-name" style={{ fontSize: '13px', marginBottom: '2px' }}>{product.name}</p>
                        {selectedVariant && (
                          <p className="pd-om-product-variant" style={{ fontSize: '10px', marginBottom: '2px' }}>Metal: {selectedVariant.material}</p>
                        )}
                        <p style={{ fontSize: 10, color: '#888888', marginBottom: 2, fontFamily: 'Montserrat, sans-serif' }}>
                          Qty: 1 &nbsp;·&nbsp; {MOCKUP_OPTIONS.carats[selectedCarat]} &nbsp;·&nbsp; {MOCKUP_OPTIONS.diamonds[selectedDiamond]}
                        </p>
                        <p className="pd-om-product-price" style={{ fontSize: '13px' }}><PriceDisplay amountInINR={price} /></p>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="pd-om-breakdown" style={{ padding: '10px 14px', marginBottom: '12px' }}>
                      <div className="pd-om-breakdown-row" style={{ marginBottom: '4px', fontSize: '11px' }}>
                        <span>Item Price</span>
                        <span>{formatPrice(price)}</span>
                      </div>
                      <div className="pd-om-breakdown-row" style={{ marginBottom: '4px', fontSize: '11px' }}>
                        <span>GST (3%)</span>
                        <span>{formatPrice(gst)}</span>
                      </div>
                      <div className="pd-om-breakdown-row" style={{ marginBottom: '4px', fontSize: '11px' }}>
                        <span>Shipping</span>
                        <span style={{ color: shipping === 0 ? '#15803D' : '#111111', fontWeight: shipping === 0 ? '600' : 'normal' }}>
                          {shipping === 0 ? 'Free' : formatPrice(shipping)}
                        </span>
                      </div>
                      <div className="pd-om-breakdown-row total" style={{ borderTop: '1px solid #EAEAEA', paddingTop: '6px', marginTop: '4px', marginBottom: 0, fontSize: '12px' }}>
                        <span>Total Payable</span>
                        <span style={{ fontSize: '14px' }}>{formatPrice(total)}</span>
                      </div>
                    </div>

                    {/* Select Payment Method */}
                    <div style={{ marginTop: '12px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: '#888888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px', fontFamily: 'Montserrat, sans-serif' }}>Choose Payment Option</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentMethod('razorpay')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            background: selectedPaymentMethod === 'razorpay' ? '#ffffff' : '#FAF9F8',
                            border: `1px solid ${selectedPaymentMethod === 'razorpay' ? '#111111' : '#EAEAEA'}`,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            width: '100%',
                            fontFamily: 'Montserrat, sans-serif'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '14px', height: '14px', borderRadius: '50%',
                              border: `2px solid ${selectedPaymentMethod === 'razorpay' ? '#111111' : '#cccccc'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {selectedPaymentMethod === 'razorpay' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#111111' }} />}
                            </div>
                            <div style={{ textAlign: 'left' }}>
                              <p style={{ fontSize: '12px', fontWeight: 600, color: '#111111', margin: 0 }}>Razorpay (India)</p>
                              <p style={{ fontSize: '10px', color: '#666666', margin: '2px 0 0' }}>UPI, Cards, Netbanking, Wallets</p>
                            </div>
                          </div>
                          <span style={{ fontSize: '18px' }}>🇮🇳</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedPaymentMethod('stripe')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            background: selectedPaymentMethod === 'stripe' ? '#ffffff' : '#FAF9F8',
                            border: `1px solid ${selectedPaymentMethod === 'stripe' ? '#111111' : '#EAEAEA'}`,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            width: '100%',
                            fontFamily: 'Montserrat, sans-serif'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '14px', height: '14px', borderRadius: '50%',
                              border: `2px solid ${selectedPaymentMethod === 'stripe' ? '#111111' : '#cccccc'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {selectedPaymentMethod === 'stripe' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#111111' }} />}
                            </div>
                            <div style={{ textAlign: 'left' }}>
                              <p style={{ fontSize: '12px', fontWeight: 600, color: '#111111', margin: 0 }}>Stripe (International)</p>
                              <p style={{ fontSize: '10px', color: '#666666', margin: '2px 0 0' }}>Credit / Debit Cards, Apple Pay</p>
                            </div>
                          </div>
                          <span style={{ fontSize: '18px' }}>🌐</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Final Review */}
                {checkoutStep === 3 && (
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'Cormorant Garamond, serif', marginBottom: '10px', color: '#111111' }}>Final Review</h3>
                    
                    {/* Item and Total Payable Summary */}
                    <div style={{ background: '#FAF9F8', padding: '10px 14px', borderRadius: '6px', marginBottom: '12px', border: '1px solid #EAEAEA' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11px', color: '#666666', fontFamily: 'Montserrat, sans-serif' }}>
                        <span>Item: {product.name} {selectedVariant ? `(${selectedVariant.material})` : ''}</span>
                        <span>Qty: 1</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #EAEAEA' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#111111', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Montserrat, sans-serif' }}>Total Payable</span>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#111111', fontFamily: 'Montserrat, sans-serif' }}>{formatPrice(total)}</span>
                      </div>
                    </div>

                    {/* Shipping Address Summary */}
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: '#888888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px', fontFamily: 'Montserrat, sans-serif' }}>Delivery Address</p>
                      <div style={{ padding: '10px 14px', background: '#ffffff', border: '1px solid #EAEAEA', borderRadius: '4px', fontSize: '12px', color: '#333333', fontFamily: 'Montserrat, sans-serif', lineHeight: '1.5' }}>
                        {shippingAddress}
                      </div>
                    </div>

                    {/* Payment Method Summary */}
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: '#888888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px', fontFamily: 'Montserrat, sans-serif' }}>Selected Payment Option</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#ffffff', border: '1px solid #EAEAEA', borderRadius: '4px', fontSize: '12px', fontWeight: 600, color: '#111111', fontFamily: 'Montserrat, sans-serif' }}>
                        {selectedPaymentMethod === 'razorpay' ? (
                          <>
                            <span>🇮🇳</span>
                            <span>Razorpay (UPI, Domestic Cards, Netbanking)</span>
                          </>
                        ) : (
                          <>
                            <span>🌐</span>
                            <span>Stripe (International Credit / Debit Cards)</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="pd-om-footer">
                {checkoutStep === 1 && (
                  <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <button 
                      className="pd-om-cancel-btn" 
                      style={{ flex: 1, border: '1px solid #E5E5E5', marginTop: 0 }} 
                      onClick={() => setShowOrderModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="pd-om-confirm-btn"
                      style={{ flex: 1.5 }}
                      onClick={() => {
                        if (!shippingAddress.trim()) {
                          setAddressError(true);
                        } else {
                          setAddressError(false);
                          setCheckoutStep(2);
                        }
                      }}
                    >
                      Continue to Payment
                    </button>
                  </div>
                )}

                {checkoutStep === 2 && (
                  <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <button 
                      className="pd-om-cancel-btn" 
                      style={{ flex: 1, border: '1px solid #E5E5E5', marginTop: 0 }} 
                      onClick={() => setCheckoutStep(1)}
                    >
                      Back
                    </button>
                    <button
                      className="pd-om-confirm-btn"
                      style={{ flex: 1.5 }}
                      onClick={() => setCheckoutStep(3)}
                    >
                      Continue to Review
                    </button>
                  </div>
                )}

                {checkoutStep === 3 && (
                  <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <button 
                      className="pd-om-cancel-btn" 
                      style={{ flex: 1, border: '1px solid #E5E5E5', marginTop: 0 }} 
                      onClick={() => setCheckoutStep(2)}
                    >
                      Back
                    </button>
                    <button
                      className="pd-om-confirm-btn"
                      style={{ flex: 1.5 }}
                      onClick={confirmAndPay}
                      disabled={paymentLoading}
                    >
                      {paymentLoading ? 'Preparing Gateway...' : 'Confirm & Pay'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add Address Modal */}
      {showAddressModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <div style={{
            background: '#fff', borderRadius: '8px', padding: '28px',
            width: '100%', maxWidth: '780px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            animation: 'fadeIn 0.25s ease', maxHeight: '90vh', overflowY: 'auto'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#000', fontFamily: 'Montserrat, sans-serif' }}>Select Delivery Location</h3>
              <button 
                type="button" 
                onClick={() => {
                  setShowAddressModal(false);
                  setHouseNumber('');
                  setLandmark('');
                  setAutoAddress('');
                  setAddressTag('Home');
                  setMapCenter(null);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#999', lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            {/* Responsive Content Columns */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '24px'
            }}>
              {/* Left: Map */}
              <div style={{ flex: '1 1 340px', minWidth: '280px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#CEA268', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                  Move Map to Adjust Location Pin
                </div>
                <LocationMap 
                  onLocationSelect={handleLocationSelect} 
                  mapCenter={mapCenter} 
                />
              </div>

              {/* Right: Address Details Form */}
              <div style={{ flex: '1 1 280px', minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="form-label" style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#000', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Save As
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['Home', 'Work', 'Other'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setAddressTag(tag)}
                        style={{
                          flex: 1,
                          padding: '10px 0',
                          borderRadius: '4px',
                          border: `1px solid ${addressTag === tag ? '#000' : '#E5E5E5'}`,
                          background: addressTag === tag ? '#000' : '#fff',
                          color: addressTag === tag ? '#fff' : '#555',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: 'Montserrat, sans-serif',
                          transition: 'all 0.2s'
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#000', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Flat / House No. / Building Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 302, Royal Enclave"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 12px',
                      border: '1px solid #E5E5E5',
                      borderRadius: '4px',
                      fontSize: '13px',
                      color: '#333',
                      fontFamily: 'Montserrat, sans-serif',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#000', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Locality / Street / Area (Auto-detected)
                  </label>
                  <textarea
                    readOnly
                    placeholder="Move the map pin to select area"
                    value={autoAddress}
                    style={{
                      width: '100%',
                      padding: '11px 12px',
                      border: '1px solid #E5E5E5',
                      borderRadius: '4px',
                      fontSize: '13px',
                      color: '#666',
                      background: '#F9F9F9',
                      fontFamily: 'Montserrat, sans-serif',
                      boxSizing: 'border-box',
                      resize: 'none',
                      height: '55px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#000', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Opposite Star Mall"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 12px',
                      border: '1px solid #E5E5E5',
                      borderRadius: '4px',
                      fontSize: '13px',
                      color: '#333',
                      fontFamily: 'Montserrat, sans-serif',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={handleAddAddress}
                    disabled={addressLoading}
                    style={{
                      flex: 1.2,
                      padding: '12px',
                      background: '#000',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      cursor: 'pointer',
                      fontFamily: 'Montserrat, sans-serif'
                    }}
                  >
                    {addressLoading ? 'Saving...' : 'Save Location'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddressModal(false);
                      setHouseNumber('');
                      setLandmark('');
                      setAutoAddress('');
                      setAddressTag('Home');
                      setMapCenter(null);
                    }}
                    style={{
                      flex: 0.8,
                      padding: '12px',
                      background: '#fff',
                      color: '#000',
                      border: '1px solid #E5E5E5',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      cursor: 'pointer',
                      fontFamily: 'Montserrat, sans-serif'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stripe Payment Modal */}
      {showStripeModal && stripeClientSecret && (
        <div className="pd-modal-overlay" onClick={e => e.target === e.currentTarget && setShowStripeModal(false)}>
          <div className="pd-modal">
            <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret }}>
              <StripeCheckoutForm
                onSuccess={async (paymentIntent) => {
                  try {
                    const verifyRes = await fetch('/api/Pages/Payments/Stripe/verify', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
                    });
                    const verifyData = await verifyRes.json();
                    if (!verifyRes.ok) {
                      throw new Error(verifyData.message || 'Verification failed');
                    }
                    setShowStripeModal(false);
                    toast.success('Payment Successful! Thank you for your order.');
                  } catch (err) {
                    console.error("Order creation failed:", err);
                    toast.error(err.message || 'Payment succeeded but order creation failed. Please contact support.');
                  }
                }}
                onClose={() => setShowStripeModal(false)}
              />
            </Elements>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}