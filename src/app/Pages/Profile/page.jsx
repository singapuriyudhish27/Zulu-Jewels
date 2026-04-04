'use client';
import { useEffect, useState } from 'react';
import { User, ShoppingCart, Heart, MapPin, Settings, Eye, EyeOff, Plus, Search, ShoppingBag, Trash2, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddressText, setNewAddressText] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);
  const router = useRouter();

  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');

  useEffect(() => {
    if (currentTab === 'wishlist') {
      setActiveTab(2);
    } else if (currentTab === 'profile') {
      setActiveTab(0);
    } else if (currentTab === 'orders') {
      setActiveTab(1);
    }
  }, [currentTab]);

  useEffect(() => {
    //Backend API Call
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/Pages/Profile', {
          credentials: 'include',
        });

        const data = await response.json();

        if(!response.ok) {
          throw new Error(data?.message || 'Failed to fetch profile data');
        }

        setUser(data.user);
        setSavedAddresses(data.addresses || []);
      } catch (error) {
        console.error("Profile Fetching From API Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [router]);

  // 🔹 Add a new address
  const handleAddAddress = async () => {
    if (!newAddressText.trim()) {
      toast.error('Please enter an address');
      return;
    }
    setAddressLoading(true);
    try {
      const isFirst = savedAddresses.length === 0;
      const res = await fetch('/api/Pages/Profile/Addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ address_line: newAddressText.trim(), is_default: isFirst }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setSavedAddresses(prev => [...prev, {
        id: result.id,
        address_line: newAddressText.trim(),
        is_default: isFirst,
      }]);
      setNewAddressText('');
      setShowAddressModal(false);
      toast.success('Address saved!');
    } catch (err) {
      toast.error(err.message || 'Failed to save address');
    } finally {
      setAddressLoading(false);
    }
  };

  // 🔹 Delete an address
  const handleDeleteAddress = async (id) => {
    try {
      const res = await fetch('/api/Pages/Profile/Addresses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setSavedAddresses(prev => prev.filter(a => a.id !== id));
      toast.success('Address removed');
    } catch (err) {
      toast.error(err.message || 'Failed to delete address');
    }
  };

  // 🔹 Set an address as default
  const handleSetDefault = async (id) => {
    try {
      const res = await fetch('/api/Pages/Profile/Addresses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setSavedAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })));
      toast.success('Default address updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update default');
    }
  };

  // 🔹 Fetch Wishlist handler
  const fetchWishlist = async () => {
    setWishlistLoading(true);
    try {
      const response = await fetch('/api/Pages/Wishlist', {
        credentials: 'include',
      });
      const result = await response.json();
      console.log("Wishlist Data:", result);
      if (response.ok && result.success) {
        setWishlist(result.data);
      }
    } catch (error) {
      console.error("Wishlist Fetching Error:", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  // 🔹 Fetch Orders handler
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await fetch('/api/Pages/Profile/Recent-Orders', {
        credentials: 'include',
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error("Orders Fetching Error:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 2) {
      fetchWishlist();
    }
    if (activeTab === 1) {
      fetchOrders();
    }
  }, [activeTab]);

  // 🔹 Remove from Wishlist handler
  const handleRemoveWishlist = async (productId, variantId) => {
    try {
      const response = await fetch('/api/Pages/Wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, variant_id: variantId }),
        credentials: 'include',
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toast.success("Removed from wishlist");
        fetchWishlist();
      } else {
        toast.error(result.message || "Failed to remove item");
      }
    } catch (error) {
      console.error("Remove Wishlist Error:", error);
      toast.error("An error occurred");
    }
  };

  // 🔹 Profile update handler
  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/Pages/Profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(user),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || 'Profile update failed');
      }

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  // 🔹 Password update handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const currentPassword = e.target.currentPassword.value;
    const newPassword = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    try {
      const response = await fetch('/api/Pages/Profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || 'Password update failed');
      }

      toast.success('Password changed successfully!');
      e.target.reset();
    } catch (error) {
      console.error('Password update error:', error);
      toast.error('Failed to update password. Please try again.');
    }
  };

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
        toast.error('Logout failed. Please try again.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Something went wrong while logging out.');
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --primary-gold: #D4AF37;
          --dark-bg: #1a1a1a;
          --light-bg: #ffffff;
          --text-dark: #1a1a1a;
          --text-muted: #666666;
          --bg-gray: #F5F5F5;
          --border-color: #E5E5E5;
          --font-main: 'Montserrat', sans-serif;
          --font-heading: 'Cormorant Garamond', serif;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: var(--font-main);
          background: #ffffff;
          color: var(--text-dark);
          -webkit-font-smoothing: antialiased;
        }

        .promo-bar {
          background: white;
          color: #000;
          text-align: center;
          padding: 20px 0;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 600;
        }

        .profile-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        .welcome-section {
          margin-bottom: 48px;
        }

        .welcome-title {
          font-family: var(--font-main);
          font-size: 32px;
          font-weight: 500;
          color: #000;
          margin-bottom: 40px;
        }

        /* Tabs Navigation */
        .profile-tabs {
          display: flex;
          justify-content: center;
          gap: 60px;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 20px;
        }

        .tab-btn {
          background: none;
          border: none;
          padding: 16px 0;
          font-size: 13px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          cursor: pointer;
          position: relative;
          transition: color 0.3s ease;
        }

        .tab-btn:hover {
          color: #000;
        }

        .tab-btn.active {
          color: #000;
        }

        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 2px;
          background: #CEA268;
        }

        /* Active Tab Content */
        .tab-content {
          animation: fadeIn 0.4s ease;
          width: 100%;
          margin: 0 auto;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .section-title {
          font-family: var(--font-main);
          font-size: 24px;
          font-weight: 600;
          text-align: center;
          margin-bottom: 40px;
          color: #000;
        }

        .profile-details-section {
          max-width: 40%;
          margin: 0 auto;
        }

        /* Form Controls */
        .form-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .form-label {
          font-size: 13px;
          font-weight: 600;
          color: #000;
          margin-bottom: 4px;
        }

        .input-wrapper {
          position: relative;
          width: 100%;
        }

        .text-field {
          width: 100%;
          padding: 14px 16px;
          background: #fff;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          font-family: var(--font-main);
          font-size: 14px;
          color: #1a1a1a;
          transition: all 0.3s ease;
        }

        .text-field:focus {
          outline: none;
          border-color: #000;
        }

        .text-field.readonly {
          background: #F9F9F9;
          color: #777;
          border-color: transparent;
          cursor: default;
        }

        .date-joined {
          font-size: 13px;
          color: #666;
          white-space: nowrap;
        }

        .location-box {
          padding: 16px;
          background: #F9F9F9;
          border-radius: 4px;
          font-size: 13px;
          line-height: 1.6;
          color: #333;
        }

        .add-location-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: #000;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 12px;
          transition: opacity 0.3s;
        }

        .add-location-btn:hover {
          opacity: 0.7;
        }

        .profile-btn-group {
          display: flex;
          gap: 16px;
          margin-top: 32px;
        }

        .save-button {
          flex: 1;
          background: #000;
          color: #fff;
          border: 1px solid #000;
          padding: 14px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          cursor: pointer;
          transition: all 0.3s;
        }

        .save-button:hover {
          background: #333;
          border-color: #333;
        }

        .logout-button {
          flex: 1;
          background: #fff;
          color: #e74c3c;
          border: 1px solid #e74c3c;
          padding: 14px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          cursor: pointer;
          transition: all 0.3s;
        }

        .logout-button:hover {
          background: #e74c3c;
          color: #fff;
        }

        /* Order Card Specifics (Minimalist) */
        .order-item-minimal {
          display: flex;
          justify-content: space-between;
          padding: 24px 0;
          border-bottom: 1px solid var(--border-color);
        }

        .wishlist-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }

        .saved-item-card {
          background: #fff;
          border-radius: 4px;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .saved-item-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .profile-tabs {
            gap: 24px;
            overflow-x: auto;
            justify-content: flex-start;
            padding-bottom: 8px;
          }
          .wishlist-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* Wishlist List View Styles */
        .wishlist-list-container {
          width: 100%;
          border-top: 1px solid #000;
          margin-top: 30px;
        }

        .wishlist-list-header {
          display: grid;
          grid-template-columns: 2.5fr 1.2fr 1fr 80px;
          padding: 20px 10px;
          border-bottom: 2px solid #000;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #000;
          background: #f4ede4;
        }

        .wishlist-list-item {
          display: grid;
          grid-template-columns: 2.5fr 1.2fr 1fr 80px;
          padding: 24px 10px;
          border-bottom: 1px solid var(--border-color);
          align-items: center;
          transition: background 0.3s ease;
        }

        .wishlist-list-item:hover {
          background: #fdfdfd;
        }

        .wishlist-column-product {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .wishlist-item-img {
          width: 90px;
          height: 90px;
          background: #f9f9f9;
          object-fit: cover;
          border-radius: 2px;
        }

        .wishlist-item-name {
          font-family: var(--font-main);
          font-size: 14px;
          font-weight: 600;
          color: #000;
          text-decoration: none;
        }

        .wishlist-item-name:hover {
          color: #CEA268;
        }

        .wishlist-column-variant {
          font-size: 13px;
          color: #666;
          font-weight: 500;
        }

        .wishlist-column-price {
          font-size: 14px;
          color: #000;
          font-weight: 600;
        }

        .wishlist-column-action {
          display: flex;
          justify-content: flex-end;
        }

        .wishlist-remove-link {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
          padding: 8px;
          transition: color 0.3s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .wishlist-remove-link:hover {
          color: #e74c3c;
        }

        @media (max-width: 768px) {
          .wishlist-list-header {
            display: none;
          }
          .wishlist-list-item {
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            padding: 20px 0;
          }
          .wishlist-column-product {
            grid-column: span 2;
          }
          .wishlist-column-variant, .wishlist-column-price {
            font-size: 12px;
          }
          .wishlist-column-action {
            grid-column: span 2;
            justify-content: flex-start;
          }
        }
        /* Orders List View Styles */
        .orders-list-container {
          width: 100%;
          border-top: 1px solid #000;
          margin-top: 30px;
        }

        .orders-list-header {
          display: grid;
          grid-template-columns: 1fr 1.2fr 2fr 1fr 1fr 1.2fr 1fr;
          padding: 20px 10px;
          border-bottom: 2px solid #000;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #000;
          background: #f4ede4;
          gap: 10px;
        }

        .orders-list-item {
          display: grid;
          grid-template-columns: 1fr 1.2fr 2fr 1fr 1fr 1.2fr 1fr;
          padding: 24px 10px;
          border-bottom: 1px solid var(--border-color);
          align-items: center;
          transition: background 0.3s ease;
          gap: 10px;
        }

        .orders-list-item:hover {
          background: #fdfdfd;
        }

        .orders-column-id, .orders-column-product-name {
          font-family: var(--font-main);
          font-size: 13px;
          font-weight: 600;
          color: #000;
        }

        .orders-column-date, .orders-column-total, .orders-column-variant, .orders-column-payment {
          font-size: 12px;
          color: #333;
          font-weight: 500;
        }

        .orders-column-status {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 700;
          color: #CEA268;
        }

        @media (max-width: 768px) {
          .orders-list-header {
            display: none;
          }
          .orders-list-item {
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            padding: 20px 0;
          }
          .orders-column-id {
            grid-column: span 2;
          }
          .orders-column-status {
            grid-column: span 1;
            text-align: left;
          }
          .orders-column-total {
            text-align: right;
          }
        }
      `}} />

      <div className="promo-bar">50%off</div>
      <Navbar />

      <main className="profile-wrapper">

        {/* Horizontal Tabs */}
        <nav className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 1 ? 'active' : ''}`} 
            onClick={() => setActiveTab(1)}
          >
            Recent Orders
          </button>
          <button 
            className={`tab-btn ${activeTab === 2 ? 'active' : ''}`} 
            onClick={() => setActiveTab(2)}
          >
            Wishlist
          </button>
          <button 
            className={`tab-btn ${activeTab === 0 ? 'active' : ''}`} 
            onClick={() => setActiveTab(0)}
          >
            Profile Details
          </button>
        </nav>

        <div className="welcome-section">
          <h1 className="welcome-title">Welcome back, {user?.firstName || 'Guest'}</h1>
        </div>

        <div className="tab-content">
          {/* Recent Orders Content */}
          {activeTab === 1 && (
            <div className="orders-section">
              <h2 className="section-title">Recent Orders</h2>
              <div className="orders-list-container">
                <div className="orders-list-header">
                  <div>Date</div>
                  <div>Order ID</div>
                  <div>Product</div>
                  <div>Variant</div>
                  <div>Price</div>
                  <div>Payment</div>
                  <div>Status</div>
                </div>
                
                {ordersLoading ? (
                  <p style={{ textAlign: 'center', padding: '40px 0' }}>Loading your orders...</p>
                ) : orders.length > 0 ? (
                  orders.map((order, idx) => (
                    <div key={`${order.order_id}-${idx}`} className="orders-list-item">
                      <div className="orders-column-date">
                        {new Date(order.order_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="orders-column-id">#ZJ-{order.order_id.toString().padStart(6, '0')}</div>
                      <div className="orders-column-product" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '40px', height: '40px', background: '#f9f9f9', borderRadius: '2px', overflow: 'hidden' }}>
                          {order.image_url ? (
                            <img src={order.image_url} alt={order.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '20px' }}>💍</div>
                          )}
                        </div>
                        <span className="orders-column-product-name">{order.product_name}</span>
                      </div>
                      <div className="orders-column-variant">{order.variant_material || "Standard"}</div>
                      <div className="orders-column-total">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(order.item_price)}
                      </div>
                      <div className="orders-column-payment" style={{ color: order.is_paid ? '#2ecc71' : '#f39c12' }}>
                        {order.is_paid ? 'Success' : 'Pending'}
                      </div>
                      <div className="orders-column-status" style={{ 
                        color: order.order_status === 'Delivered' ? '#2ecc71' : (order.order_status === 'Processing' ? '#CEA268' : '#3498db') 
                      }}>
                        {order.order_status || 'Ordered'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <ShoppingBag size={48} color="#E5E5E5" style={{ marginBottom: '16px' }} />
                    <p style={{ fontSize: '15px', color: '#666' }}>You haven't placed any orders yet.</p>
                    <Link href="/Pages/Products" style={{ color: '#CEA268', fontSize: '13px', fontWeight: 600, textDecoration: 'none', marginTop: '12px', display: 'inline-block' }}>Start Shopping</Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Wishlist Content */}
          {activeTab === 2 && (
            <div className="wishlist-section">
              <h2 className="section-title">Your Wishlist</h2>
              {wishlistLoading ? (
                <p style={{ textAlign: 'center', py: '20px' }}>Loading your favorites...</p>
              ) : wishlist.length > 0 ? (
                <div className="wishlist-list-container">
                  <div className="wishlist-list-header">
                    <div>Product</div>
                    <div>Variant</div>
                    <div>Price</div>
                    <div style={{ textAlign: 'right' }}>Action</div>
                  </div>
                  {wishlist.map((item, index) => (
                    <div key={`${item.wishlist_id}-${index}`} className="wishlist-list-item">
                      {/* Product Column */}
                      <div className="wishlist-column-product">
                        <Link href={`/Pages/Products/${item.product_id}`}>
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.name} 
                              className="wishlist-item-img"
                            />
                          ) : (
                            <div className="wishlist-item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>💍</div>
                          )}
                        </Link>
                        <Link href={`/Pages/Products/${item.product_id}`} className="wishlist-item-name">
                          {item.name}
                        </Link>
                      </div>

                      {/* Variant Column */}
                      <div className="wishlist-column-variant">
                        {item.variant_material || "Standard"}
                      </div>

                      {/* Price Column */}
                      <div className="wishlist-column-price">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.price)}
                      </div>

                      {/* Action Column */}
                      <div className="wishlist-column-action">
                        <button 
                          className="wishlist-remove-link"
                          onClick={() => handleRemoveWishlist(item.product_id, item.variant_id)}
                          title="Remove from wishlist"
                        >
                          <Plus size={14} style={{ transform: 'rotate(45deg)' }} />
                          <span className="remove-text">Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Heart size={48} color="#E5E5E5" style={{ marginBottom: '16px' }} />
                  <p style={{ fontSize: '15px', color: '#666' }}>Your wishlist is currently empty.</p>
                  <Link href="/Pages/Products" style={{ color: '#CEA268', fontSize: '13px', fontWeight: 600, textDecoration: 'none', marginTop: '12px', display: 'inline-block' }}>Discover Our Collection</Link>
                </div>
              )}
            </div>
          )}

          {/* Profile Details (Account Details + Location) */}
          {activeTab === 0 && (
            <div className="profile-details-section">
              <h2 className="section-title">Profile Details</h2>
              <form className="form-container" onSubmit={handleProfileSubmit}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <div className="form-row">
                    <input 
                      type="text" 
                      className="text-field readonly" 
                      value={user ? `${user.firstName || ''} ${user.lastName || ''}` : ''} 
                      readOnly 
                    />
                    <span className="date-joined">Date Joined: {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '15 January 2026'}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input 
                    type="email" 
                    className="text-field readonly" 
                    value={user?.email || ''} 
                    readOnly 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile number</label>
                  <input 
                    type="tel" 
                    className="text-field" 
                    value={user?.phone || ''} 
                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                    placeholder="+91 00000 00000"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Saved Locations</label>
                  {savedAddresses.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {savedAddresses.map((addr) => (
                        <div key={addr.id} style={{
                          padding: '12px 14px',
                          background: addr.is_default ? '#fdf8ef' : '#F9F9F9',
                          border: `1px solid ${addr.is_default ? '#CEA268' : '#E5E5E5'}`,
                          borderRadius: '4px',
                          fontSize: '13px',
                          color: '#333',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '10px',
                        }}>
                          <div style={{ flex: 1 }}>
                            {addr.is_default && (
                              <span style={{ fontSize: '10px', fontWeight: 700, color: '#CEA268', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>Default</span>
                            )}
                            {addr.address_line}
                          </div>
                          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                            {!addr.is_default && (
                              <button
                                type="button"
                                onClick={() => handleSetDefault(addr.id)}
                                title="Set as default"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CEA268', padding: '2px' }}
                              >
                                <Star size={15} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr.id)}
                              title="Remove"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '2px' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="location-box" style={{ color: '#999', fontStyle: 'italic' }}>
                      No saved addresses yet.
                    </div>
                  )}
                  <button type="button" className="add-location-btn" onClick={() => setShowAddressModal(true)}>
                    <Plus size={16} /> Add Location
                  </button>
                </div>

                <div className="profile-btn-group">
                  <button type="submit" className="save-button">Save</button>
                  <button 
                    type="button" 
                    onClick={handleLogout}
                    className="logout-button"
                  >
                    Logout
                  </button>
                </div>
              </form>

              {/* Add Address Modal */}
              {showAddressModal && (
                <div style={{
                  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                  zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
                }}>
                  <div style={{
                    background: '#fff', borderRadius: '4px', padding: '32px',
                    width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                    animation: 'fadeIn 0.25s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#000' }}>Add New Address</h3>
                      <button type="button" onClick={() => { setShowAddressModal(false); setNewAddressText(''); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: '#999', lineHeight: 1 }}>×</button>
                    </div>
                    <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Full Address</label>
                    <textarea
                      value={newAddressText}
                      onChange={(e) => setNewAddressText(e.target.value)}
                      placeholder="e.g. 101, Gold Residency, Ring Road, Surat, Gujarat – 395007"
                      style={{
                        width: '100%', padding: '12px 14px', border: '1px solid #E5E5E5',
                        borderRadius: '4px', fontSize: '13px', fontFamily: 'Montserrat, sans-serif',
                        resize: 'none', height: '100px', outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                      <button
                        type="button"
                        onClick={handleAddAddress}
                        disabled={addressLoading}
                        style={{
                          flex: 1, padding: '13px', background: '#000', color: '#fff',
                          border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
                        }}
                      >
                        {addressLoading ? 'Saving...' : 'Save Address'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowAddressModal(false); setNewAddressText(''); }}
                        style={{
                          flex: 1, padding: '13px', background: '#fff', color: '#000',
                          border: '1px solid #E5E5E5', borderRadius: '4px', fontSize: '13px',
                          fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}