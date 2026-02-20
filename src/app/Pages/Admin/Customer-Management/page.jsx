"use client";

import "./customer.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  PhoneCall,
  Star,
  Megaphone,
  Truck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  IndianRupee,
  Crown,
  TrendingUp,
  UserPlus,
  Eye,
  Edit,
  MoreVertical,
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Gift
} from "lucide-react";

export default function CustomerManagementPage() {
  const router = useRouter();
  const [customersData, setCustomersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTier, setFilterTier] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showOrdersDropdown, setShowOrdersDropdown] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/Pages/Admin/Customer-Management', {
          credentials: 'include',
        });
        const result = await response.json();
        if (result.success) {
          setCustomersData(result.data || []);
          setAdminEmail(result.adminEmail || "");
        } else {
          console.error("Failed to fetch customers:", result.message);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Mapping logic based on API data
  const customers = customersData.map(item => {
    // Calculate total spent for this customer
    const totalSpentValue = item.orders.reduce((acc, order) => {
      const orderTotal = order.items.reduce((itemAcc, orderItem) => {
        return itemAcc + (Number(orderItem.price) * orderItem.quantity);
      }, 0);
      return acc + orderTotal;
    }, 0);

    // Dynamic Tier Calculation
    let tier = "Bronze";
    if (totalSpentValue > 500000) tier = "VIP";
    else if (totalSpentValue > 200000) tier = "Gold";
    else if (totalSpentValue > 50000) tier = "Silver";

    const lastOrderDate = item.orders.length > 0 ? formatDate(item.orders[0].order_date) : "No orders";

    return {
      id: item.id,
      name: item.customer_name || (item.user ? `${item.user.firstName} ${item.user.lastName}` : "Unnamed"),
      email: item.user?.email || "N/A",
      phone: item.user?.phone || "N/A",
      city: item.location || "N/A",
      joinDate: formatDate(item.created_at),
      orders: item.orders.length,
      totalSpent: formatCurrency(totalSpentValue),
      totalSpentRaw: totalSpentValue,
      lastOrder: lastOrderDate,
      tier: tier,
      status: item.user?.is_active ? "Active" : "Inactive",
      rawOrders: item.orders,
      isVerified: !!item.user?.is_verified
    };
  });

  // Calculate stats
  const totalCustomersCount = customers.length;
  const newThisMonthCount = customers.filter(c => {
    const rawCustomer = customersData.find(cd => cd.id === c.id);
    if (!rawCustomer) return false;
    const joinDate = new Date(rawCustomer.created_at);
    const now = new Date();
    return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
  }).length;
  const vipCustomersCount = customers.filter(c => c.tier === "VIP").length;
  const totalLifetimeValue = customers.reduce((acc, c) => acc + c.totalSpentRaw, 0);

  // Stats number formatting helper
  const formatLargeStats = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    return formatCurrency(amount);
  };


  // Customers data
  // No longer needed, calculated from customersData

  const getTierBadge = (tier) => {
    const styles = {
      "VIP": { bg: "linear-gradient(135deg, #d4af37, #f4e4c1)", color: "#2c2c2c", icon: <Crown size={12} /> },
      "Gold": { bg: "linear-gradient(135deg, #f4e4c1, #d4af37)", color: "#2c2c2c", icon: <Award size={12} /> },
      "Silver": { bg: "linear-gradient(135deg, #c0c0c0, #e8e8e8)", color: "#2c2c2c", icon: <Star size={12} /> },
      "Bronze": { bg: "linear-gradient(135deg, #cd7f32, #e8b87d)", color: "#fff", icon: <Gift size={12} /> },
    };
    return styles[tier] || styles["Bronze"];
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === "all" || customer.tier === filterTier;
    return matchesSearch && matchesTier;
  });

  // 🔹 Logout handler

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!selectedCustomer || !emailSubject || !emailMessage) {
      toast.error("Please fill in all fields.");
      return;
    }

    setSendingEmail(true);
    try {
      const response = await fetch('/api/Pages/Admin/Customer-Management/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedCustomer.email,
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
          <h1 className="page-title">Customer Management</h1>
          <p className="page-subtitle">View and manage your customer base, track orders and engagement</p>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-header"><div className="stat-card-icon gold"><Users size={24} /></div></div>
              <div className="stat-card-value">{totalCustomersCount.toLocaleString()}</div>
              <div className="stat-card-label">Total Customers</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header"><div className="stat-card-icon green"><UserPlus size={24} /></div></div>
              <div className="stat-card-value">{newThisMonthCount}</div>
              <div className="stat-card-label">New This Month</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header"><div className="stat-card-icon orange"><Crown size={24} /></div></div>
              <div className="stat-card-value">{vipCustomersCount}</div>
              <div className="stat-card-label">VIP Customers</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header"><div className="stat-card-icon blue"><IndianRupee size={24} /></div></div>
              <div className="stat-card-value">{formatLargeStats(totalLifetimeValue)}</div>
              <div className="stat-card-label">Lifetime Value</div>
            </div>
          </div>

          <div className="two-col-grid">
            {/* Customer Table */}
            <div className="content-card">
              <div className="content-card-header"><h3 className="content-card-title"><Users size={20} /> All Customers</h3></div>
              <div className="toolbar">
                <div className="search-box">
                  <Search size={18} color="#4a4a4a" />
                  <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <select className="filter-select" value={filterTier} onChange={(e) => setFilterTier(e.target.value)}>
                  <option value="all">All Tiers</option>
                  <option value="VIP">VIP</option>
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Bronze">Bronze</option>
                </select>
                <button className="export-btn"><Download size={16} /> Export</button>
              </div>
              <div className="content-card-body">
                <table className="data-table">
                  <thead>
                    <tr><th>Customer</th><th>Location</th><th>Orders</th><th>Total Spent</th><th>Tier</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center", padding: "50px", opacity: 0.6 }}>
                          <Clock className="spin-animation" size={24} style={{ marginBottom: "12px", display: "inline-block" }} />
                          <p>Fetching customer records...</p>
                        </td>
                      </tr>
                    ) : filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => {
                        const tierStyle = getTierBadge(customer.tier);
                        return (
                          <tr key={customer.id} className={selectedCustomer?.id === customer.id ? 'selected' : ''} onClick={() => {
                            setSelectedCustomer(customer);
                            setShowOrdersDropdown(false);
                          }}>
                            <td>
                              <div className="customer-cell">
                                <div className="customer-avatar">{customer.name.charAt(0)}</div>
                                <div className="customer-info">
                                  <h4 style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    {customer.name}
                                    {customer.isVerified && <CheckCircle2 size={14} style={{ color: "#27ae60" }} />}
                                  </h4>
                                  <span>{customer.email}</span>
                                </div>
                              </div>
                            </td>
                            <td>{customer.city}</td>
                            <td>{customer.orders}</td>
                            <td><strong>{customer.totalSpent}</strong></td>
                            <td><span className="tier-badge" style={{ background: tierStyle.bg, color: tierStyle.color }}>{tierStyle.icon} {customer.tier}</span></td>
                            <td><span className={`status-dot ${customer.status.toLowerCase()}`}></span>{customer.status}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center", padding: "50px", opacity: 0.6 }}>
                          <Users size={32} style={{ marginBottom: "12px", opacity: 0.2 }} />
                          <p>No customers found matching your criteria</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Customer Detail Panel */}
            <div className="detail-panel">
              {selectedCustomer ? (
                <>
                  <div className="detail-header">
                    <div className="detail-avatar">{selectedCustomer.name.charAt(0)}</div>
                    <div className="detail-name">{selectedCustomer.name}</div>
                    <div className="detail-email">{selectedCustomer.email}</div>
                    <span className="tier-badge" style={{ background: getTierBadge(selectedCustomer.tier).bg, color: getTierBadge(selectedCustomer.tier).color }}>
                      {getTierBadge(selectedCustomer.tier).icon} {selectedCustomer.tier} Customer
                    </span>
                  </div>
                  <div className="detail-body">
                    <div className="detail-section">
                      <div className="detail-section-title">Customer Stats</div>
                      <div className="detail-stats">
                        <div className="detail-stat"><div className="detail-stat-value">{selectedCustomer.orders}</div><div className="detail-stat-label">Total Orders</div></div>
                        <div className="detail-stat"><div className="detail-stat-value">{selectedCustomer.totalSpent}</div><div className="detail-stat-label">Total Spent</div></div>
                      </div>
                    </div>
                    <div className="detail-section">
                      <div className="detail-section-title">Contact Information</div>
                      <div className="detail-row"><span><Phone size={14} /> Phone</span><span>{selectedCustomer.phone}</span></div>
                      <div className="detail-row"><span><MapPin size={14} /> City</span><span>{selectedCustomer.city}</span></div>
                      <div className="detail-row"><span><Calendar size={14} /> Member Since</span><span>{selectedCustomer.joinDate}</span></div>
                      <div className="detail-row"><span><ShoppingBag size={14} /> Last Order</span><span>{selectedCustomer.lastOrder}</span></div>
                    </div>
                    <div className="detail-section">
                      <div className="detail-section-title">Order History Overview</div>
                      <div style={{ fontSize: "13px", color: "var(--charcoal-light)", marginBottom: "12px" }}>
                        This customer has {selectedCustomer.orders} total orders. Click "View Orders" below to see the full list.
                      </div>
                    </div>
                  </div>
                  <div className="action-btns">
                    <button
                      className="action-btn primary"
                      onClick={() => {
                        if (selectedCustomer.email === "N/A") {
                          toast.error("Customer does not have a valid email address.");
                        } else {
                          setIsEmailModalOpen(true);
                        }
                      }}
                    >
                      <Mail size={14} /> Send Email
                    </button>
                    <button 
                      className="action-btn secondary"
                      onClick={() => setShowOrdersDropdown(!showOrdersDropdown)}
                    >
                      {showOrdersDropdown ? <XCircle size={14} /> : <Eye size={14} />} {showOrdersDropdown ? "Close Orders" : "View Orders"}
                    </button>
                  </div>

                  {/* Orders Dropdown */}
                  {showOrdersDropdown && selectedCustomer.rawOrders.length > 0 && (
                    <div className="orders-dropdown">
                      <div className="dropdown-header">Customer Orders</div>
                      <div className="dropdown-list">
                        {selectedCustomer.rawOrders.map((order) => {
                          const orderTotal = order.items.reduce((acc, itm) => acc + (Number(itm.price) * itm.quantity), 0);
                          return (
                            <div key={order.id} className="dropdown-item">
                              <div className="dropdown-item-info">
                                <div className="dropdown-item-id">ORD-{order.id}</div>
                                <div className="dropdown-item-meta">
                                  {formatDate(order.order_date)} • {order.items.length} items • {formatCurrency(orderTotal)}
                                </div>
                              </div>
                              <button 
                                className="dropdown-view-btn"
                                title="Go to Order Details"
                                onClick={() => router.push(`/Pages/Admin/Order-Management`)}
                              >
                                <ShoppingCart size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {showOrdersDropdown && selectedCustomer.rawOrders.length === 0 && (
                    <div className="orders-dropdown">
                      <div style={{ padding: "20px", textAlign: "center", fontStyle: "italic", color: "#888", fontSize: "14px" }}>
                        No orders found for this customer.
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <Users size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                  <h3>Select a customer</h3>
                  <p>Click on a customer to view details</p>
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
                <input type="text" value={selectedCustomer?.email} disabled />
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
    </>
  );
}