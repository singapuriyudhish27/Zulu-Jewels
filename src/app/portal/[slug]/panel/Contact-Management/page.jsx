"use client";

import "./contact.css";
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
  Mail,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Send,
  User,
  Calendar,
  Filter,
  Eye,
  Reply,
  Trash2,
  Archive,
  Inbox,
  HelpCircle,
  ShoppingBag,
  Gem,
  Wrench,
  Building,
  Info,
  LogOut
} from "lucide-react";
import ConfirmModal from "@/components/common/ConfirmModal";

export default function ContactManagementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);


  const [inquiriesData, setInquiriesData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "danger"
  });

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const response = await fetch('/api/Pages/Admin/Contact-Management', {
          credentials: 'include',
        });
        const result = await response.json();
        console.log(result);
        if (result.success) {
          setInquiriesData(result.data || []);
          setAdminEmail(result.adminEmail || "");
        } else {
          console.error("Failed to fetch inquiries:", result.message);
        }
      } catch (error) {
        console.error("Error fetching inquiries:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries();
  }, []);

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Map API data to UI format
  const inquiries = inquiriesData.map(item => {
    let parsedMessage = {};
    let messageText = item.inquiry.message;

    try {
      // Check if it's a JSON string
      if (typeof item.inquiry.message === 'string' && (item.inquiry.message.trim().startsWith('{') || item.inquiry.message.trim().startsWith('['))) {
        parsedMessage = JSON.parse(item.inquiry.message);
        messageText = parsedMessage.message || messageText;
      }
    } catch (e) {
      // Not JSON or parse failed
    }

    const name = parsedMessage.name || `${item.firstName || ''} ${item.lastName || ''}`.trim() || "Guest User";
    const email = parsedMessage.email || item.email || "No Email";
    const phone = parsedMessage.phone || item.phone || "No Phone";

    // Map internal category keys from contact form to UI display names
    const categoryMapping = {
      'custom': 'Custom Order',
      'order': 'Order Query',
      'appointment': 'Service Request',
      'general': 'Product Query',
      'feedback': 'Return/Exchange',
      'other': 'Bulk Order'
    };

    const rawCategory = (item.inquiry.category || 'general').toLowerCase();
    const uiCategory = categoryMapping[rawCategory] || item.inquiry.category || 'Product Query';

    return {
      id: item.inquiry.id,
      userId: item.user_id,
      isVerified: !!item.is_verified,
      name,
      email,
      phone,
      subject: uiCategory, // Using mapped category as subject
      category: uiCategory,
      message: messageText,
      date: formatDate(item.inquiry.created_at),
      time: formatTime(item.inquiry.created_at),
      status: item.inquiry.status || "New",
      priority: "Medium" // Default priority as it's not in DB
    };
  });

  // Calculate general stats
  const totalInquiries = inquiries.length;
  const newInquiries = inquiries.filter(i => {
    const s = (i.status || "").toLowerCase();
    return s === "new" || s === "unread";
  }).length;
  const inProgressInquiries = inquiries.filter(i => (i.status || "").toLowerCase() === "in progress").length;

  // Category stats calculation based on mapped inquiries
  const categoryCounts = inquiries.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  const categoryStats = [
    { category: "Custom Order", count: categoryCounts["Custom Order"] || 0, icon: <Gem size={20} />, color: "#d4af37" },
    { category: "Order Query", count: categoryCounts["Order Query"] || 0, icon: <ShoppingBag size={20} />, color: "#3498db" },
    { category: "Return/Exchange", count: categoryCounts["Return/Exchange"] || 0, icon: <Archive size={20} />, color: "#e74c3c" },
    { category: "Product Query", count: categoryCounts["Product Query"] || 0, icon: <HelpCircle size={20} />, color: "#27ae60" },
    { category: "Service Request", count: categoryCounts["Service Request"] || 0, icon: <Wrench size={20} />, color: "#f39c12" },
    { category: "Bulk Order", count: categoryCounts["Bulk Order"] || 0, icon: <Building size={20} />, color: "#9b59b6" },
  ];

  const getStatusBadge = (status) => {
    const statusStyles = {
      "New": { bg: "rgba(231, 76, 60, 0.1)", color: "#e74c3c", icon: <AlertCircle size={14} /> },
      "Unread": { bg: "rgba(231, 76, 60, 0.1)", color: "#e74c3c", icon: <AlertCircle size={14} /> },
      "In Progress": { bg: "rgba(243, 156, 18, 0.1)", color: "#f39c12", icon: <Clock size={14} /> },
      "Replied": { bg: "rgba(52, 152, 219, 0.1)", color: "#3498db", icon: <Reply size={14} /> },
      "Resolved": { bg: "rgba(39, 174, 96, 0.1)", color: "#27ae60", icon: <CheckCircle2 size={14} /> },
    };
    const style = statusStyles[status] || statusStyles["New"];
    return { ...style };
  };

  const getPriorityBadge = (priority) => {
    const colors = { "High": "#e74c3c", "Medium": "#f39c12", "Low": "#27ae60" };
    return colors[priority] || colors["Low"];
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    if (activeTab === "new") return inquiry.status === "New" || inquiry.status === "Unread";
    if (activeTab === "inprogress") return inquiry.status === "In Progress";
    if (activeTab === "resolved") return inquiry.status === "Resolved" || inquiry.status === "Replied";
    return true;
  });

  // 🔹 Logout handler

  const handleUpdateStatus = async (id, status) => {
    setProcessingAction(true);
    try {
      const response = await fetch('/api/Pages/Admin/Contact-Management', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
        credentials: 'include',
      });
      const result = await response.json();
      if (result.success) {
        setInquiriesData(prev => prev.map(item =>
          item.inquiry.id === id ? { ...item, inquiry: { ...item.inquiry, status } } : item
        ));
        if (selectedInquiry?.id === id) {
          setSelectedInquiry(prev => ({ ...prev, status }));
        }
      } else {
        toast.error(result.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDeleteInquiry = async (id) => {
    setConfirmConfig({
      isOpen: true,
      title: "Archive Inquiry",
      message: "Are you sure you want to archive (delete) this inquiry? This will remove it from the list of active inquiries.",
      type: "danger",
      onConfirm: async () => {
        setProcessingAction(true);
        try {
          const response = await fetch(`/api/Pages/Admin/Contact-Management?id=${id}`, {
            method: 'DELETE',
            credentials: 'include',
          });
          const result = await response.json();
          if (result.success) {
            setInquiriesData(prev => prev.filter(item => item.inquiry.id !== id));
            if (selectedInquiry?.id === id) {
              setSelectedInquiry(null);
            }
            toast.success("Inquiry archived successfully");
          } else {
            toast.error(result.message || "Failed to delete inquiry");
          }
        } catch (error) {
          console.error("Error deleting inquiry:", error);
          toast.error("Something went wrong");
        } finally {
          setProcessingAction(false);
        }
      }
    });
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!selectedInquiry || !emailSubject || !emailMessage) {
      toast.error("Please fill in all fields.");
      return;
    }

    setSendingEmail(true);
    try {
      const response = await fetch('/api/Pages/Admin/Customer-Management/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedInquiry.email,
          subject: emailSubject,
          message: emailMessage,
        }),
        credentials: 'include',
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Email sent successfully!");
        handleUpdateStatus(selectedInquiry.id, "Replied");
        setIsEmailModalOpen(false);
        setEmailSubject("");
        setEmailMessage("");
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
          <h1 className="page-title">Contact & Inquiry Management</h1>
          <p className="page-subtitle">Manage customer inquiries, support requests, and communication</p>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-header"><div className="stat-card-icon gold"><Inbox size={24} /></div></div>
              <div className="stat-card-value">{totalInquiries}</div>
              <div className="stat-card-label">Total Inquiries</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header"><div className="stat-card-icon red"><AlertCircle size={24} /></div></div>
              <div className="stat-card-value">{newInquiries}</div>
              <div className="stat-card-label">New (Unread)</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header"><div className="stat-card-icon orange"><Clock size={24} /></div></div>
              <div className="stat-card-value">{inProgressInquiries}</div>
              <div className="stat-card-label">In Progress</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header"><div className="stat-card-icon green"><CheckCircle2 size={24} /></div></div>
              <div className="stat-card-value">2.4h</div>
              <div className="stat-card-label">Avg. Response Time</div>
            </div>
          </div>

          {/* Category Cards */}
          <div className="three-col-grid">
            {categoryStats.map((cat, index) => (
              <div className="category-card" key={index}>
                <div className="category-icon" style={{ background: `${cat.color}15`, color: cat.color }}>{cat.icon}</div>
                <div className="category-info">
                  <h4>{cat.count}</h4>
                  <span>{cat.category}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="tabs-container">
            <button className={`tab-btn ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}><Inbox size={18} /> All Inquiries</button>
            <button className={`tab-btn ${activeTab === "new" ? "active" : ""}`} onClick={() => setActiveTab("new")}><AlertCircle size={18} /> New <span className={`tab-count ${newInquiries > 0 ? "new" : ""}`}>{newInquiries}</span></button>
            <button className={`tab-btn ${activeTab === "inprogress" ? "active" : ""}`} onClick={() => setActiveTab("inprogress")}><Clock size={18} /> In Progress</button>
            <button className={`tab-btn ${activeTab === "resolved" ? "active" : ""}`} onClick={() => setActiveTab("resolved")}><CheckCircle2 size={18} /> Resolved</button>
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="two-col-grid">
            {/* Inquiry List */}
            <div className="content-card">
              <div className="content-card-header"><h3 className="content-card-title"><MessageSquare size={20} /> Inquiries</h3></div>
              <div className="inquiry-list">
                {loading ? (
                  <div className="loading-state" style={{ padding: '40px', textAlign: 'center', opacity: 0.6 }}>
                    <Clock className="spin-animation" size={32} style={{ marginBottom: '12px' }} />
                    <p>Fetching inquiries...</p>
                  </div>
                ) : filteredInquiries.length > 0 ? (
                  filteredInquiries.map((inquiry) => {
                    const statusStyle = getStatusBadge(inquiry.status);
                    return (
                      <div className={`inquiry-item ${selectedInquiry?.id === inquiry.id ? 'selected' : ''}`} key={inquiry.id} onClick={() => setSelectedInquiry(inquiry)}>
                        <div className="inquiry-header">
                          <div className="inquiry-customer">
                            <div className="inquiry-avatar">{inquiry.name.charAt(0)}</div>
                            <div>
                              <div className="inquiry-name" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {inquiry.name}
                                {inquiry.isVerified && <CheckCircle2 size={14} style={{ color: '#27ae60' }} />}
                              </div>
                              <div className="inquiry-email">{inquiry.email}</div>
                            </div>
                          </div>
                          <div className="inquiry-meta">
                            <div className="inquiry-date">{inquiry.date}</div>
                            <div className="inquiry-date">{inquiry.time}</div>
                          </div>
                        </div>
                        <div className="inquiry-subject">{inquiry.subject}</div>
                        <div className="inquiry-preview">{inquiry.message}</div>
                        <div className="inquiry-footer">
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span className="inquiry-category">{inquiry.category}</span>
                            <span className="priority-dot" style={{ background: getPriorityBadge(inquiry.priority) }}></span>
                          </div>
                          <span className="status-badge" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                            {statusStyle.icon} {inquiry.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-state" style={{ padding: '60px' }}>
                    <Inbox size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                    <h3>No inquiries found</h3>
                    <p>Try changing the filter or search term</p>
                  </div>
                )}
              </div>
            </div>

            {/* Detail Panel */}
            <div className="detail-panel">
              {selectedInquiry ? (
                <>
                  <div className="detail-header">
                    <div className="detail-subject" style={{ textAlign: 'center' }}>{selectedInquiry.subject}</div>
                    <div className="detail-meta" style={{ justifyContent: 'center' }}>
                      <span className="detail-meta-item"><Calendar size={14} /> {selectedInquiry.date} at {selectedInquiry.time}</span>
                    </div>
                  </div>
                  <div className="detail-body">
                    <div className="detail-section">
                      <div className="detail-section-title">Contact Information</div>
                      <div className="detail-contact">
                        <div className="detail-contact-item"><strong>Name</strong>{selectedInquiry.name}</div>
                        <div className="detail-contact-item"><strong>Email</strong>{selectedInquiry.email}</div>
                        <div className="detail-contact-item"><strong>Phone</strong>{selectedInquiry.phone}</div>
                        <div className="detail-contact-item"><strong>Category</strong>{selectedInquiry.category}</div>
                      </div>
                    </div>
                    <div className="detail-section">
                      <div className="detail-section-title">Message</div>
                      <div className="detail-message">{selectedInquiry.message}</div>
                    </div>
                  </div>
                  <div className="detail-actions">
                    <button
                      className="action-btn primary"
                      onClick={() => setIsEmailModalOpen(true)}
                    >
                      <Reply size={16} /> Reply
                    </button>
                    <button
                      className="action-btn secondary"
                      onClick={() => handleUpdateStatus(selectedInquiry.id, "Resolved")}
                      disabled={processingAction || selectedInquiry.status === "Resolved"}
                    >
                      <CheckCircle2 size={16} /> Mark as Read
                    </button>
                    <button
                      className="action-btn secondary"
                      onClick={() => handleDeleteInquiry(selectedInquiry.id)}
                      disabled={processingAction}
                    >
                      <Archive size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon"><Mail size={48} /></div>
                  <h3>Select an inquiry</h3>
                  <p>Click on an inquiry from the list to view details</p>
                </div>
              )}
            </div>
          </div>

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className="modal-overlay">
          <div className="email-modal">
            <div className="modal-header">
              <h3><Mail size={20} /> Compose Email</h3>
              <button className="close-btn" onClick={() => setIsEmailModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSendEmail} className="modal-body">
              <div className="form-group">
                <label>From</label>
                <input type="text" value={adminEmail} disabled />
              </div>
              <div className="form-group">
                <label>To</label>
                <input type="text" value={selectedInquiry?.email} disabled />
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
              <div className="form-group">
                <label>Message</label>
                <textarea
                  placeholder="Write your email here..."
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  required
                  rows={8}
                ></textarea>
              </div>
              <div className="modal-footer">
                <button type="button" className="action-btn secondary" onClick={() => setIsEmailModalOpen(false)}>Cancel</button>
                <button type="submit" className="action-btn primary" disabled={sendingEmail}>
                  {sendingEmail ? "Sending..." : "Send Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
      />
    </>
  );
}