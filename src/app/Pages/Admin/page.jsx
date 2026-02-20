"use client";


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
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  ShoppingBag,
  Gem,
  Crown,
  Bell,
  MessageSquare
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [loggedInUserData, setLoggedInUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    orders: [],
    order_items: [],
    products: [],
    transactions: [],
    inquiries: [],
    reviews: []
  });


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch Profile
        const profileRes = await fetch('/api/Pages/Admin/Profile', { credentials: 'include' });
        const profileData = await profileRes.json();
        if (profileRes.ok) setLoggedInUserData(profileData);

        // Fetch Dashboard Data
        const dashRes = await fetch('/api/Pages/Admin', { credentials: 'include' });
        const dashResult = await dashRes.json();
        if (dashResult.success) {
          setDashboardData(dashResult.data);
        }
      } catch (error) {
        console.error("Dashboard Fetching Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper: Time ago string
  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  // Map Recent Orders
  const recentOrders = dashboardData.orders.slice(0, 5).map(order => {
    // Find matching items from order_items
    const items = dashboardData.order_items.filter(item => item.order_id === order.id);
    const productName = items.length > 0 ? items[0].product_name : "Jewelry Item";
    const extraItems = items.length > 1 ? ` + ${items.length - 1} more` : "";

    // Calculate total amount from items for this order
    const orderTotal = items.reduce((acc, item) => acc + (parseFloat(item.price || 0) * (item.quantity || 1)), 0);
    const displayAmount = order.total_amount || orderTotal || 0;

    return {
      id: `ORD-${order.id.toString().padStart(4, '0')}`,
      customer: order.customer_name || "Guest Customer",
      product: `${productName}${extraItems}`,
      amount: `₹${parseFloat(displayAmount).toLocaleString('en-IN')}`,
      status: String(order.status || "Pending").charAt(0).toUpperCase() + String(order.status || "Pending").slice(1),
      time: getTimeAgo(order.created_at)
    };
  });

  // Map Top Products
  const topProducts = dashboardData.products.slice(0, 5).map(p => {
    const sold = p.order_count || 0;
    const price = parseFloat(p.price || 0);
    const revenue = (sold * price) / 100000;
    return {
      name: p.name || "Unknown Product",
      category: p.category_name || "Jewelry",
      sold: sold,
      revenue: `₹${revenue.toFixed(1)}L`
    };
  });

  // Create Unified Activity Feed
  const activities = [
    ...dashboardData.orders.slice(0, 3).map(o => ({
      icon: <ShoppingCart size={16} />,
      text: `New order #ORD-${o.id.toString().padStart(4, '0')} received`,
      time: getTimeAgo(o.created_at),
      type: "order",
      timestamp: new Date(o.created_at).getTime()
    })),
    ...dashboardData.reviews.slice(0, 2).map(r => ({
      icon: <Star size={16} />,
      text: `New ${r.rating}-star review on ${r.product_name || "Product"}`,
      time: getTimeAgo(r.created_at),
      type: "review",
      timestamp: new Date(r.created_at).getTime()
    })),
    ...dashboardData.inquiries.slice(0, 2).map(i => ({
      icon: <MessageSquare size={16} />,
      text: `New inquiry from ${i.name || "Customer"}`,
      time: i.created_at ? getTimeAgo(i.created_at) : "Recent",
      type: "inquiry",
      timestamp: i.created_at ? new Date(i.created_at).getTime() : 0
    }))
  ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

  // Business Logic Calculations
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayOrders = dashboardData.orders.filter(o => new Date(o.created_at) >= todayStart);
  const todayRevenue = dashboardData.transactions
    .filter(t => new Date(t.created_at) >= todayStart && t.status === "Completed")
    .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  const pendingOrdersCount = dashboardData.orders.filter(o => ["pending", "processing"].includes(String(o.status || "").toLowerCase())).length;
  const unreadInquiries = dashboardData.inquiries.filter(i => i.status === "unread" || i.status === "active").length;
  const pendingReviews = dashboardData.reviews.filter(r => r.status === "pending").length;

  // Monthly new customers (unique user_ids in the last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const monthlyCustomers = new Set(dashboardData.orders.filter(o => new Date(o.created_at) >= thirtyDaysAgo).map(o => o.user_id)).size;

  const getStatusStyle = (status) => {
    const styles = {
      "Pending": { bg: "rgba(243, 156, 18, 0.1)", color: "#f39c12" },
      "Processing": { bg: "rgba(52, 152, 219, 0.1)", color: "#3498db" },
      "Shipped": { bg: "rgba(155, 89, 182, 0.1)", color: "#9b59b6" },
      "Delivered": { bg: "rgba(39, 174, 96, 0.1)", color: "#27ae60" },
    };
    return styles[status] || styles["Pending"];
  };

  // 🔹 Logout handler

  return (
    <>
          {/* Welcome Section */}
          <div className="welcome-section">
            <h1 className="welcome-title">Welcome back, Admin! 👋</h1>
            <p className="welcome-subtitle">Here`s what`s happening with your store today.</p>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card gold">
              <div className="stat-card-header">
                <div className="stat-card-icon gold"><IndianRupee size={24} /></div>
                <div className="stat-trend up"><ArrowUpRight size={14} /> +12.5%</div>
              </div>
              <div className="stat-card-value">{loading ? "..." : (todayRevenue > 0 ? `₹${(todayRevenue / 1000).toFixed(1)}K` : "₹0")}</div>
              <div className="stat-card-label">Today`s Revenue</div>
            </div>
            <div className="stat-card blue">
              <div className="stat-card-header">
                <div className="stat-card-icon blue"><ShoppingCart size={24} /></div>
                <div className="stat-trend up"><ArrowUpRight size={14} /> +8.2%</div>
              </div>
              <div className="stat-card-value">{loading ? "..." : todayOrders.length}</div>
              <div className="stat-card-label">Orders Today</div>
            </div>
            <div className="stat-card green">
              <div className="stat-card-header">
                <div className="stat-card-icon green"><Users size={24} /></div>
                <div className="stat-trend up"><ArrowUpRight size={14} /> +5.4%</div>
              </div>
              <div className="stat-card-value">{loading ? "..." : monthlyCustomers}</div>
              <div className="stat-card-label">New Customers (Month)</div>
            </div>
            <div className="stat-card orange">
              <div className="stat-card-header">
                <div className="stat-card-icon orange"><Clock size={24} /></div>
                <div className="stat-trend down"><ArrowDownRight size={14} /> -2.1%</div>
              </div>
              <div className="stat-card-value">{loading ? "..." : pendingOrdersCount}</div>
              <div className="stat-card-label">Pending Orders</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions" style={{ marginBottom: 30 }}>
            <div className="quick-action-card" onClick={() => router.push("/Pages/Admin/Order-Management")}>
              <div className="quick-action-icon"><ShoppingBag size={28} /></div>
              <div className="quick-action-title">New Orders</div>
              <div className="quick-action-count">{loading ? "..." : pendingOrdersCount} pending</div>
            </div>
            <div className="quick-action-card" onClick={() => router.push("/Pages/Admin/Contact-Management")}>
              <div className="quick-action-icon"><MessageSquare size={28} /></div>
              <div className="quick-action-title">Inquiries</div>
              <div className="quick-action-count">{loading ? "..." : unreadInquiries} unread</div>
            </div>
            <div className="quick-action-card" onClick={() => router.push("/Pages/Admin/Reviews-Management")}>
              <div className="quick-action-icon"><Star size={28} /></div>
              <div className="quick-action-title">Reviews</div>
              <div className="quick-action-count">{loading ? "..." : pendingReviews} pending</div>
            </div>
            <div className="quick-action-card" onClick={() => router.push("/Pages/Admin/Product-Management")}>
              <div className="quick-action-icon"><AlertCircle size={28} /></div>
              <div className="quick-action-title">Manage Products</div>
              <div className="quick-action-count">{loading ? "..." : dashboardData.products.length} items</div>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="dashboard-grid">
            {/* Recent Orders */}
            <div className="content-card">
              <div className="content-card-header">
                <h3 className="content-card-title"><ShoppingCart size={20} /> Recent Orders</h3>
                <span className="view-all-btn" onClick={() => router.push("/Pages/Admin/Order-Management")}>View All <ArrowUpRight size={14} /></span>
              </div>
              {loading ? (
                <div style={{ padding: 20, textAlign: 'center', opacity: 0.5 }}>Loading orders...</div>
              ) : recentOrders.length > 0 ? (
                recentOrders.map((order) => {
                  const statusStyle = getStatusStyle(order.status);
                  return (
                    <div className="order-item" key={order.id}>
                      <div className="order-info">
                        <div className="order-id">{order.id}</div>
                        <div className="order-details">{order.customer} • {order.product}</div>
                      </div>
                      <div className="order-meta">
                        <div className="order-amount">{order.amount}</div>
                        <div className="order-time">{order.time}</div>
                        <span className="status-badge" style={{ background: statusStyle.bg, color: statusStyle.color }}>{order.status}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: 40, textAlign: 'center', opacity: 0.3 }}>No recent orders</div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="content-card">
              <div className="content-card-header">
                <h3 className="content-card-title"><Bell size={20} /> Recent Activity</h3>
              </div>
              {loading ? (
                <div style={{ padding: 20, textAlign: 'center', opacity: 0.5 }}>Loading transactions...</div>
              ) : activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div className="activity-item" key={index}>
                    <div className={`activity-icon ${activity.type}`}>{activity.icon}</div>
                    <div className="activity-content">
                      <div className="activity-text">{activity.text}</div>
                      <div className="activity-time">{activity.time}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: 40, textAlign: 'center', opacity: 0.3 }}>No recent transactions</div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="content-card">
            <div className="content-card-header">
              <h3 className="content-card-title"><Crown size={20} /> Top Selling Products</h3>
              <span className="view-all-btn" onClick={() => router.push("/Pages/Admin/Product-Management")}>View All <ArrowUpRight size={14} /></span>
            </div>
            {loading ? (
              <div style={{ padding: 20, textAlign: 'center', opacity: 0.5 }}>Loading products...</div>
            ) : topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div className="product-item" key={index}>
                  <div className="product-rank">{index + 1}</div>
                  <div className="product-info">
                    <div className="product-name">{product.name}</div>
                    <div className="product-category">{product.category}</div>
                  </div>
                  <div className="product-stats">
                    <div className="product-sold">{product.sold} sold</div>
                    <div className="product-revenue">{product.revenue}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: 40, textAlign: 'center', opacity: 0.3 }}>No top products found</div>
            )}
        </div>
    </>
  );
}