'use client';

import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import TrustBadge from '@/components/home/trustBadge';
import Footer from '@/components/layout/Footer';
import { Trash2, Minus, Plus, ShoppingBag, Tag } from 'lucide-react';

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
      <button type="submit" className="ca-checkout-btn" disabled={loading || !stripe}>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
      <button type="button" className="ca-continue-btn" onClick={onClose}>Cancel</button>
    </form>
  );
}

export default function CartPage() {
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const router = useRouter();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/Pages/cart');
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/auth/login?callbackUrl=/Pages/cart');
          return;
        }
        throw new Error('Failed to fetch cart');
      }
      const data = await res.json();
      if (data.success) {
        const sortedItems = (data.data || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setCartItems(sortedItems);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Could not load cart items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product?.price * item.quantity), 0);
  const discountAmt = promoApplied ? Math.round(subtotal * 0.05) : 0;
  const shipping = subtotal > 50000 ? 0 : 999;
  const tax = Math.round((subtotal - discountAmt) * 0.03);
  const total = subtotal - discountAmt + shipping + tax;

  const updateQty = async (cartItemId, newQty) => {
    if (newQty < 1) return;
    try {
      const res = await fetch('/api/Pages/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_item_id: cartItemId, quantity: newQty }),
      });
      const data = await res.json();
      if (data.success) {
        setCartItems(prev => prev.map(item =>
          item.cart_item_id === cartItemId ? { ...item, quantity: newQty } : item
        ));
      } else {
        toast.error(data.message || 'Failed to update quantity');
      }
    } catch (error) {
      toast.error('Error updating cart');
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      const res = await fetch('/api/Pages/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_item_id: cartItemId, quantity: 0 }),
      });
      const data = await res.json();
      if (data.success) {
        setCartItems(prev => prev.filter(item => item.cart_item_id !== cartItemId));
        toast.success('Item removed from cart');
      } else {
        toast.error(data.message || 'Failed to remove item');
      }
    } catch (error) {
      toast.error('Error removing item');
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

  const handlePayment = async () => {
    setLoading(true);
    const res = await fetch('/api/Pages/Payments/RazorPay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: total * 100 }),
    });
    const order = await res.json();
    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      toast.error('Razorpay SDK failed to load');
      setLoading(false);
      return;
    }
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Zulu Jewellers',
      description: 'Order Payment',
      order_id: order.id,
      handler: async function (response) {
        await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(response),
        });
        toast.success('Payment Successful! Thank you for your order.');
      },
      prefill: { name: 'Customer Name', email: 'customer@example.com', contact: '9999999999' },
      theme: { color: '#CEA268' },
    };
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
    setLoading(false);
  };

  const handleStripePayment = async () => {
    setLoading(true);
    const res = await fetch('/api/Pages/Payments/Stripe/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: total }),
    });
    const { clientSecret } = await res.json();
    if (!clientSecret) {
      toast.error('Failed to create Stripe payment');
      setLoading(false);
      return;
    }
    setStripeClientSecret(clientSecret);
    setShowStripeModal(true);
    setLoading(false);
  };

  return (
    <>
      <style>{`
        .ca-page { font-family: 'Montserrat', sans-serif; background: #ffffff; padding-top: 72px; min-height: 100vh; }

        /* General Variables */
        :root {
          --zj-black: #000000;
          --zj-white: #ffffff;
          --zj-gold: #EAB308;
          --zj-bg: #F9F9F9;
          --zj-green: #15803D;
        }

        /* Breadcrumb */
        .ca-breadcrumb {
          max-width: 1280px;
          margin: 0 auto;
          padding: 32px 24px 0;
          font-size: 11px;
          letter-spacing: 0.05em;
          color: #888888;
          display: flex;
          gap: 12px;
          align-items: center;
          text-transform: uppercase;
        }
        .ca-breadcrumb a { color: #888888; text-decoration: none; transition: color 0.2s ease; }
        .ca-breadcrumb a:hover { color: #000000; }
        .ca-breadcrumb-sep { color: #cccccc; }
        .ca-breadcrumb-current { color: #000000; font-weight: 600; }

        /* Page Header */
        .ca-header { max-width: 1280px; margin: 0 auto; padding: 40px 24px 48px; }
        .ca-header-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(32px, 5vw, 48px);
          color: #000000;
          font-weight: 500;
          margin-bottom: 8px;
        }
        .ca-header-sub { font-size: 14px; color: #666666; }

        /* Layout */
        .ca-layout {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px 40px;
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 64px;
          align-items: start;
        }

        /* Cart Items */
        .ca-items-header {
          display: grid;
          grid-template-columns: 1fr 100px 120px 80px;
          gap: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid #EFEFEF;
          margin-bottom: 0;
        }
        .ca-col-label {
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #888888;
          font-weight: 700;
        }
        .ca-col-label.center { text-align: center; }
        .ca-col-label.right { text-align: right; }

        .ca-cart-item {
          display: grid;
          grid-template-columns: 1fr 100px 120px 80px;
          gap: 16px;
          padding: 32px 0;
          border-bottom: 1px solid #EFEFEF;
          align-items: center;
          transition: opacity 0.3s, transform 0.3s;
        }
        .ca-item-details { 
          display: flex; gap: 24px; align-items: center; 
          transition: transform 0.2s ease, opacity 0.2s ease; 
        }
        .ca-item-details:hover { opacity: 0.7; transform: translateX(4px); }
        .ca-item-img {
          width: 80px;
          height: 80px;
          background: #F9F9F9;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
        }
        .ca-item-name { font-size: 14px; font-weight: 600; color: #000000; margin-bottom: 6px; }
        .ca-item-specs { font-size: 12px; color: #666666; line-height: 1.6; }
        .ca-item-discount {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #DCFCE7;
          color: #15803D;
          font-size: 10px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 2px;
          margin-top: 8px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .ca-item-price { font-size: 14px; font-weight: 600; color: #000000; }
        .ca-qty-control {
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #EFEFEF;
          border-radius: 2px;
          background: #F9F9F9;
        }
        .ca-qty-btn {
          width: 36px;
          height: 36px;
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #555555;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .ca-qty-btn:hover { color: #000000; background: #EFEFEF; }
        .ca-qty-val {
          width: 40px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          color: #000000;
          background: #ffffff;
          border-left: 1px solid #EFEFEF;
          border-right: 1px solid #EFEFEF;
        }
        .ca-item-actions { display: flex; justify-content: flex-end; align-items: center; }
        .ca-remove-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #cccccc;
          transition: color 0.2s ease;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ca-remove-btn:hover { color: #000000; }
        .ca-remove-btn svg { width: 18px; height: 18px; }

        /* Order Summary */
        .ca-summary {
          background: #F9F9F9;
          border: 1px solid #EFEFEF;
          padding: 32px;
          position: sticky;
          top: 88px;
        }
        .ca-summary-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          color: #000000;
          font-weight: 500;
          margin-bottom: 24px;
        }
        .ca-summary-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .ca-summary-label { font-size: 13px; color: #555555; }
        .ca-summary-value { font-size: 14px; color: #000000; font-weight: 500; }
        .ca-summary-value.green { color: #15803D; font-weight: 600; }
        .ca-summary-divider { border: none; border-top: 1px solid #EFEFEF; margin: 24px 0; }
        .ca-summary-total-row { display: flex; justify-content: space-between; align-items: center; }
        .ca-summary-total-label { font-size: 12px; font-weight: 700; color: #000000; text-transform: uppercase; letter-spacing: 0.1em; }
        .ca-summary-total-val { font-size: 24px; font-weight: 500; color: #000000; font-family: 'Cormorant Garamond', serif; }

        /* Promo */
        .ca-promo-row {
          display: flex;
          gap: 12px;
          margin-top: 24px;
          margin-bottom: 12px;
        }
        .ca-promo-input {
          flex: 1;
          padding: 14px;
          border: 1px solid #EFEFEF;
          background: #ffffff;
          outline: none;
          font-size: 13px;
          font-family: 'Montserrat', sans-serif;
          color: #000000;
          transition: border-color 0.2s ease;
        }
        .ca-promo-input:focus { border-color: #000000; }
        .ca-promo-input::placeholder { color: #aaaaaa; }
        .ca-promo-btn {
          padding: 14px 20px;
          background: #000000;
          color: #ffffff;
          border: none;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s ease;
          font-family: 'Montserrat', sans-serif;
          white-space: nowrap;
        }
        .ca-promo-btn:hover { background: #EAB308; color: #000000; }

        .ca-checkout-btn {
          width: 100%;
          padding: 18px;
          background: #000000;
          color: #ffffff;
          border: none;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 24px;
          font-family: 'Montserrat', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .ca-checkout-btn:hover { background: #EAB308; color: #000000; }
        .ca-checkout-btn:disabled { background: #EFEFEF; cursor: not-allowed; color: #aaaaaa; }
        
        .ca-continue-btn {
          width: 100%;
          padding: 16px;
          background: transparent;
          color: #000000;
          border: 1px solid #000000;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 12px;
          font-family: 'Montserrat', sans-serif;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .ca-continue-btn:hover { background: #000000; color: #ffffff; }

        /* Payment Options */
        .ca-payment-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #EFEFEF;
        }
        .ca-pay-btn {
          width: 100%;
          padding: 15px;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Montserrat', sans-serif;
          border: 1px solid #EFEFEF;
          background: #ffffff;
          color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .ca-pay-btn:hover { border-color: #000000; background: #F9F9F9; }

        /* Stripe Modal */
        .ca-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .ca-modal {
          background: #ffffff;
          padding: 40px;
          max-width: 480px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        /* Empty Cart */
        .ca-empty {
          text-align: center;
          padding: 100px 24px;
          max-width: 480px;
          margin: 0 auto;
        }
        .ca-empty-icon { font-size: 64px; margin-bottom: 24px; }
        .ca-empty-title { font-family: 'Cormorant Garamond', serif; font-size: 32px; color: #000000; margin-bottom: 16px; font-weight: 500; }
        .ca-empty-text { font-size: 14px; color: #666666; line-height: 1.8; margin-bottom: 32px; }

        @media (max-width: 900px) {
          .ca-layout { grid-template-columns: 1fr; gap: 48px; }
          .ca-summary { position: static; }
        }
        @media (max-width: 600px) {
          .ca-items-header { display: none; }
          .ca-cart-item { grid-template-columns: 1fr; gap: 16px; padding: 24px 0; }
          .ca-qty-control { max-width: 120px; }
          .ca-item-price { text-align: left; margin-top: 8px; }
          .ca-item-actions { justify-content: flex-start; margin-top: 8px; }
        }
      `}</style>

      <Navbar />

      <main className="ca-page">
        {/* Breadcrumb */}
        <div className="ca-breadcrumb">
          <Link href="/Pages">Home</Link>
          <span className="ca-breadcrumb-sep">›</span>
          <Link href="/Pages/Products">Rings</Link>
          <span className="ca-breadcrumb-sep">›</span>
          <Link href="/Pages/Products/1">Diamond Solitaire Ring</Link>
          <span className="ca-breadcrumb-sep">›</span>
          <span className="ca-breadcrumb-current">Cart</span>
        </div>

        {/* Header */}
        <div className="ca-header">
          <h1 className="ca-header-title">Your Cart</h1>
          <p className="ca-header-sub">Review your selected pieces before proceeding to checkout.</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="ca-empty">
            <div className="ca-empty-icon">🛍️</div>
            <h2 className="ca-empty-title">Your cart is empty</h2>
            <p className="ca-empty-text">Looks like you haven't added any jewelry to your cart yet. Explore our collections to find the perfect piece.</p>
            <Link href="/Pages/Products" className="ca-checkout-btn" style={{ textDecoration: 'none' }}>
              <ShoppingBag size={16} /> Explore Collections
            </Link>
          </div>
        ) : (
          <div className="ca-layout">
            {/* Cart Items */}
            <div>
              <div className="ca-items-header">
                <span className="ca-col-label">Product</span>
                <span className="ca-col-label">Price</span>
                <span className="ca-col-label center">Quantity</span>
                <span className="ca-col-label right">Total</span>
              </div>

              {cartItems.map(item => (
                <div key={item.cart_item_id} className="ca-cart-item">
                  <Link 
                    href={`/Pages/Products/${item.product.id}`} 
                    className="ca-item-details" 
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="ca-item-img">
                      {item.product?.images?.[0]?.media_url ? (
                        <img 
                          src={item.product.images[0].media_url} 
                          alt={item.product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        '💍'
                      )}
                    </div>
                    <div>
                      <p className="ca-item-name">{item.product?.name}</p>
                      {item.variant_material && (
                         <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#CEA268', letterSpacing: '0.05em', marginBottom: '4px' }}>
                           Metal: {item.variant_material}
                         </p>
                      )}
                      <p className="ca-item-specs" style={{ whiteSpace: 'pre-line' }}>{item.product?.description}</p>
                    </div>
                  </Link>
                  <div className="ca-item-price">₹{item.product?.price?.toLocaleString('en-IN')}</div>
                  <div className="ca-qty-control">
                    <button className="ca-qty-btn" onClick={() => updateQty(item.cart_item_id, item.quantity - 1)}><Minus size={12} /></button>
                    <span className="ca-qty-val">{item.quantity}</span>
                    <button className="ca-qty-btn" onClick={() => updateQty(item.cart_item_id, item.quantity + 1)}><Plus size={12} /></button>
                  </div>
                  <div className="ca-item-actions">
                    <button className="ca-remove-btn" onClick={() => removeItem(item.cart_item_id)} aria-label="Remove item">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <div className="ca-summary">
                <h2 className="ca-summary-title">Order Summary</h2>

                <div className="ca-summary-row">
                  <span className="ca-summary-label">Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="ca-summary-value">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="ca-summary-row">
                  <span className="ca-summary-label">Shipping</span>
                  <span className="ca-summary-value">{shipping === 0 ? <span className="green">Free</span> : `₹${shipping}`}</span>
                </div>
                {promoApplied && (
                  <div className="ca-summary-row">
                    <span className="ca-summary-label">Promo Discount</span>
                    <span className="ca-summary-value green">−₹{discountAmt.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="ca-summary-row">
                  <span className="ca-summary-label">GST (3%)</span>
                  <span className="ca-summary-value">₹{tax.toLocaleString('en-IN')}</span>
                </div>

                <hr className="ca-summary-divider" />

                <div className="ca-summary-total-row">
                  <span className="ca-summary-total-label">Total</span>
                  <span className="ca-summary-total-val">₹{total.toLocaleString('en-IN')}</span>
                </div>

                {/* Promo Code */}
                <div className="ca-promo-row">
                  <input
                    className="ca-promo-input"
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                  />
                  <button
                    className="ca-promo-btn"
                    onClick={() => {
                      if (promoCode.trim().toUpperCase() === 'ZULU5') {
                        setPromoApplied(true);
                        toast.success('Promo code applied! 5% off your order.');
                      } else {
                        toast.error('Invalid promo code');
                      }
                    }}
                  >
                    Apply
                  </button>
                </div>

                {!showPaymentOptions ? (
                  <button
                    className="ca-checkout-btn"
                    onClick={() => setShowPaymentOptions(true)}
                    disabled={loading}
                  >
                    <ShoppingBag size={16} />
                    {loading ? 'Processing...' : 'Proceed to Checkout'}
                  </button>
                ) : (
                  <div className="ca-payment-options">
                    <button className="ca-pay-btn" onClick={handlePayment} disabled={loading}>
                      💳 {loading ? 'Loading...' : 'Pay with Razorpay'}
                    </button>
                    <button className="ca-pay-btn" onClick={handleStripePayment} disabled={loading}>
                      💳 {loading ? 'Loading...' : 'Pay with Stripe'}
                    </button>
                  </div>
                )}

                <Link href="/Pages" className="ca-continue-btn">
                  <ShoppingBag size={14} /> Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Stripe Modal */}
        {showStripeModal && stripeClientSecret && (
          <div className="ca-modal-overlay" onClick={e => e.target === e.currentTarget && setShowStripeModal(false)}>
            <div className="ca-modal">
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

        <TrustBadge />
      </main>

      <Footer />
    </>
  );
}