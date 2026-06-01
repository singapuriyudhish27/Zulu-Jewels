'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import toast, { Toaster } from 'react-hot-toast';
import { CheckCircle2, XCircle, AlertCircle, ShoppingBag, Send, ArrowRight, Loader } from 'lucide-react';

export default function DeliveryConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [received, setReceived] = useState(null); // null, true, false
  const [remarks, setRemarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/Pages/delivery-confirmation?orderId=${orderId}`);
        const result = await response.json();
        if (result.success) {
          setOrder(result.data);
          // If already confirmed, skip to thank you screen
          if (result.data.delivery_received !== undefined && result.data.delivery_received !== null) {
            setReceived(result.data.delivery_received);
            setRemarks(result.data.delivery_remarks || '');
            setFeedback(result.data.delivery_feedback || '');
            setSubmitted(true);
          }
        } else {
          toast.error(result.message || "Failed to load order details");
        }
      } catch (error) {
        console.error("Error loading order:", error);
        toast.error("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (received === null) {
      toast.error("Please confirm if you have received your order.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/Pages/delivery-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          received,
          remarks,
          feedback
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Delivery confirmation submitted successfully!");
        setSubmitted(true);
      } else {
        toast.error(result.message || "Submission failed");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  const formattedOrderId = orderId ? String(orderId).slice(-8).toUpperCase() : '';

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      
      <style dangerouslySetInnerHTML={{ __html: `
        .dc-container {
          background-color: #F5F1EC;
          min-height: 80vh;
          padding-top: 120px;
          padding-bottom: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Montserrat', sans-serif;
        }
        
        .dc-card {
          background: #FFFFFF;
          max-width: 600px;
          width: 100%;
          margin: 20px;
          border-radius: 4px;
          box-shadow: 0 4px 30px rgba(0,0,0,0.05);
          overflow: hidden;
          position: relative;
          border: 1px solid #F0EBE3;
        }

        .dc-gold-bar {
          background-color: #C9A84C;
          height: 4px;
          width: 100%;
        }

        .dc-header {
          padding: 40px 40px 20px;
          text-align: center;
          border-bottom: 1px solid #F0EBE3;
        }

        .dc-brand {
          font-size: 11px;
          letter-spacing: 5px;
          color: #C9A84C;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .dc-title {
          margin: 0;
          font-size: 22px;
          font-weight: 300;
          color: #1A1A1A;
          letter-spacing: 1px;
        }

        .dc-body {
          padding: 40px;
        }

        .dc-order-summary {
          background: #FAFAF8;
          padding: 20px;
          border-radius: 4px;
          border: 1px solid #F0EBE3;
          margin-bottom: 30px;
        }

        .dc-summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: #9B8B6E;
          margin-bottom: 8px;
        }

        .dc-summary-row:last-child {
          margin-bottom: 0;
        }

        .dc-summary-val {
          color: #2C2C2C;
          font-weight: 600;
        }

        .dc-question-label {
          font-size: 13px;
          letter-spacing: 1px;
          color: #C9A84C;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 16px;
          display: block;
        }

        .dc-btn-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        .dc-option-btn {
          padding: 18px;
          border-radius: 4px;
          border: 1px solid #E8E0D0;
          background: #FFFFFF;
          color: #2C2C2C;
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          outline: none;
        }

        .dc-option-btn:hover {
          border-color: #C9A84C;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(201, 168, 76, 0.08);
        }

        .dc-option-btn.selected-yes {
          background: rgba(74, 140, 92, 0.05);
          border-color: #4A8C5C;
          color: #4A8C5C;
        }

        .dc-option-btn.selected-no {
          background: rgba(176, 80, 80, 0.05);
          border-color: #B05050;
          color: #B05050;
        }

        .dc-textarea {
          width: 100%;
          padding: 14px;
          border: 1px solid #E8E0D0;
          border-radius: 4px;
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          color: #2C2C2C;
          resize: vertical;
          min-height: 80px;
          margin-bottom: 24px;
          outline: none;
          background: #FFFFFF;
          transition: border-color 0.3s;
        }

        .dc-textarea:focus {
          border-color: #C9A84C;
        }

        .dc-submit-btn {
          width: 100%;
          background: #C9A84C;
          color: #FFFFFF;
          border: none;
          padding: 16px;
          font-family: 'Montserrat', sans-serif;
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-weight: 600;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .dc-submit-btn:hover {
          background: #B8963B;
          letter-spacing: 3px;
          box-shadow: 0 4px 15px rgba(201, 168, 76, 0.2);
        }

        .dc-submit-btn:disabled {
          background: #E8E0D0;
          color: #9B8B6E;
          cursor: not-allowed;
          letter-spacing: 2px;
          box-shadow: none;
        }

        .dc-thanks {
          text-align: center;
          padding: 40px;
        }

        .dc-thanks-icon {
          color: #4A8C5C;
          margin-bottom: 20px;
          animation: scaleIn 0.5s ease-out;
        }

        .dc-thanks-title {
          font-size: 20px;
          font-weight: 300;
          color: #1A1A1A;
          margin-bottom: 12px;
        }

        .dc-thanks-text {
          font-size: 14px;
          color: #9B8B6E;
          line-height: 1.6;
          margin-bottom: 30px;
        }

        .dc-thanks-details {
          background: #FAFAF8;
          border: 1px solid #F0EBE3;
          border-radius: 4px;
          padding: 20px;
          text-align: left;
          margin-bottom: 30px;
          font-size: 13px;
          line-height: 1.6;
        }

        .dc-thanks-details h4 {
          margin: 0 0 10px 0;
          color: #C9A84C;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .dc-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #C9A84C;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.3s;
        }

        .dc-back-btn:hover {
          color: #B8963B;
          gap: 12px;
        }

        .spin {
          animation: spin-anim 1s linear infinite;
        }

        @keyframes spin-anim {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}} />

      <Navbar />

      <main className="dc-container">
        <div className="dc-card">
          <div className="dc-gold-bar"></div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', gap: '16px' }}>
              <Loader size={36} className="spin" style={{ color: '#C9A84C' }} />
              <div style={{ fontSize: '14px', color: '#9B8B6E' }}>Fetching order details...</div>
            </div>
          ) : !order ? (
            <div style={{ textAlign: 'center', padding: '60px 40px' }}>
              <XCircle size={48} style={{ color: '#B05050', marginBottom: '16px', display: 'inline-block' }} />
              <h3 className="dc-thanks-title">Order Not Found</h3>
              <p className="dc-thanks-text">{"We couldn't retrieve the details for this order. It may be invalid or expired."}</p>
              <Link href="/Pages/Products" className="dc-back-btn">Go to Shop <ArrowRight size={14} /></Link>
            </div>
          ) : !submitted ? (
            <>
              <div className="dc-header">
                <div className="dc-brand">ZULU JEWELS</div>
                <h1 className="dc-title">Delivery Confirmation</h1>
              </div>

              <div className="dc-body">
                <div className="dc-order-summary">
                  <div className="dc-summary-row">
                    <span>Order Reference:</span>
                    <span className="dc-summary-val">#{formattedOrderId}</span>
                  </div>
                  {order.shipping_partner && (
                    <div className="dc-summary-row">
                      <span>Delivered Via:</span>
                      <span className="dc-summary-val">{order.shipping_partner}</span>
                    </div>
                  )}
                  <div className="dc-summary-row">
                    <span>Destination:</span>
                    <span className="dc-summary-val" style={{ textAlign: 'right', maxWidth: '280px', wordBreak: 'break-all' }}>
                      {order.shipping_address}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <label className="dc-question-label">1. Have you received your order?</label>
                  <div className="dc-btn-group">
                    <button
                      type="button"
                      className={`dc-option-btn ${received === true ? 'selected-yes' : ''}`}
                      onClick={() => setReceived(true)}
                    >
                      <CheckCircle2 size={24} style={{ color: received === true ? '#4A8C5C' : '#E8E0D0' }} />
                      Yes, I got my order
                    </button>
                    <button
                      type="button"
                      className={`dc-option-btn ${received === false ? 'selected-no' : ''}`}
                      onClick={() => setReceived(false)}
                    >
                      <AlertCircle size={24} style={{ color: received === false ? '#B05050' : '#E8E0D0' }} />
                      No, not received
                    </button>
                  </div>

                  <label className="dc-question-label">2. Any remarks / delivery notes?</label>
                  <textarea
                    className="dc-textarea"
                    placeholder="e.g. Left with reception, box was intact, etc."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />

                  <label className="dc-question-label">3. Share your feedback / review</label>
                  <textarea
                    className="dc-textarea"
                    placeholder="Tell us about your experience with our jewelry and delivery service..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />

                  <button
                    type="submit"
                    className="dc-submit-btn"
                    disabled={received === null || submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="dc-thanks">
              <CheckCircle2 size={56} className="dc-thanks-icon" />
              <h3 className="dc-thanks-title">Thank You!</h3>
              <p className="dc-thanks-text">
                Your delivery confirmation and feedback have been successfully recorded.
              </p>

              <div className="dc-thanks-details">
                <h4>Submission Summary</h4>
                <div style={{ marginBottom: '6px' }}>
                  <strong>Received Order:</strong> {received ? 'Yes' : 'No'}
                </div>
                {remarks && (
                  <div style={{ marginBottom: '6px' }}>
                    <strong>Remarks:</strong> {remarks}
                  </div>
                )}
                {feedback && (
                  <div>
                    <strong>Feedback:</strong> {feedback}
                  </div>
                )}
              </div>

              <Link href="/Pages/Products" className="dc-back-btn">
                Continue Shopping <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
