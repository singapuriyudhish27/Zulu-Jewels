'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
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
      onSuccess();
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
  const [mapLocation, setMapLocation] = useState(null); // { lat, lon, display_name }
  const [mapLoading, setMapLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]); // User's saved addresses from profile

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
          if (data.product.cart_variants) setInCartVariantIds(data.product.cart_variants.map(id => id === 'base' ? null : Number(id)));
          // Auto-select first variant if exists
          if (data.product.variants && data.product.variants.length > 0) {
            setSelectedVariant(data.product.variants[0]);
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

  // Geocode address using our server-side proxy (avoids Nominatim User-Agent blocking)
  useEffect(() => {
    if (!shippingAddress.trim() || shippingAddress.trim().length < 8) {
      setMapLocation(null);
      return;
    }
    const timer = setTimeout(async () => {
      setMapLoading(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(shippingAddress)}`);
        const data = await res.json();
        if (data.found) {
          setMapLocation({ lat: data.lat, lon: data.lon, display_name: data.display_name });
        } else {
          setMapLocation(null);
        }
      } catch (_) {
        setMapLocation(null);
      } finally {
        setMapLoading(false);
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [shippingAddress]);

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  if (!product) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Product not found</div>;

  // Derived Values
  const currentPrice = selectedVariant ? 1 * selectedVariant.price : 1 * product.price;
  const currentDesc = (selectedVariant && selectedVariant.description) ? selectedVariant.description : product.description;
  const currentImages = selectedVariant 
    ? product.images.filter(img => img.variant_id === selectedVariant.id)
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
        body: JSON.stringify({ product_id: id, variant_id: selectedVariant?.id, action: 'cart', quantity: 1 })
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
        const currentId = selectedVariant?.id || null;
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
        body: JSON.stringify({ product_id: id, variant_id: selectedVariant?.id, action: 'wishlist' })
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
        body: JSON.stringify({ amount: amountInRupees * 100 }),
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
      const currentVariantId = selectedVariant?.id || null;
      const isThisVariantInCart = inCartVariantIds.includes(currentVariantId);
      if (!isThisVariantInCart) {
        await addToCart();
      }

      // 4. Open Order Review Modal
      setAddressError(false);
      setShowOrderModal(true);
    } catch (error) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
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
      variantId: selectedVariant?.id || null,
      quantity: 1,
      price: price,
      shippingAddress: shippingAddress.trim()
    };

    // Detect user country and route to correct payment gateway
    let country = 'XX';
    try {
      const geoRes = await fetch('https://ipapi.co/json/');
      const geoData = await geoRes.json();
      country = geoData.country_code || 'XX';
    } catch (_) {
      toast('Could not detect location. Defaulting to international payment.', { icon: '🌐' });
    }

    if (country === 'IN') {
      toast('Detected India 🇮🇳 — Opening Razorpay', { icon: '💳' });
      await handleRazorpayPayment(price, specificItem);
    } else {
      toast('Opening Stripe for international payment 🌐', { icon: '💳' });
      await handleStripePayment(price, specificItem);
    }
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
          max-width: 560px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 4px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.25);
          animation: pd-modal-in 0.25s ease;
        }
        @keyframes pd-modal-in {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .pd-om-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px 32px 20px;
          border-bottom: 1px solid #EFEFEF;
        }
        .pd-om-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px;
          font-weight: 500;
          color: #000000;
        }
        .pd-om-close {
          width: 36px; height: 36px;
          border: 1px solid #EFEFEF;
          border-radius: 50%;
          background: transparent;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #555;
          font-size: 18px;
          transition: all 0.2s;
        }
        .pd-om-close:hover { border-color: #000; color: #000; }
        .pd-om-body { padding: 28px 32px; }

        /* Product Card inside modal */
        .pd-om-product {
          display: flex;
          gap: 20px;
          align-items: flex-start;
          padding-bottom: 24px;
          border-bottom: 1px solid #EFEFEF;
          margin-bottom: 24px;
        }
        .pd-om-img {
          width: 96px;
          height: 96px;
          flex-shrink: 0;
          background: #F9F9F9;
          border: 1px solid #EFEFEF;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .pd-om-img img { width: 100%; height: 100%; object-fit: cover; }
        .pd-om-product-info { flex: 1; }
        .pd-om-product-name {
          font-size: 16px;
          font-weight: 700;
          color: #000;
          margin-bottom: 6px;
          line-height: 1.4;
        }
        .pd-om-product-variant {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #CEA268;
          margin-bottom: 8px;
        }
        .pd-om-product-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 600;
          color: #000;
        }

        /* Price Breakdown */
        .pd-om-breakdown { margin-bottom: 24px; }
        .pd-om-breakdown-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          color: #555;
          margin-bottom: 10px;
        }
        .pd-om-breakdown-row.total {
          font-size: 15px;
          font-weight: 700;
          color: #000;
          border-top: 1px solid #EFEFEF;
          padding-top: 14px;
          margin-top: 4px;
        }
        .pd-om-breakdown-row.total span:last-child {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 600;
        }

        /* Address Section */
        .pd-om-section-label {
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-weight: 700;
          color: #000;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pd-om-address-input {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid #EFEFEF;
          background: #F9F9F9;
          font-size: 13px;
          font-family: 'Montserrat', sans-serif;
          color: #000;
          outline: none;
          resize: none;
          height: 90px;
          border-radius: 2px;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .pd-om-address-input:focus { border-color: #000; background: #fff; }
        .pd-om-address-input.error { border-color: #dc2626; }
        .pd-om-error { color: #dc2626; font-size: 11px; margin-top: 6px; }

        /* Footer buttons */
        .pd-om-footer {
          padding: 20px 32px 28px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-top: 1px solid #EFEFEF;
        }
        .pd-om-confirm-btn {
          width: 100%;
          padding: 17px;
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
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border-radius: 2px;
        }
        .pd-om-confirm-btn:hover { background: #EAB308; color: #000; }
        .pd-om-confirm-btn:disabled { background: #EFEFEF; color: #aaa; cursor: not-allowed; }
        .pd-om-cancel-btn {
          width: 100%;
          padding: 14px;
          background: transparent;
          color: #000;
          border: 1px solid #EFEFEF;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Montserrat', sans-serif;
          border-radius: 2px;
        }
        .pd-om-cancel-btn:hover { border-color: #000; }\n\n        /* Map Preview */\n        .pd-om-map-wrap {\n          margin-top: 14px;\n          border-radius: 4px;\n          overflow: hidden;\n        }\n        .pd-om-map-loading {\n          display: flex;\n          align-items: center;\n          gap: 10px;\n          font-size: 12px;\n          color: #888;\n          padding: 14px;\n          background: #F9F9F9;\n          border: 1px solid #EFEFEF;\n          border-radius: 4px;\n        }\n        @keyframes pd-spin { to { transform: rotate(360deg); } }\n        .pd-om-map-spinner {\n          display: inline-block;\n          width: 14px;\n          height: 14px;\n          border: 2px solid #EFEFEF;\n          border-top-color: #000;\n          border-radius: 50%;\n          animation: pd-spin 0.7s linear infinite;\n          flex-shrink: 0;\n        }\n        .pd-om-map-found {\n          font-size: 11px;\n          color: #555;\n          padding: 8px 2px 10px;\n          line-height: 1.5;\n          white-space: nowrap;\n          overflow: hidden;\n          text-overflow: ellipsis;\n        }\n        .pd-om-map-iframe {\n          width: 100%;\n          height: 220px;\n          border: 1px solid #EFEFEF;\n          border-radius: 4px;\n          display: block;\n        }\n        .pd-om-map-link {\n          display: inline-block;\n          margin-top: 8px;\n          font-size: 11px;\n          color: #555;\n          text-decoration: underline;\n          transition: color 0.2s;\n        }\n        .pd-om-map-link:hover { color: #000; }\n        .pd-om-map-notfound {\n          font-size: 11px;\n          color: #d97706;\n          padding: 10px 12px;\n          background: #FFFBEB;\n          border: 1px solid #FDE68A;\n          border-radius: 4px;\n          margin-top: 8px;\n        }
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
        .pd-page { font-family: 'Montserrat', sans-serif; background: #ffffff; padding-top: 72px; }

        /* General Variables */
        :root {
          --zj-black: #000000;
          --zj-white: #ffffff;
          --zj-gold: #EAB308;
          --zj-bg: #F9F9F9;
          --zj-green: #15803D;
        }

        /* Breadcrumb */
        .pd-breadcrumb {
          max-width: 1280px; margin: 0 auto; padding: 32px 24px;
          font-size: 11px; color: #888888; display: flex; gap: 12px; align-items: center;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .pd-breadcrumb a { color: #888888; text-decoration: none; transition: color 0.2s ease; }
        .pd-breadcrumb a:hover { color: #000000; }
        .pd-bc-sep { color: #cccccc; }
        .pd-bc-cur { color: #000000; font-weight: 600; }

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
        .pd-thumbnails { display: flex; gap: 12px; }
        .pd-thumb {
          width: 76px; height: 76px; background: #F9F9F9;
          display: flex; align-items: center; justify-content: center;
          font-size: 32px; cursor: pointer; border: 2px solid transparent;
          transition: border-color 0.2s ease;
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
        }
      `}</style>

      <Navbar />
      <div className="pd-page">

      {/* Breadcrumb */}
      <div className="pd-breadcrumb">
        <Link href="/Pages">Home</Link>
        <span className="pd-bc-sep">›</span>
        <Link href="/Pages/Products">Rings</Link>
        <span className="pd-bc-sep">›</span>
        <span className="pd-bc-cur">{product.name}</span>
      </div>

      {/* Product Area */}
      <div className="pd-product-area">
        {/* Gallery */}
        <div className="pd-gallery">
          <div className="pd-main-img">
            {thumbs[activeThumb]?.type === 'video' ? (
              <video 
                src={thumbs[activeThumb].url} 
                controls 
                autoPlay 
                muted 
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
                {product.variants.map((v, i) => (
                  <button key={i} className={`pd-pill ${selectedVariant?.id === v.id ? 'active' : ''}`} onClick={() => { setSelectedVariant(v); setActiveThumb(0); }}>{v.material}</button>
                ))}
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
                className={`pd-btn-primary ${inCartVariantIds.includes(selectedVariant?.id || null) ? 'active' : ''}`} 
                onClick={addToCart}
              >
                {inCartVariantIds.includes(selectedVariant?.id || null) ? <ShoppingBag size={18} /> : <Plus size={18} />} 
                {inCartVariantIds.includes(selectedVariant?.id || null) ? 'In Cart' : 'Add To Cart'}
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

      </div>

      {/* Order Review Modal */}
      {showOrderModal && product && (() => {
        const price = selectedVariant ? selectedVariant.price : product.price;
        const gst = Math.round(price * 0.03);
        const shipping = price > 50000 ? 0 : 999;
        const total = price + gst + shipping;
        const img = selectedVariant
          ? product.images?.find(img => img.variant_id === selectedVariant.id)?.media_url
          : product.images?.find(img => !img.variant_id)?.media_url;
        return (
          <div className="pd-modal-overlay" onClick={e => e.target === e.currentTarget && setShowOrderModal(false)}>
            <div className="pd-order-modal">
              {/* Header */}
              <div className="pd-om-header">
                <h2 className="pd-om-title">Review Your Order</h2>
                <button className="pd-om-close" onClick={() => setShowOrderModal(false)}>✕</button>
              </div>

              {/* Body */}
              <div className="pd-om-body">

                {/* Product Card */}
                <div className="pd-om-product">
                  <div className="pd-om-img">
                    {img
                      ? <img src={img} alt={product.name} />
                      : <span style={{ fontSize: 40 }}>💍</span>
                    }
                  </div>
                  <div className="pd-om-product-info">
                    <p className="pd-om-product-name">{product.name}</p>
                    {selectedVariant && (
                      <p className="pd-om-product-variant">Metal: {selectedVariant.material}</p>
                    )}
                    <p style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
                      Qty: 1 &nbsp;·&nbsp; {MOCKUP_OPTIONS.carats[selectedCarat]} &nbsp;·&nbsp; {MOCKUP_OPTIONS.diamonds[selectedDiamond]}
                    </p>
                    <p className="pd-om-product-price"><PriceDisplay amountInINR={price} /></p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="pd-om-breakdown">
                  <div className="pd-om-breakdown-row">
                    <span>Item Price</span>
                    <span>{formatPrice(price)}</span>
                  </div>
                  <div className="pd-om-breakdown-row">
                    <span>GST (3%)</span>
                    <span>{formatPrice(gst)}</span>
                  </div>
                  <div className="pd-om-breakdown-row">
                    <span>Shipping</span>
                    <span style={{ color: shipping === 0 ? '#15803D' : '#000' }}>
                      {shipping === 0 ? 'Free' : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="pd-om-breakdown-row total">
                    <span>Total Payable</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Shipping Address */}
                <div style={{ marginBottom: 4 }}>
                  <p className="pd-om-section-label">
                    <span style={{ fontSize: 16 }}>📦</span> Shipping Address
                  </p>

                  {/* Quick Select from Saved Addresses */}
                  {savedAddresses.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ fontSize: '11px', fontWeight: 600, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Saved Addresses</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {savedAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => {
                              setShippingAddress(addr.address_line);
                              setAddressError(false);
                            }}
                            style={{
                              textAlign: 'left', padding: '10px 14px', background: shippingAddress === addr.address_line ? '#fdf8ef' : '#F9F9F9',
                              border: `1px solid ${shippingAddress === addr.address_line ? '#CEA268' : '#EFEFEF'}`,
                              borderRadius: '4px', fontSize: '12px', color: '#333', cursor: 'pointer',
                              width: '100%', transition: 'all 0.2s', fontFamily: 'Montserrat, sans-serif',
                            }}
                          >
                            {addr.is_default && (
                              <span style={{ fontSize: '9px', fontWeight: 700, color: '#CEA268', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '3px' }}>★ Default</span>
                            )}
                            {addr.address_line}
                          </button>
                        ))}
                      </div>
                      <p style={{ fontSize: '11px', color: '#aaa', margin: '10px 0 8px', textAlign: 'center' }}>— or enter a new address below —</p>
                    </div>
                  )}

                  <textarea
                    className={`pd-om-address-input ${addressError ? 'error' : ''}`}
                    placeholder="Enter your full delivery address, city, state, pincode..."
                    value={shippingAddress}
                    onChange={e => { setShippingAddress(e.target.value); if (e.target.value.trim()) setAddressError(false); }}
                  />
                  {addressError && (
                    <p className="pd-om-error">⚠ Please enter a shipping address to proceed.</p>
                  )}

                  {/* Map Preview */}
                  <div className="pd-om-map-wrap">
                    {mapLoading && (
                      <div className="pd-om-map-loading">
                        <span className="pd-om-map-spinner"/> Locating on map...
                      </div>
                    )}
                    {!mapLoading && mapLocation && (
                      <>
                        <p className="pd-om-map-found">📍 {mapLocation.display_name}</p>
                        <iframe
                          className="pd-om-map-iframe"
                          src={`https://www.google.com/maps?q=${mapLocation.lat},${mapLocation.lon}&t=k&z=16&output=embed`}
                          allowFullScreen
                          loading="lazy"
                          title="Shipping Address Satellite Map"
                        />
                        <a
                          href={`https://www.google.com/maps?q=${mapLocation.lat},${mapLocation.lon}&t=k&z=16`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pd-om-map-link"
                        >
                          Open in Google Maps Satellite ↗
                        </a>
                      </>
                    )}
                    {!mapLoading && !mapLocation && shippingAddress.trim().length >= 8 && (
                      <p className="pd-om-map-notfound">⚠ Address not found on map. Please be more specific.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pd-om-footer">
                <button
                  className="pd-om-confirm-btn"
                  onClick={confirmAndPay}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? 'Preparing Payment...' : '🔒 Confirm & Proceed to Payment'}
                </button>
                <button className="pd-om-cancel-btn" onClick={() => setShowOrderModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Stripe Payment Modal */}
      {showStripeModal && stripeClientSecret && (
        <div className="pd-modal-overlay" onClick={e => e.target === e.currentTarget && setShowStripeModal(false)}>
          <div className="pd-modal">
            <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret }}>
              <StripeCheckoutForm
                onSuccess={() => {
                  setShowStripeModal(false);
                  toast.success('Payment Successful! Thank you for your order.');
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