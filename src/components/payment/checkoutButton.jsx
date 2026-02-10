"use client";

export default function CheckoutButton({ cartItems, userId }) {
  const handleCheckout = async () => {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cartItems, userId }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Payment failed to start.");
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="bg-black text-white px-6 py-2 rounded"
    >
      Pay with Stripe
    </button>
  );
}
