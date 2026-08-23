'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function StripeCheckoutForm({ onSuccess, onClose, submitBtnClassName, cancelBtnClassName }) {
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
      <button 
        type="submit" 
        className={submitBtnClassName || "ca-checkout-btn"} 
        disabled={loading || !stripe}
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
      <button 
        type="button" 
        className={cancelBtnClassName || "ca-continue-btn"} 
        onClick={onClose}
      >
        Cancel
      </button>
    </form>
  );
}

export default function StripeModal({ clientSecret, onSuccess, onClose, submitBtnClassName, cancelBtnClassName }) {
  if (!clientSecret) return null;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripeCheckoutForm
        onSuccess={onSuccess}
        onClose={onClose}
        submitBtnClassName={submitBtnClassName}
        cancelBtnClassName={cancelBtnClassName}
      />
    </Elements>
  );
}
