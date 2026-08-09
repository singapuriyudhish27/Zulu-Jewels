"use client";

import "./orders.css";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import PageLoader from "@/components/common/PageLoader";
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
  Heart,
  X,
  Trash2,
  ExternalLink
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
  const [deletingOrder, setDeletingOrder] = useState(false);
  const searchParams = useSearchParams();

  // Shipping & Tracking State
  const [shippingZones, setShippingZones] = useState([]);
  const [shippingPartners, setShippingPartners] = useState([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");

  const addBusinessDays = (date, days) => {
    const result = new Date(date);
    let count = 0;
    while (count < days) {
      result.setDate(result.getDate() + 1);
      const day = result.getDay();
      if (day !== 0 && day !== 6) { // 0 = Sunday, 6 = Saturday
        count++;
      }
    }
    return result;
  };

  // Dropdown state for multiple items
  const [showItemDropdown, setShowItemDropdown] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`/api/Admin/Order-Management?t=${Date.now()}`, {
          credentials: 'include',
          cache: 'no-store'
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

    const fetchShippingData = async () => {
      try {
        const response = await fetch('/api/Admin/Shipping-Management', {
          credentials: 'include',
        });
        const result = await response.json();
        if (result.success) {
          setShippingZones(result.data.shipping_zones || []);
          setShippingPartners(result.data.shipping_partners || []);
        }
      } catch (error) {
        console.error("Error fetching shipping data:", error);
      }
    };

    fetchOrders();
    fetchShippingData();
  }, []);

  useEffect(() => {
    if (selectedOrder) {
      setStatusToUpdate(selectedOrder.status);
      setSelectedPartnerId("");
      setTrackingUrl("");
      setExpectedDeliveryDate("");
    }
  }, [selectedOrder]);

  // Auto-select order from query param (e.g. redirected from Customer Management)
  useEffect(() => {
    if (loading) return;
    const orderId = searchParams.get("orderId");
    if (!orderId) return;
    const match = orders.find(o => String(o.rawId) === String(orderId));
    if (match) {
      setSelectedOrder(match);
      setShowItemDropdown(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, searchParams]);

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
      productId: orderItem.product_id, // Added productId
      name: orderItem.product_name,
      category: orderItem.category?.name || "Other",
      qty: orderItem.quantity,
      price: formatCurrency(orderItem.item_price),
      variant: orderItem.variant_material || null,
      variantId: orderItem.variant_id || null
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
      isCustom: isCustom,
      shipping_partner: item.shipping_partner,
      tracking_url: item.tracking_url,
      expected_delivery_date: item.expected_delivery_date,
      delivery_received: item.delivery_received,
      delivery_remarks: item.delivery_remarks,
      delivery_feedback: item.delivery_feedback,
      delivery_confirmed_at: item.delivery_confirmed_at,
      isPaid: Boolean(item.is_paid),
      isRefunded: Boolean(item.is_refunded),
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

  const getEligiblePartners = () => {
    if (!selectedOrder || !selectedOrder.address) return [];
    const addressLower = selectedOrder.address.toLowerCase();
    
    // Find matching zones
    const matchingZones = shippingZones.filter(zone => {
      if (!zone.status) return false;
      const zoneNameMatch = zone.zone_name && addressLower.includes(zone.zone_name.toLowerCase());
      const locationMatch = zone.location && addressLower.includes(zone.location.toLowerCase());
      
      let areaMatch = false;
      if (zone.areas) {
        const areaList = zone.areas.split(',').map(a => a.trim().toLowerCase()).filter(Boolean);
        areaMatch = areaList.some(area => addressLower.includes(area));
      }
      
      return zoneNameMatch || locationMatch || areaMatch;
    });
    
    // Get unique partner IDs from matching zones
    const partnerIds = [...new Set(matchingZones.map(z => z.partner_id?.toString()).filter(Boolean))];
    
    // Map to partner objects
    let eligible = shippingPartners.filter(p => p.status && partnerIds.includes(p._id?.toString()));
    
    // Fallback to all active partners if none matched
    if (eligible.length === 0) {
      eligible = shippingPartners.filter(p => p.status);
    }
    
    return eligible;
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !statusToUpdate) return;
    if (statusToUpdate === selectedOrder.status) {
      toast.error("Please select a different status to update.");
      return;
    }

    if (statusToUpdate === 'Shipped') {
      if (!selectedPartnerId) {
        toast.error("Please select a shipping partner.");
        return;
      }
      if (!trackingUrl) {
        toast.error("Please enter a tracking URL.");
        return;
      }
      if (!expectedDeliveryDate) {
        toast.error("Please select an expected delivery date.");
        return;
      }
    }

    const partnerObj = shippingPartners.find(p => (p._id || p.id) === selectedPartnerId);
    const partnerName = partnerObj ? partnerObj.partner_name : "";

    setUpdatingStatus(true);
    try {
      const res = await fetch("/api/Admin/Order-Management", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: selectedOrder.rawId,
          status: statusToUpdate,
          ...(statusToUpdate === 'Shipped' ? {
            shipping_partner: partnerName,
            tracking_url: trackingUrl,
            expected_delivery_date: expectedDeliveryDate
          } : {})
        }),
        credentials: "include",
      });

      const result = await res.json();
      if (result.success) {
        // Update local orders Data
        setOrdersData(prev => prev.map(o =>
          o.order_id === selectedOrder.rawId ? { 
            ...o, 
            order_status: statusToUpdate,
            ...(statusToUpdate === 'Shipped' ? {
              shipping_partner: partnerName,
              tracking_url: trackingUrl,
              expected_delivery_date: expectedDeliveryDate
            } : {})
          } : o
        ));

        // Update selected order view
        setSelectedOrder(prev => ({ 
          ...prev, 
          status: statusToUpdate,
          ...(statusToUpdate === 'Shipped' ? {
            shipping_partner: partnerName,
            tracking_url: trackingUrl,
            expected_delivery_date: expectedDeliveryDate
          } : {})
        }));

        toast.success("Order status updated successfully!");
      } else {
        toast.error(result.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Order status update error:", error);
      toast.error("Something went wrong while updating status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // 🔹 View Order Details Handler
  const handleViewOrderDetails = () => {
    if (!selectedOrder) return;

    if (selectedOrder.items.length === 1) {
      // Direct redirect if only 1 product
      const item = selectedOrder.items[0];
      router.push(`/Pages/Products/${item.productId}${item.variantId ? `?variantId=${item.variantId}` : ''}`);
    } else if (selectedOrder.items.length > 1) {
      // Toggle dropdown if multiple products
      setShowItemDropdown(!showItemDropdown);
    } else {
      toast.error("No items details found for this order.");
    }
  };

  const handleRefundOrder = async () => {
    if (!selectedOrder) return;
    
    setUpdatingStatus(true);
    try {
      const res = await fetch("/api/Admin/Order-Management", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: selectedOrder.rawId,
          is_refunded: true
        }),
        credentials: "include",
      });

      const result = await res.json();
      if (result.success) {
        // Update local orders Data
        setOrdersData(prev => prev.map(o =>
          o.order_id === selectedOrder.rawId ? { ...o, is_refunded: true } : o
        ));

        // Update selected order view
        setSelectedOrder(prev => ({ ...prev, isRefunded: true }));

        toast.success("Refund processed successfully! Confirmation email sent.");
      } else {
        toast.error(result.message || "Failed to process refund");
      }
    } catch (error) {
      console.error("Refund processing error:", error);
      toast.error("Something went wrong while processing refund.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // 🔹 Actual deletion logic (called after toast confirmation)
  const performDeleteOrder = async () => {
    setDeletingOrder(true);
    try {
      const res = await fetch('/api/Admin/Order-Management', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ order_id: selectedOrder.rawId }),
      });
      const result = await res.json();
      if (result.success) {
        setOrdersData(prev => prev.filter(o => o.order_id !== selectedOrder.rawId));
        setSelectedOrder(null);
        toast.success('Order deleted successfully.');
      } else {
        toast.error(result.message || 'Failed to delete order.');
      }
    } catch (error) {
      console.error('Delete order error:', error);
      toast.error('Something went wrong while deleting the order.');
    } finally {
      setDeletingOrder(false);
    }
  };

  // 🔹 Delete Order Handler — shows toast confirmation first
  const handleDeleteOrder = () => {
    if (!selectedOrder || selectedOrder.status !== 'Cancelled') return;

    toast.custom((t) => (
      <div style={{
        background: '#1A1712',
        border: '1px solid rgba(206, 162, 104, 0.3)',
        color: '#F5EFE3',
        padding: '12px 14px',
        borderRadius: '6px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '280px',
        fontFamily: "'Montserrat', sans-serif",
        opacity: t.visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            padding: '6px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Trash2 size={16} color="#ef4444" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '12px', color: '#F5EFE3', marginBottom: '2px', letterSpacing: '0.02em' }}>
              Delete {selectedOrder.id}?
            </div>
            <div style={{ fontSize: '10px', color: '#9E8E78', letterSpacing: '0.01em' }}>
              This action cannot be undone.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => { toast.dismiss(t.id); performDeleteOrder(); }}
            style={{
              flex: 1, padding: '7px', background: '#ef4444', color: '#FFFFFF',
              border: 'none', borderRadius: '2px', fontSize: '10px',
              fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase',
              letterSpacing: '0.05em', transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Yes, Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              flex: 1, padding: '7px', background: 'transparent', color: '#CEA268',
              border: '1px solid rgba(206, 162, 104, 0.25)', borderRadius: '2px', fontSize: '10px',
              fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase',
              letterSpacing: '0.05em', transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(206, 162, 104, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(206, 162, 104, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(206, 162, 104, 0.25)';
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    ), { id: 'delete-confirm', duration: 8000 });
  };

  if (loading) return <PageLoader admin label="Loading orders" />;

  return (
    <>
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
                        <tr key={order.id} className={selectedOrder?.id === order.id ? 'selected' : ''} onClick={() => {
                          setSelectedOrder(order);
                          setShowItemDropdown(false);
                        }}>
                          <td><span className="order-id">{order.id}</span>{order.isCustom && <span className="custom-badge">CUSTOM</span>}</td>
                          <td>{order.customer}</td>
                          <td>{order.items.map(i => i.variant ? `${i.category} (${i.variant})` : i.category).join(", ")}</td>
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
                          <div>
                            <div className="order-item-name">
                              {item.name}
                              {item.variant && (
                                <span style={{
                                  marginLeft: '8px',
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  background: '#FAF9F8',
                                  border: '1px solid #CEA268',
                                  color: '#CEA268',
                                  padding: '2px 6px',
                                  borderRadius: '3px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em'
                                }}>
                                  {item.variant}
                                </span>
                              )}
                            </div>
                            <div className="order-item-cat">{item.category}{item.variant && ` • Variant: ${item.variant}`} • Qty: {item.qty}</div>
                          </div>
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

                    {selectedOrder.shipping_partner && (
                      <div className="detail-section">
                        <div className="detail-section-title">Shipping & Tracking</div>
                        <div className="detail-row">
                          <span>Partner</span>
                          <strong>{selectedOrder.shipping_partner}</strong>
                        </div>
                        {selectedOrder.expected_delivery_date && (
                          <div className="detail-row">
                            <span>Expected Delivery</span>
                            <span>{formatDate(selectedOrder.expected_delivery_date)}</span>
                          </div>
                        )}
                        {selectedOrder.tracking_url && (
                          <div className="detail-row">
                            <span>Tracking URL</span>
                            <a 
                              href={selectedOrder.tracking_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: '#C9A84C', display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'underline' }}
                            >
                              Track Shipment <ExternalLink size={12} />
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedOrder.delivery_received !== undefined && selectedOrder.delivery_received !== null && (
                      <div className="detail-section" style={{ background: '#FAFAF8', padding: '12px', border: '1px solid #F0EBE3', borderRadius: '4px' }}>
                        <div className="detail-section-title" style={{ color: '#C9A84C', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Customer Delivery Feedback</div>
                        <div className="detail-row">
                          <span>Received Order?</span>
                          <span style={{ 
                            background: selectedOrder.delivery_received ? 'rgba(74, 140, 92, 0.1)' : 'rgba(176, 80, 80, 0.1)', 
                            color: selectedOrder.delivery_received ? '#4A8C5C' : '#B05050',
                            padding: '2px 8px',
                            borderRadius: '3px',
                            fontWeight: 'bold',
                            fontSize: '11px'
                          }}>
                            {selectedOrder.delivery_received ? 'YES' : 'NO'}
                          </span>
                        </div>
                        {selectedOrder.delivery_confirmed_at && (
                          <div className="detail-row">
                            <span>Confirmed Date</span>
                            <span>{formatDate(selectedOrder.delivery_confirmed_at)}</span>
                          </div>
                        )}
                        {selectedOrder.delivery_remarks && (
                          <div className="detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: '#9B8B6E' }}>Customer Remarks</span>
                            <span style={{ fontSize: '12px', background: '#FFF', padding: '6px 8px', border: '1px solid #F0EBE3', borderRadius: '3px', width: '100%', wordBreak: 'break-all' }}>
                              {selectedOrder.delivery_remarks}
                            </span>
                          </div>
                        )}
                        {selectedOrder.delivery_feedback && (
                          <div className="detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginTop: '6px' }}>
                            <span style={{ fontSize: '11px', color: '#9B8B6E' }}>Feedback & Rating</span>
                            <span style={{ fontSize: '12px', background: '#FFF', padding: '6px 8px', border: '1px solid #F0EBE3', borderRadius: '3px', width: '100%', wordBreak: 'break-all' }}>
                              {selectedOrder.delivery_feedback}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
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

                    {statusToUpdate === 'Shipped' && (
                      <div className="shipping-input-group" style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '8px', 
                        padding: '12px', 
                        background: '#FAFAF8', 
                        border: '1px solid #F0EBE3', 
                        borderRadius: '4px',
                        marginBottom: '10px'
                      }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#C9A84C', letterSpacing: '1px', textTransform: 'uppercase' }}>
                          Shipping Information
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <label style={{ fontSize: '10px', color: '#9B8B6E', fontWeight: 600 }}>Select Shipping Partner</label>
                          <select
                            className="filter-select"
                            value={selectedPartnerId}
                            onChange={(e) => {
                              const pId = e.target.value;
                              setSelectedPartnerId(pId);
                              const partner = shippingPartners.find(p => (p._id || p.id) === pId);
                              if (partner) {
                                setTrackingUrl(partner.tracking_url || "");
                                const days = partner.delivery_days || 7;
                                const expected = addBusinessDays(new Date(), days);
                                setExpectedDeliveryDate(expected.toISOString().split('T')[0]);
                              } else {
                                setTrackingUrl("");
                                setExpectedDeliveryDate("");
                              }
                            }}
                            style={{ width: '100%', padding: '6px 8px', fontSize: '12px' }}
                          >
                            <option value="">-- Choose Partner --</option>
                            {getEligiblePartners().map(partner => (
                              <option key={partner._id || partner.id} value={partner._id || partner.id}>
                                {partner.partner_name} ({partner.delivery_days || 7} days)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <label style={{ fontSize: '10px', color: '#9B8B6E', fontWeight: 600 }}>Tracking URL / Details</label>
                          <input
                            type="text"
                            placeholder="Tracking URL"
                            value={trackingUrl}
                            onChange={(e) => setTrackingUrl(e.target.value)}
                            style={{ 
                              width: '100%', 
                              padding: '6px 8px', 
                              fontSize: '12px',
                              border: '1px solid #F0EBE3',
                              borderRadius: '3px',
                              outline: 'none',
                              color: '#2c2c2c'
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <label style={{ fontSize: '10px', color: '#9B8B6E', fontWeight: 600 }}>Expected Delivery Date</label>
                          <input
                            type="date"
                            value={expectedDeliveryDate}
                            onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                            style={{ 
                              width: '100%', 
                              padding: '6px 8px', 
                              fontSize: '12px',
                              border: '1px solid #F0EBE3',
                              borderRadius: '3px',
                              outline: 'none',
                              color: '#2c2c2c'
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                      <button
                        className="action-btn primary"
                        onClick={handleUpdateStatus}
                        disabled={updatingStatus || statusToUpdate === selectedOrder.status}
                        style={{ flex: 1 }}
                      >
                        <Truck size={14} /> {updatingStatus ? "Updating..." : "Update Status"}
                      </button>
                      <button 
                        className="action-btn secondary" 
                        style={{ flex: 1 }}
                        onClick={handleViewOrderDetails}
                      >
                        {showItemDropdown ? <X size={14} /> : <Eye size={14} />} {showItemDropdown ? "Close Items" : "View Details"}
                      </button>
                    </div>
                    {/* Delete Order — visible only when status is Cancelled */}
                    {selectedOrder.status === 'Cancelled' && (
                      <button
                        className="action-btn danger"
                        onClick={handleDeleteOrder}
                        disabled={deletingOrder}
                        style={{ width: '100%' }}
                      >
                        <Trash2 size={14} /> {deletingOrder ? 'Deleting...' : 'Delete Order'}
                      </button>
                    )}

                    {/* Refund Button — visible only when status is Cancelled, payment is made, and not yet refunded */}
                    {selectedOrder.status === 'Cancelled' && selectedOrder.isPaid && !selectedOrder.isRefunded && (
                      <button
                        className="action-btn"
                        onClick={handleRefundOrder}
                        disabled={updatingStatus}
                        style={{ 
                          width: '100%', 
                          background: '#4A8C5C', 
                          color: '#FFF', 
                          border: 'none', 
                          borderRadius: '6px', 
                          padding: '10px', 
                          fontSize: '13px', 
                          fontWeight: 700, 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          marginTop: '5px'
                        }}
                      >
                        <IndianRupee size={14} /> Process Refund
                      </button>
                    )}
                    {selectedOrder.status === 'Cancelled' && selectedOrder.isRefunded && (
                      <div style={{
                        width: '100%',
                        background: 'rgba(74, 140, 92, 0.1)',
                        color: '#4A8C5C',
                        border: '1px solid #4A8C5C',
                        borderRadius: '6px',
                        padding: '10px',
                        fontSize: '13px',
                        fontWeight: 700,
                        textAlign: 'center',
                        marginTop: '5px'
                      }}>
                        ✓ Refund Processed Successfully
                      </div>
                    )}
                  </div>

                  {/* Multiple Items Dropdown */}
                  {showItemDropdown && selectedOrder.items.length > 1 && (
                    <div className="item-dropdown">
                      <div className="dropdown-header">
                        Select a product to view
                      </div>
                      <div className="dropdown-list">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="dropdown-item">
                            <div className="dropdown-item-info">
                              <div className="dropdown-item-name">
                                {item.name}
                                {item.variant && (
                                  <span style={{
                                    marginLeft: '6px',
                                    fontSize: '9px',
                                    fontWeight: 700,
                                    background: '#FAF9F8',
                                    border: '1px solid #CEA268',
                                    color: '#CEA268',
                                    padding: '1px 4px',
                                    borderRadius: '2px',
                                    textTransform: 'uppercase'
                                  }}>
                                    {item.variant}
                                  </span>
                                )}
                              </div>
                              <div className="dropdown-item-meta">
                                {item.category} {item.variant && `• Variant: ${item.variant}`} • Qty: {item.qty} • {item.price}
                              </div>
                            </div>
                            <button 
                              className="dropdown-view-btn"
                              title="View Product"
                              onClick={() => router.push(`/Pages/Products/${item.productId}${item.variantId ? `?variantId=${item.variantId}` : ''}`)}
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

    </>
  );
}
