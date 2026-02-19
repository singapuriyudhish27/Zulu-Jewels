'use client';

import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useEffect, useState } from 'react';
import { Search, User, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function CartPage() {
    const [showStripeModal, setShowStripeModal] = useState(false);
    const [stripeClientSecret, setStripeClientSecret] = useState(null);
    const [showPaymentOptions, setShowPaymentOptions] = useState(false);
    const router = useRouter();


    const [cartItems, setCartItems] = useState([
        { id: 1, name: "The Serenity", price: 1332, qty: 1 },
        { id: 2, name: "Classic Pavé Band", price: 945, qty: 1 },
        { id: 3, name: "Diamond Stud Earrings", price: 1550, qty: 1 },
    ]);

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const tax = Math.round(subtotal * 0.08);
    const total = subtotal + tax;


    function updateQty(btn, change) {
        const cartItem = btn.closest(".cart-item");
        const index = [...document.querySelectorAll(".cart-item")].indexOf(cartItem);
        if (index === -1) return;

        setCartItems((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, qty: Math.max(1, item.qty + change) } : item
            )
        );
    }

    function removeItem(btn) {
        const cartItem = btn.closest(".cart-item");
        if (!cartItem) return;

        cartItem.style.opacity = "0";
        cartItem.style.transform = "translateX(50px)";

        setTimeout(() => {
            const index = [...document.querySelectorAll(".cart-item")].indexOf(cartItem);
            if (index === -1) return;

            setCartItems((prev) => prev.filter((_, i) => i !== index));
        }, 300);
    }

    const [loading, setLoading] = useState(false);

    const loadRazorpay = () =>
        new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });

        const handlePayment = async () => {
        setLoading(true);

        const res = await fetch("/api/Pages/Payments/RazorPay/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: total * 100 }), // paise
        });

        const order = await res.json();

        const isLoaded = await loadRazorpay();
        if (!isLoaded) {
            toast.error("Razorpay SDK failed to load");
            setLoading(false);
            return;
        }

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: "Zulu Jewellers",
            description: "Order Payment",
            order_id: order.id,
            handler: async function (response) {
                await fetch("/api/payments/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(response),
                });
                toast.success("Payment Successful! Thank you for your order.");
            },
            prefill: {
            name: "Customer Name",
            email: "customer@example.com",
            contact: "9999999999",
            },
            theme: { color: "#3399cc" },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
        setLoading(false);
    };

    const handleStripePayment = async () => {
        setLoading(true);

        const res = await fetch("/api/Pages/Payments/Stripe/create-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: total }),
        });

        const { clientSecret } = await res.json();

        if (!clientSecret) {
            toast.error("Failed to create Stripe payment");
            setLoading(false);
            return;
        }

        // Store clientSecret temporarily
        setStripeClientSecret(clientSecret);
        setShowStripeModal(true);
        setLoading(false);
    };

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
                confirmParams: {
                    return_url: window.location.origin + "/payment-success",
                },
                redirect: "if_required",
            });

            if (error) {
                toast.error(error.message);
            } else if (paymentIntent && paymentIntent.status === "succeeded") {
                onSuccess();
            }

            setLoading(false);
        };

        return (
            <form onSubmit={handleSubmit}>
                <h3 style={{ marginBottom: "15px" }}>Pay with Card</h3>
                <PaymentElement />
                <button type="submit" className="checkout-btn" disabled={loading || !stripe}>
                    {loading ? "Processing..." : "Pay Now"}
                </button>
                <button type="button" className="continue-shopping" onClick={onClose}>
                    Cancel
                </button>
            </form>
        );
    }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary-gold: #D4AF37;
            --dark-bg: #1a1a1a;
            --light-bg: #ffffff;
            --text-dark: #2c2c2c;
            --text-light: #f5f5f5;
            --accent-rose: #C8A882;
            --border-light: #e8e8e8;
        }

        body {
            font-family: 'Montserrat', sans-serif;
            background: #f9f9f9;
            color: var(--text-dark);
        }

        /* Navigation */
        nav {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            padding: 25px 80px;
            background: white;
            box-shadow: 0 2px 20px rgba(0,0,0,0.05);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            font-family: 'Cormorant Garamond', serif;
            font-size: 28px;
            font-weight: 600;
            color: var(--primary-gold);
            letter-spacing: 2px;
            text-transform: uppercase;
            cursor: pointer;
        }

        .nav-menu {
            display: flex;
            gap: 45px;
            list-style: none;
        }

        .nav-menu a {
            color: var(--text-dark);
            text-decoration: none;
            font-size: 13px;
            font-weight: 500;
            letter-spacing: 1px;
            text-transform: uppercase;
            transition: all 0.3s ease;
            position: relative;
        }

        .nav-menu a::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 0;
            height: 2px;
            background: var(--primary-gold);
            transition: width 0.3s ease;
        }

        .nav-menu a:hover::after {
            width: 100%;
        }

        .nav-icons {
            display: flex;
            gap: 20px;
        }

        .icon-btn {
            width: 40px;
            height: 40px;
            border: 1px solid var(--border-light);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-dark);
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 18px;
            position: relative;
        }

        .icon-btn:hover,
        .icon-btn.active {
            background: var(--primary-gold);
            border-color: var(--primary-gold);
            color: white;
        }

        .cart-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            width: 20px;
            height: 20px;
            background: var(--primary-gold);
            color: white;
            border-radius: 50%;
            font-size: 11px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* Page Header */
        .page-header {
            margin-top: 90px;
            padding: 50px 80px;
            background: white;
            border-bottom: 1px solid var(--border-light);
            text-align: center;
        }

        .page-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 48px;
            font-weight: 400;
            color: var(--text-dark);
            margin-bottom: 10px;
        }

        .items-count {
            font-size: 15px;
            color: #666;
        }

        /* Main Content */
        .main-content {
            display: flex;
            gap: 40px;
            padding: 60px 80px;
            max-width: 1400px;
            margin: 0 auto;
        }

        /* Cart Items */
        .cart-items {
            flex: 1;
        }

        .cart-item {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.04);
            margin-bottom: 20px;
            display: flex;
            gap: 25px;
            transition: all 0.3s ease;
        }

        .cart-item:hover {
            box-shadow: 0 5px 25px rgba(0,0,0,0.08);
        }

        .item-image {
            width: 150px;
            height: 150px;
            background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
            border-radius: 8px;
            flex-shrink: 0;
        }

        .item-details {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
        }

        .item-info h3 {
            font-family: 'Cormorant Garamond', serif;
            font-size: 24px;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 8px;
        }

        .item-specs {
            font-size: 13px;
            color: #666;
            margin-bottom: 5px;
        }

        .remove-btn {
            background: transparent;
            border: none;
            color: #999;
            cursor: pointer;
            font-size: 24px;
            transition: all 0.3s ease;
            padding: 0;
            width: 30px;
            height: 30px;
        }

        .remove-btn:hover {
            color: #f44336;
            transform: scale(1.2);
        }

        .item-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .quantity-control {
            display: flex;
            align-items: center;
            gap: 15px;
            border: 1px solid var(--border-light);
            border-radius: 6px;
            padding: 5px 10px;
        }

        .qty-btn {
            background: transparent;
            border: none;
            color: var(--text-dark);
            cursor: pointer;
            font-size: 18px;
            font-weight: 600;
            padding: 5px 10px;
            transition: all 0.3s ease;
        }

        .qty-btn:hover {
            color: var(--primary-gold);
        }

        .qty-input {
            width: 50px;
            text-align: center;
            border: none;
            font-size: 15px;
            font-weight: 600;
        }

        .item-price {
            font-size: 26px;
            font-weight: 700;
            color: var(--primary-gold);
        }

        /* Order Summary */
        .order-summary {
            width: 380px;
            flex-shrink: 0;
        }

        .summary-card {
            background: white;
            padding: 35px;
            border-radius: 10px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.04);
            position: sticky;
            top: 120px;
        }

        .summary-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 28px;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--border-light);
        }

        .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            font-size: 15px;
        }

        .summary-label {
            color: #666;
        }

        .summary-value {
            font-weight: 600;
            color: var(--text-dark);
        }

        .summary-divider {
            height: 1px;
            background: var(--border-light);
            margin: 20px 0;
        }

        .summary-total {
            display: flex;
            justify-content: space-between;
            font-size: 22px;
            font-weight: 700;
            color: var(--text-dark);
            margin: 25px 0;
        }

        .total-amount {
            color: var(--primary-gold);
        }

        .promo-code {
            display: flex;
            gap: 10px;
            margin: 25px 0;
        }

        .promo-input {
            flex: 1;
            padding: 12px 15px;
            border: 1px solid var(--border-light);
            border-radius: 6px;
            font-size: 14px;
        }

        .apply-btn {
            padding: 12px 20px;
            background: var(--dark-bg);
            color: white;
            border: none;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 6px;
        }

        .apply-btn:hover {
            background: var(--primary-gold);
            color: var(--dark-bg);
        }

        .checkout-btn {
            width: 100%;
            padding: 18px;
            background: var(--primary-gold);
            color: var(--dark-bg);
            border: none;
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 6px;
            margin-bottom: 15px;
        }

        .checkout-btn:hover {
            background: var(--accent-rose);
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(212,175,55,0.3);
        }

        .continue-shopping {
            width: 100%;
            padding: 15px;
            background: transparent;
            border: 1px solid var(--border-light);
            color: var(--text-dark);
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 6px;
        }

        .continue-shopping:hover {
            border-color: var(--primary-gold);
            color: var(--primary-gold);
        }

        .trust-badges {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 25px;
            padding-top: 25px;
            border-top: 1px solid var(--border-light);
        }

        .trust-badge {
            text-align: center;
        }

        .trust-icon {
            font-size: 24px;
            margin-bottom: 5px;
        }

        .trust-text {
            font-size: 11px;
            color: #666;
        }

        /* Empty Cart */
        .empty-cart {
            text-align: center;
            padding: 100px 40px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.04);
        }

        .empty-icon {
            font-size: 80px;
            margin-bottom: 25px;
            opacity: 0.3;
        }

        .empty-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 36px;
            font-weight: 400;
            color: var(--text-dark);
            margin-bottom: 15px;
        }

        .empty-text {
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
        }

        @media (max-width: 768px) {
            nav {
                padding: 20px 30px;
            }
            .main-content {
                flex-direction: column;
                padding: 40px 30px;
            }
            .order-summary {
                width: 100%;
            }
            .cart-item {
                flex-direction: column;
            }
            .item-image {
                width: 100%;
                height: 250px;
            }
        }
      `}} />
      
    {/* Navigation */}
    <nav>
        <div className="logo" onClick={() => window.location.href = '/Pages'}>Zulu Jewellers</div>
        <ul className="nav-menu">
            <li><a href="/Pages/engagement">Engagement</a></li>
            <li><a href="/Pages/wedding">Wedding</a></li>
            <li><a href="/Pages/custom">Custom</a></li>
            <li><a href="/Pages/About">About</a></li>
        </ul>
        <div className="nav-icons">
            <Link href="/Pages/Profile" className="icon-btn" aria-label="User Profile">
                <User size={18} strokeWidth={1.5} />
            </Link>
            <Link href="/Pages/cart" className="icon-btn active" aria-label="Shopping Cart">
                <ShoppingCart size={18} strokeWidth={1.5} />
            </Link>
        </div>
    </nav>

    {/* Page Header */}
    <div className="page-header">
        <h1 className="page-title">Shopping Cart</h1>
        <p className="items-count">You have {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart</p>
    </div>

    {/* Main Content */}
    <div className="main-content">
        <div className="cart-items">
            {cartItems.map((item) => (
                <div className="cart-item" key={item.id}>
                    <div className="item-image"></div>
                    <div className="item-details">
                        <div className="item-header">
                            <div className="item-info">
                                <h3>{item.name}</h3>
                                <div className="item-specs">14K White Gold | Diamond</div>
                                <div className="item-specs">SKU: AUTO-{item.id}</div>
                            </div>
                            <button className="remove-btn" onClick={(e) => removeItem(e.target)}>×</button>
                        </div>
                        <div className="item-footer">
                            <div className="quantity-control">
                                <button className="qty-btn" onClick={(e) => updateQty(e.target, -1)}>−</button>
                                <input type="text" className="qty-input" value={item.qty} readOnly />
                                <button className="qty-btn" onClick={(e) => updateQty(e.target, 1)}>+</button>
                            </div>
                            <div className="item-price">${item.price.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Order Summary */}
        <div className="order-summary">
            <div className="summary-card">
                <h2 className="summary-title">Order Summary</h2>
                
                <div className="summary-row">
                    <span className="summary-label">Subtotal ({cartItems.length} items)</span>
                    <span className="summary-value" id="subtotal">${subtotal.toLocaleString()}</span>
                </div>
                
                <div className="summary-row">
                    <span className="summary-label">Shipping</span>
                    <span className="summary-value" style={{color: '#4CAF50'}}>FREE</span>
                </div>
                
                <div className="summary-row">
                    <span className="summary-label">Tax</span>
                    <span className="summary-value" id="tax">${tax.toLocaleString()}</span>
                </div>

                <div className="promo-code">
                    <input type="text" className="promo-input" placeholder="Promo Code" />
                    <button className="apply-btn">Apply</button>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-total">
                    <span>Total</span>
                    <span className="total-amount" id="total">${total.toLocaleString()}</span>
                </div>

                <button 
                    className="checkout-btn" 
                    onClick={async () => {
                        setLoading(true);
                        try {
                            const response = await fetch('/api/Pages/Profile', { credentials: 'include' });
                            if (response.ok) {
                                setShowPaymentOptions(true);
                            } else {
                                toast.error("Please login first to proceed with payment.");
                                router.push('/auth/login?callbackUrl=/Pages/cart');
                            }
                        } catch (error) {
                            console.error("Auth check error:", error);
                            toast.error("An error occurred. Please try again.");
                        } finally {
                            setLoading(false);
                        }
                    }} 
                    disabled={loading}
                >
                    {loading ? "Processing..." : "Proceed to Payment"}
                </button>
                {showPaymentOptions && (
                    <div style={{ marginTop: "15px", display: "flex", gap: "10px", flexDirection: "column" }}>
                        <button className="checkout-btn" onClick={handlePayment}>
                            Pay with Razorpay (UPI / Cards / NetBanking)
                        </button>
                        <button className="checkout-btn" onClick={handleStripePayment}>
                            Pay with Stripe (International Cards)
                        </button>
                    </div>
                )}
                <button className="continue-shopping" onClick={() => window.location.href = '/Pages'}>Continue Shopping</button>
                
                <div className="trust-badges">
                    <div className="trust-badge">
                        <div className="trust-icon">🔒</div>
                        <div className="trust-text">Secure<br />Checkout</div>
                    </div>
                    <div className="trust-badge">
                        <div className="trust-icon">📦</div>
                        <div className="trust-text">Free<br />Shipping</div>
                    </div>
                    <div className="trust-badge">
                        <div className="trust-icon">↩️</div>
                        <div className="trust-text">30-Day<br />Returns</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    {showStripeModal && stripeClientSecret && (
        <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999
        }}>
            <div style={{ background: "white", padding: "30px", borderRadius: "10px", width: "400px" }}>
                <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret }}>
                    <StripeCheckoutForm
                    onSuccess={() => {
                        toast.success("Payment Successful! Thank you for your order.");
                        setShowStripeModal(false);
                    }}
                    onClose={() => setShowStripeModal(false)}
                    />
                </Elements>
            </div>
        </div>
    )}
    </>
  );
}