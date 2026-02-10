"use client";

import "./orders.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  PhoneCall,
  Star,
  Megaphone,
  Truck,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  IndianRupee,
  Calendar,
  MapPin,
  CreditCard,
  Palette,
  CircleDot,
  Watch,
  Gem,
  User,
  Heart
} from "lucide-react";

export default function OrderManagementPage() {
  const router = useRouter();
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusToUpdate, setStatusToUpdate] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/Pages/Admin/Order-Management', {
          credentials: 'include',
        });
        const result = await response.json();
        if (result.success) {
          setOrdersData(result.data.recent_orders || []);
        } else {
          console.error("Failed to fetch orders:", result.message);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    if (selectedOrder) {
      setStatusToUpdate(selectedOrder.status);
    }
  }, [selectedOrder]);

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
  const orders = ordersData.map(item => {
    const orderDate = new Date(item.order_date);
    const year = orderDate.getFullYear();
    const displayId = `ORD-${year}-${item.order_id}`;

    const mappedItems = item.items.map(orderItem => ({
      name: orderItem.product_name,
      category: orderItem.category?.name || "Other",
      qty: orderItem.quantity,
      price: formatCurrency(orderItem.item_price)
    }));

    const totalSpentValue = item.items.reduce((acc, orderItem) => {
      return acc + (Number(orderItem.item_price) * orderItem.quantity);
    }, 0);

    // Infer gender since it's not in DB
    let gender = "Unisex";
    const itemNameLower = item.items.map(i => i.product_name.toLowerCase()).join(" ");
    if (itemNameLower.includes("women") || itemNameLower.includes("lady") || itemNameLower.includes("bride")) gender = "Women";
    else if (itemNameLower.includes("men") || itemNameLower.includes("gent")) gender = "Men";

    const isCustom = item.items.some(i => i.product_name.toLowerCase().includes("custom")) || item.order_status === "Custom";

    return {
      id: displayId,
      rawId: item.order_id,
      customer: item.customer?.customer_name || `${item.user?.firstName || ''} ${item.user?.lastName || ''}`.trim() || "Guest",
      email: item.user?.email || "N/A",
      phone: item.user?.phone || "N/A",
      date: formatDate(item.order_date),
      created_at: item.order_date,
      items: mappedItems,
      total: formatCurrency(totalSpentValue),
      totalRaw: totalSpentValue,
      gender: gender,
      status: item.order_status || "Pending",
      payment: item.payment_method || "Other",
      address: item.shipping_address || "N/A",
      isCustom: isCustom
    };
  });

  // Calculate general stats
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === "Pending").length;
  const customOrdersCount = orders.filter(o => o.isCustom).length;

  const revenueThisMonth = orders.reduce((acc, order) => {
    const orderDate = new Date(order.created_at);
    const now = new Date();
    if (orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()) {
      return acc + order.totalRaw;
    }
    return acc;
  }, 0);

  // Stats number formatting helper
  const formatLargeStats = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    return formatCurrency(amount);
  };

  // Dynamic Category Stats
  const categoryMap = orders.reduce((acc, order) => {
    order.items.forEach(item => {
      if (!acc[item.category]) {
        acc[item.category] = { count: 0, revenue: 0 };
      }
      acc[item.category].count += 1;
      acc[item.category].revenue += order.totalRaw / order.items.length; // Approximate revenue per item
    });
    return acc;
  }, {});

  const categoryIcons = {
    "Ring": <CircleDot size={18} />,
    "Bracelet": <Heart size={18} />,
    "Necklace": <Gem size={18} />,
    "Earrings": <Star size={18} />,
    "Watch": <Watch size={18} />,
    "Chain": <Package size={18} />,
    "Accessories": <Package size={18} />,
  };

  const categoryStats = Object.keys(categoryMap).map(catName => ({
    name: catName,
    count: categoryMap[catName].count,
    icon: categoryIcons[catName] || <Package size={18} />,
    revenue: formatLargeStats(categoryMap[catName].revenue)
  })).sort((a, b) => b.count - a.count).slice(0, 12);

  const handleProfile = () => {
    router.push("/Pages/Admin/Profile");
  };

  // Orders data with gender and category
  // Calculated dynamically from ordersData

  const getStatusStyle = (status) => {
    const styles = {
      "Pending": { bg: "rgba(243, 156, 18, 0.1)", color: "#f39c12", icon: <Clock size={14} /> },
      "Processing": { bg: "rgba(52, 152, 219, 0.1)", color: "#3498db", icon: <AlertCircle size={14} /> },
      "Shipped": { bg: "rgba(155, 89, 182, 0.1)", color: "#9b59b6", icon: <Truck size={14} /> },
      "Delivered": { bg: "rgba(39, 174, 96, 0.1)", color: "#27ae60", icon: <CheckCircle2 size={14} /> },
      "Cancelled": { bg: "rgba(231, 76, 60, 0.1)", color: "#e74c3c", icon: <XCircle size={14} /> },
    };
    return styles[status] || styles["Pending"];
  };

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === "all" ||
      (activeTab === "pending" && order.status === "Pending") ||
      (activeTab === "processing" && order.status === "Processing") ||
      (activeTab === "shipped" && order.status === "Shipped") ||
      (activeTab === "delivered" && order.status === "Delivered") ||
      (activeTab === "custom" && order.isCustom);
    const matchesCategory = filterCategory === "all" || order.items.some(item => item.category === filterCategory);
    const matchesGender = filterGender === "all" || order.gender === filterGender;
    return matchesTab && matchesCategory && matchesGender;
  });

  // 🔹 Logout handler
  const handleLogout = async () => {
    if (!confirm('Are you sure you want to logout?')) return;

    try {
      const res = await fetch('/api/Pages/Profile', {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        router.replace('/auth/login');
      } else {
        alert('Logout failed. Please try again.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Something went wrong while logging out.');
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !statusToUpdate) return;
    if (statusToUpdate === selectedOrder.status) {
      alert("Please select a different status to update.");
      return;
    }

    setUpdatingStatus(true);
    try {
      const res = await fetch("/api/Pages/Admin/Order-Management", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: selectedOrder.rawId,
          status: statusToUpdate
        }),
        credentials: "include",
      });

      const result = await res.json();
      if (result.success) {
        // Update local orders Data
        setOrdersData(prev => prev.map(o =>
          o.order_id === selectedOrder.rawId ? { ...o, order_status: statusToUpdate } : o
        ));

        // Update selected order view
        setSelectedOrder(prev => ({ ...prev, status: statusToUpdate }));

        alert("Order status updated successfully!");
      } else {
        alert(result.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Order status update error:", error);
      alert("Something went wrong while updating status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-logo">
          <Image
            src="/logo_admin.png"
            alt="Website Logo"
            className="admin-logo-image"
            width={80}
            height={80}
            priority
          /><span>ZULU JEWELS</span><br />Admin Panel</div>
        <div className="admin-menu">
          <div className="admin-menu-item" onClick={() => router.push("/Pages/Admin")}><LayoutDashboard size={18} /> Dashboard</div>
          <div className="admin-menu-item" onClick={() => router.push("/Pages/Admin/Product-Management")}><Package size={18} /> Product Management</div>
          <div className="admin-menu-item active" onClick={() => router.push("/Pages/Admin/Order-Management")}><ShoppingCart size={18} /> Orders</div>
          <div className="admin-menu-item" onClick={() => router.push("/Pages/Admin/Customer-Management")}><Users size={18} /> Customers</div>
          <div className="admin-menu-item" onClick={() => router.push("/Pages/Admin/Contact-Management")}><PhoneCall size={18} /> Contact & Inquiry</div>
          <div className="admin-menu-item" onClick={() => router.push("/Pages/Admin/Reviews-Management")}><Star size={18} /> Reviews & Ratings</div>
          <div className="admin-menu-item" onClick={() => router.push("/Pages/Admin/Marketing")}><Megaphone size={18} /> Marketing</div>
          <div className="admin-menu-item" onClick={() => router.push("/Pages/Admin/Shipping-Management")}><Truck size={18} /> Shipping & Payment</div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Main */}
      <div className="admin-main">
        <div className="admin-header">
          <input className="admin-search" placeholder="Search orders by ID, customer..." />
          <div className="admin-user">
            <div className="admin-avatar" onClick={handleProfile}>ZJ</div>
          </div>
        </div>

        <div className="admin-content">
          <h1 className="page-title">Order Management</h1>
          <p className="page-subtitle">Track and manage all orders - Men, Women, Categories & Custom Orders</p>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-header"><div className="stat-card-icon gold"><ShoppingCart size={24} /></div></div>
              <div className="stat-card-value">{totalOrdersCount.toLocaleString()}</div>
              <div className="stat-card-label">Total Orders</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header"><div className="stat-card-icon orange"><Clock size={24} /></div></div>
              <div className="stat-card-value">{pendingOrdersCount}</div>
              <div className="stat-card-label">Pending Orders</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header"><div className="stat-card-icon purple"><Palette size={24} /></div></div>
              <div className="stat-card-value">{customOrdersCount}</div>
              <div className="stat-card-label">Custom Orders</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header"><div className="stat-card-icon green"><IndianRupee size={24} /></div></div>
              <div className="stat-card-value">{formatLargeStats(revenueThisMonth)}</div>
              <div className="stat-card-label">Revenue (This Month)</div>
            </div>
          </div>

          {/* Category Cards */}
          <div className="category-grid">
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div className="category-card" key={i} style={{ opacity: 0.5 }}>
                  <div className="category-icon"><Clock size={18} className="spin-animation" /></div>
                  <div className="category-name">Loading...</div>
                  <div className="category-count">Fetching data</div>
                </div>
              ))
            ) : categoryStats.map((cat, index) => (
              <div className={`category-card ${filterCategory === cat.name ? 'active' : ''}`} key={index} onClick={() => setFilterCategory(filterCategory === cat.name ? 'all' : cat.name)}>
                <div className="category-icon">{cat.icon}</div>
                <div className="category-name">{cat.name}</div>
                <div className="category-count">{cat.count} orders • {cat.revenue}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="tabs-container">
            <button className={`tab-btn ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}><ShoppingCart size={16} /> All Orders</button>
            <button className={`tab-btn ${activeTab === "pending" ? "active" : ""}`} onClick={() => setActiveTab("pending")}><Clock size={16} /> Pending <span className="tab-count">{pendingOrdersCount}</span></button>
            <button className={`tab-btn ${activeTab === "processing" ? "active" : ""}`} onClick={() => setActiveTab("processing")}><AlertCircle size={16} /> Processing</button>
            <button className={`tab-btn ${activeTab === "shipped" ? "active" : ""}`} onClick={() => setActiveTab("shipped")}><Truck size={16} /> Shipped</button>
            <button className={`tab-btn ${activeTab === "delivered" ? "active" : ""}`} onClick={() => setActiveTab("delivered")}><CheckCircle2 size={16} /> Delivered</button>
            <button className={`tab-btn ${activeTab === "custom" ? "active" : ""}`} onClick={() => setActiveTab("custom")}><Palette size={16} /> Custom Orders <span className="tab-count">{customOrdersCount}</span></button>
          </div>

          <div className="two-col-grid">
            {/* Orders Table */}
            <div className="content-card">
              <div className="toolbar">
                <Filter size={18} color="#4a4a4a" />
                <select className="filter-select" value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
                  <option value="all">All Genders</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Unisex">Unisex</option>
                </select>
                <select className="filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                  <option value="all">All Categories</option>
                  <option value="Ring">Rings</option>
                  <option value="Bracelet">Bracelets</option>
                  <option value="Necklace">Necklaces</option>
                  <option value="Earrings">Earrings</option>
                  <option value="Watch">Watches</option>
                  <option value="Chain">Chains</option>
                  <option value="Accessories">Accessories</option>
                </select>
                <button className="export-btn"><Download size={16} /> Export</button>
              </div>
              <table className="data-table">
                <thead>
                  <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Gender</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "50px", opacity: 0.6 }}>
                        <Clock className="spin-animation" size={24} style={{ marginBottom: "12px", display: "inline-block" }} />
                        <p>Fetching orders...</p>
                      </td>
                    </tr>
                  ) : filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                      const statusStyle = getStatusStyle(order.status);
                      return (
                        <tr key={order.id} className={selectedOrder?.id === order.id ? 'selected' : ''} onClick={() => setSelectedOrder(order)}>
                          <td><span className="order-id">{order.id}</span>{order.isCustom && <span className="custom-badge">CUSTOM</span>}</td>
                          <td>{order.customer}</td>
                          <td>{order.items.map(i => i.category).join(", ")}</td>
                          <td><strong>{order.total}</strong></td>
                          <td><span className={`gender-badge ${order.gender.toLowerCase()}`}>{order.gender}</span></td>
                          <td><span className="status-badge" style={{ background: statusStyle.bg, color: statusStyle.color }}>{statusStyle.icon} {order.status}</span></td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "50px", opacity: 0.6 }}>
                        <ShoppingCart size={32} style={{ marginBottom: "12px", opacity: 0.2 }} />
                        <p>No orders found matching criteria</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Order Detail Panel */}
            <div className="detail-panel">
              {selectedOrder ? (
                <>
                  <div className="detail-header">
                    <div className="detail-order-id">{selectedOrder.id}{selectedOrder.isCustom && <span className="custom-badge">CUSTOM ORDER</span>}</div>
                    <div className="detail-customer">{selectedOrder.customer}</div>
                    <div className="detail-date">{selectedOrder.date}</div>
                  </div>
                  <div className="detail-body">
                    <div className="detail-section">
                      <div className="detail-section-title">Order Items</div>
                      {selectedOrder.items.map((item, idx) => (
                        <div className="order-item" key={idx}>
                          <div><div className="order-item-name">{item.name}</div><div className="order-item-cat">{item.category} • Qty: {item.qty}</div></div>
                          <div className="order-item-price">{item.price}</div>
                        </div>
                      ))}
                      <div className="detail-total"><span>Total Amount</span><span>{selectedOrder.total}</span></div>
                    </div>
                    <div className="detail-section">
                      <div className="detail-section-title">Order Details</div>
                      <div className="detail-row"><span><User size={14} /> Customer</span><span>{selectedOrder.customer}</span></div>
                      <div className="detail-row"><span><Calendar size={14} /> Date</span><span>{selectedOrder.date}</span></div>
                      <div className="detail-row"><span><CreditCard size={14} /> Payment</span><span>{selectedOrder.payment}</span></div>
                      <div className="detail-row"><span><MapPin size={14} /> Shipping</span><span>{selectedOrder.address}</span></div>
                    </div>
                  </div>
                  <div className="action-btns" style={{ flexDirection: 'column', gap: '10px' }}>
                    <select
                      className="filter-select"
                      value={statusToUpdate}
                      onChange={(e) => setStatusToUpdate(e.target.value)}
                      style={{ width: '100%', marginBottom: '5px' }}
                      disabled={updatingStatus}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                      <button
                        className="action-btn primary"
                        onClick={handleUpdateStatus}
                        disabled={updatingStatus || statusToUpdate === selectedOrder.status}
                        style={{ flex: 1 }}
                      >
                        <Truck size={14} /> {updatingStatus ? "Updating..." : "Update Status"}
                      </button>
                      <button className="action-btn secondary" style={{ flex: 1 }}><Eye size={14} /> View Details</button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <ShoppingCart size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                  <h3>Select an order</h3>
                  <p>Click on an order to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}