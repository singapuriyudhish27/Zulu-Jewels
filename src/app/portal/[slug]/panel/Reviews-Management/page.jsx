"use client";

import "./reviews.css";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingCart,
  Users,
  Palette,
  Boxes,
  PhoneCall,
  Star,
  Megaphone,
  CreditCard,
  Truck,
  FileText,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  TrendingUp,
  Award,
  Filter,
  Eye,
  Reply,
  Flag,
  User,
  Calendar,
  Info
} from "lucide-react";

export default function ReviewsManagementPage() {
  const router = useRouter();
  const [reviewsData, setReviewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [filterRating, setFilterRating] = useState("all");
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [selectedReviewForReply, setSelectedReviewForReply] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/Pages/Admin/Reviews-Management', {
          credentials: 'include',
        });
        const result = await response.json();
        if (result.success) {
          setReviewsData(result.data || []);
          setAdminEmail(result.adminEmail || "");
        } else {
          console.error("Failed to fetch reviews:", result.message);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  // Flatten and map reviews data
  const reviews = reviewsData.flatMap(user =>
    (user.reviews || []).map(review => ({
      id: review.id,
      customer: `${user.firstName} ${user.lastName}`,
      email: user.email,
      product: review.product.name,
      productId: `PRD-${review.product.id.toString().padStart(3, '0')}`,
      rating: review.rating,
      title: review.comment.split(' ').slice(0, 5).join(' ') + (review.comment.split(' ').length > 5 ? '...' : ''),
      review: review.comment,
      date: new Date(review.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: "Published", // API doesn't return status yet, assuming published for now
      verified: user.is_verified,
      helpful: Math.floor(Math.random() * 20), // Simulated
      images: 0
    }))
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  // Dynamic dashboard stats
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
    : 0;
  const pendingCount = reviews.filter(r => r.status === "Pending").length;
  const growthThisMonth = "+10%"; // Could be calculated if we have dates

  // Dynamic Rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    return {
      stars,
      count,
      percentage: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
    };
  });

  // Dynamic Top reviewed products
  const productStats = {};
  reviews.forEach(r => {
    if (!productStats[r.product]) {
      productStats[r.product] = { name: r.product, reviews: 0, totalRating: 0 };
    }
    productStats[r.product].reviews += 1;
    productStats[r.product].totalRating += r.rating;
  });

  const topReviewedProducts = Object.values(productStats)
    .map(p => ({
      id: p.name,
      name: p.name,
      reviews: p.reviews,
      avgRating: (p.totalRating / p.reviews).toFixed(1)
    }))
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 5);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star key={`star-${i}`} size={14} fill={i < rating ? "#d4af37" : "none"} color={i < rating ? "#d4af37" : "#d9d9d9"} />
    ));
  };

  const filteredReviews = reviews.filter(review => {
    if (activeTab === "pending") return review.status === "Pending";
    if (activeTab === "flagged") return review.status === "Flagged";
    if (activeTab === "published") return review.status === "Published";
    if (filterRating !== "all") return review.rating === parseInt(filterRating);
    return true;
  });

  // 🔹 Logout handler

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!selectedReviewForReply || !emailSubject || !emailMessage) {
      toast.error("Please fill in all fields.");
      return;
    }

    setSendingEmail(true);
    try {
      const response = await fetch('/api/Pages/Admin/Customer-Management/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedReviewForReply.email,
          subject: emailSubject,
          message: emailMessage,
        }),
        credentials: 'include',
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Email sent successfully!");
        setIsEmailModalOpen(false);
        setEmailSubject("");
        setEmailMessage("");
        setSelectedReviewForReply(null);
      } else {
        toast.error(result.message || "Failed to send email.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("An error occurred while sending the email.");
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <>
          <h1 className="page-title">Reviews & Ratings Management</h1>
          <p className="page-subtitle">Monitor, moderate, and respond to customer reviews</p>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-header"><div className="stat-card-icon gold"><Star size={24} /></div></div>
              <div className="stat-card-value">{totalReviews}</div>
              <div className="stat-card-label">Total Reviews</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header"><div className="stat-card-icon green"><Award size={24} /></div></div>
              <div className="stat-card-value">{avgRating}</div>
              <div className="stat-card-label">Average Rating</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header"><div className="stat-card-icon orange"><Clock size={24} /></div></div>
              <div className="stat-card-value">{pendingCount}</div>
              <div className="stat-card-label">Pending Review</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header"><div className="stat-card-icon blue"><TrendingUp size={24} /></div></div>
              <div className="stat-card-value">{growthThisMonth}</div>
              <div className="stat-card-label">This Month</div>
            </div>
          </div>

          <div className="two-col-grid">
            {/* Reviews List */}
            <div>
              {/* Tabs */}
              <div className="tabs-container">
                <button className={`tab-btn ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}><MessageSquare size={18} /> All Reviews <span className="tab-count">{totalReviews}</span></button>
                <button className={`tab-btn ${activeTab === "pending" ? "active" : ""}`} onClick={() => setActiveTab("pending")}><Clock size={18} /> Pending <span className="tab-count">{pendingCount}</span></button>
                <button className={`tab-btn ${activeTab === "flagged" ? "active" : ""}`} onClick={() => setActiveTab("flagged")}><Flag size={18} /> Flagged <span className="tab-count">0</span></button>
              </div>

              {/* Filter Bar */}
              <div className="filter-bar">
                <Filter size={18} color="#4a4a4a" />
                <select className="filter-select" value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>

              <div className="content-card">
                <div className="content-card-body">
                  {loading ? (
                    <div style={{ textAlign: "center", padding: "40px", opacity: 0.6 }}>
                      <Clock className="spin-animation" size={24} style={{ marginBottom: "12px", display: "inline-block" }} />
                      <p>Fetching reviews data...</p>
                    </div>
                  ) : filteredReviews.length > 0 ? (
                    filteredReviews.map((review, index) => (
                      <div className="review-card" key={`review-${review.id}-${index}`}>
                        <div className="review-header">
                          <div className="review-customer">
                            <div className="review-avatar">{review.customer.charAt(0)}</div>
                            <div className="review-customer-info">
                              <h4>{review.customer} {review.verified && <span className="verified-badge">✓ Verified</span>}</h4>
                              <span>{review.email}</span>
                            </div>
                          </div>
                          <div className="review-meta">
                            <div className="review-stars">{renderStars(review.rating)}</div>
                            <div className="review-date">{review.date}</div>
                          </div>
                        </div>
                        <div className="review-product">Product: <strong>{review.product}</strong> ({review.productId})</div>
                        <h3 className="review-title">{review.title}</h3>
                        <p className="review-text">{review.review}</p>
                        <div className="review-footer">
                          <div className="review-stats">
                            <span className="review-stat"><ThumbsUp size={14} /> {review.helpful} helpful</span>
                            {review.images > 0 && <span className="review-stat">📷 {review.images} photos</span>}
                            <span className={`status-badge ${review.status.toLowerCase()}`}>
                              {review.status === "Published" ? <CheckCircle2 size={14} /> : review.status === "Pending" ? <Clock size={14} /> : <Flag size={14} />}
                              {review.status}
                            </span>
                          </div>
                          <div className="review-actions">
                            {review.status === "Pending" && (
                              <>
                                <button className="review-action-btn approve"><CheckCircle2 size={14} /> Approve</button>
                                <button className="review-action-btn reject"><XCircle size={14} /> Reject</button>
                              </>
                            )}
                            <button
                              className="review-action-btn reply"
                              onClick={() => {
                                setSelectedReviewForReply(review);
                                setIsEmailModalOpen(true);
                                setEmailSubject(`Reply to your review for ${review.product}`);
                              }}
                            >
                              <Reply size={14} /> Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: "center", padding: "40px", opacity: 0.4 }}>
                      <MessageSquare size={32} style={{ marginBottom: "12px" }} />
                      <p>No reviews found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div>
              {/* Rating Distribution */}
              <div className="content-card">
                <div className="content-card-header"><h3 className="content-card-title"><Star size={20} /> Rating Distribution</h3></div>
                <div className="content-card-body" style={{ padding: "20px 24px" }}>
                  {ratingDistribution.map((item) => (
                    <div className="rating-bar-container" key={`distrib-${item.stars}`}>
                      <div className="rating-bar-header">
                        <div className="rating-bar-stars">{item.stars} <Star size={12} fill="#d4af37" color="#d4af37" /></div>
                        <span>{item.count} ({item.percentage}%)</span>
                      </div>
                      <div className="rating-bar"><div className="rating-bar-fill" style={{ width: `${item.percentage}%` }}></div></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Reviewed Products */}
              <div className="content-card">
                <div className="content-card-header"><h3 className="content-card-title"><Award size={20} /> Top Reviewed Products</h3></div>
                <div className="content-card-body" style={{ padding: "16px 24px" }}>
                  {topReviewedProducts.map((product, index) => (
                    <div className="top-product-item" key={`top-prd-${product.id}`}>
                      <div className="top-product-rank">{index + 1}</div>
                      <div className="top-product-info">
                        <div className="top-product-name">{product.name}</div>
                        <div className="top-product-stats">
                          <span>{product.reviews} reviews</span>
                          <span>★ {product.avgRating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Info */}
              <div className="content-card">
                <div className="content-card-header"><h3 className="content-card-title"><Info size={20} /> Review Guidelines</h3></div>
                <div className="content-card-body" style={{ padding: "20px 24px", fontSize: "14px", color: "var(--charcoal-light)", lineHeight: "1.6" }}>
                  <p style={{ marginBottom: "12px" }}><strong>Auto-approve:</strong> Reviews from verified purchasers with 4+ stars are auto-approved.</p>
                  <p style={{ marginBottom: "12px" }}><strong>Flagged reviews:</strong> Reviews with inappropriate content are automatically flagged for manual review.</p>
                  <p><strong>Response time:</strong> Aim to respond to negative reviews within 24 hours to maintain customer trust.</p>
                </div>
              </div>
            </div>
          </div>

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className="modal-overlay">
          <div className="email-modal">
            <div className="modal-header">
              <h3><Star size={20} /> Reply to Review</h3>
              <button className="close-btn" onClick={() => setIsEmailModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSendEmail} className="modal-body">
              <div className="form-group">
                <label>From</label>
                <input type="text" value={adminEmail} disabled />
              </div>
              <div className="form-group">
                <label>To</label>
                <input type="text" value={selectedReviewForReply?.email} disabled />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  placeholder="Enter subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Customer Review</label>
                <div style={{
                  padding: '10px',
                  background: '#f5f5f5',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#666',
                  fontStyle: 'italic',
                  borderLeft: '3px solid var(--gold)'
                }}>
                  "{selectedReviewForReply?.review}"
                </div>
              </div>
              <div className="form-group">
                <label>Your Response</label>
                <textarea
                  placeholder="Write your response here..."
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  required
                  rows={6}
                ></textarea>
              </div>
              <div className="modal-footer">
                <button type="button" className="action-btn secondary" onClick={() => setIsEmailModalOpen(false)}>Cancel</button>
                <button type="submit" className="action-btn primary" disabled={sendingEmail} style={{
                  background: 'var(--gold)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}>
                  {sendingEmail ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}