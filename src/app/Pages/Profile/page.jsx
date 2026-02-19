'use client';
import { useEffect, useState } from 'react';
import { User, ShoppingCart, Heart, MapPin, Settings, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

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
      } catch (error) {
        console.error("Profile Fetching From API Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [router]);

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
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --primary-gold: #D4AF37;
          --dark-bg: #1a1a1a;
          --light-bg: #ffffff;
          --text-dark: #2c2c2c;
          --text-light: #f5f5f5;
          --accent-rose: #C8A882;
          --border-light: #e8e8e8;
        }

        body {
          font-family: 'Montserrat', sans-serif;
          background: #f9f9f9;
          color: var(--text-dark);
        }

        /* Navigation */
        .main-nav {
          padding: 25px 80px;
          background: white;
          box-shadow: 0 2px 20px rgba(0,0,0,0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 600;
          color: var(--primary-gold);
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
        }

        .nav-menu {
          display: flex;
          gap: 50px;
          list-style: none;
        }

        .nav-menu a {
          color: var(--text-dark);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: color 0.3s ease;
          position: relative;
        }

        .nav-menu a::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 0;
            height: 2px;
            background: var(--primary-gold);
            transition: width 0.3s ease;
        }

        .nav-menu a:hover::after {
            width: 100%;
        }

        .nav-icons {
          display: flex;
          gap: 20px;
        }

        .icon-btn {
          width: 40px;
          height: 40px;
          border: 1px solid var(--border-light);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-dark);
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 18px;
          position: relative;
        }

        .icon-btn:hover,
        .icon-btn.active {
          background: var(--primary-gold);
          border-color: var(--primary-gold);
          color: white;
        }

        /* Profile Container */
        .profile-container {
          max-width: 1400px;
          margin: 60px auto;
          padding: 0 80px;
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 40px;
          min-height: calc(100vh - 200px);
        }

        /* Sidebar */
        .profile-sidebar {
          background: white;
          border-radius: 16px;
          padding: 40px 0;
          box-shadow: 0 2px 20px rgba(0,0,0,0.05);
          height: fit-content;
          position: sticky;
          top: 120px;
        }

        .profile-header {
          text-align: center;
          padding: 0 30px 30px;
          border-bottom: 1px solid var(--border-light);
        }

        .profile-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary-gold), var(--accent-rose));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          font-weight: 600;
          color: white;
          margin: 0 auto 20px;
          position: relative;
          cursor: pointer;
        }

        .profile-avatar:hover::after {
          content: '📷';
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }

        .profile-header h2 {
          font-size: 24px;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 5px;
        }

        .profile-header p {
          font-size: 14px;
          color: #666;
        }

        .profile-menu {
          list-style: none;
          padding: 30px 0 0;
        }

        .profile-menu li {
          padding: 18px 40px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 15px;
          font-weight: 500;
          color: #666;
          border-left: 3px solid transparent;
        }

        .profile-menu li:hover {
          background: rgba(212,175,55,0.05);
          color: var(--primary-gold);
        }

        .profile-menu li.active {
          background: rgba(212,175,55,0.1);
          color: var(--primary-gold);
          border-left-color: var(--primary-gold);
        }

        .profile-menu li::before {
          content: '';
          display: inline-block;
          width: 20px;
          margin-right: 15px;
        }

        .logout-btn {
          margin: 20px 40px;
          padding: 12px 20px;
          background: #e74c3c;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          width: calc(100% - 80px);
        }

        .logout-btn:hover {
          background: #c0392b;
          transform: translateY(-2px);
        }

        /* Main Content */
        .profile-content {
          background: white;
          border-radius: 16px;
          padding: 50px;
          box-shadow: 0 2px 20px rgba(0,0,0,0.05);
        }

        .profile-section {
          display: none;
        }

        .profile-section.active {
          display: block;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .section-header {
          margin-bottom: 40px;
        }

        .section-header h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 36px;
          color: var(--text-dark);
          margin-bottom: 10px;
        }

        .section-header p {
          font-size: 15px;
          color: #666;
        }

        /* Form Styles */
        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .form-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-dark);
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .form-input,
        .form-select,
        .form-textarea {
          padding: 15px 20px;
          border: 2px solid var(--border-light);
          border-radius: 8px;
          font-size: 15px;
          font-family: 'Montserrat', sans-serif;
          transition: all 0.3s ease;
          background: #fafafa;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: var(--primary-gold);
          background: white;
          box-shadow: 0 0 0 4px rgba(212,175,55,0.1);
        }

        .form-input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .save-btn {
          padding: 16px 40px;
          background: var(--primary-gold);
          color: var(--dark-bg);
          border: none;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 8px;
          width: fit-content;
        }

        .save-btn:hover {
          background: var(--accent-rose);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(212,175,55,0.3);
        }

        /* Order History */
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .order-card {
          border: 2px solid var(--border-light);
          border-radius: 12px;
          padding: 30px;
          transition: all 0.3s ease;
        }

        .order-card:hover {
          border-color: var(--primary-gold);
          box-shadow: 0 5px 20px rgba(212,175,55,0.1);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border-light);
        }

        .order-info h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 8px;
        }

        .order-info p {
          font-size: 14px;
          color: #666;
        }

        .order-status {
          padding: 8px 20px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }

        .order-status.delivered {
          background: rgba(46,204,113,0.1);
          color: #27ae60;
        }

        .order-status.processing {
          background: rgba(241,196,15,0.1);
          color: #f39c12;
        }

        .order-status.shipped {
          background: rgba(52,152,219,0.1);
          color: #3498db;
        }

        .order-items {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 20px;
        }

        .order-item {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .item-image {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
          border-radius: 8px;
        }

        .item-details h4 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 5px;
        }

        .item-details p {
          font-size: 14px;
          color: #666;
        }

        .order-actions {
          display: flex;
          gap: 15px;
        }

        .btn-track,
        .btn-reorder {
          padding: 10px 24px;
          border: 2px solid var(--border-light);
          background: white;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-track:hover {
          border-color: var(--primary-gold);
          color: var(--primary-gold);
        }

        .btn-reorder {
          background: var(--primary-gold);
          border-color: var(--primary-gold);
          color: var(--dark-bg);
        }

        .btn-reorder:hover {
          background: var(--accent-rose);
          border-color: var(--accent-rose);
        }

        /* Saved Items */
        .saved-items-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }

        .saved-item-card {
          border: 2px solid var(--border-light);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .saved-item-card:hover {
          border-color: var(--primary-gold);
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .saved-item-image {
          width: 100%;
          height: 250px;
          background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
        }

        .saved-item-info {
          padding: 20px;
        }

        .saved-item-info h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 8px;
        }

        .saved-item-info p {
          font-size: 14px;
          color: #666;
          margin-bottom: 15px;
        }

        .saved-item-price {
          font-size: 20px;
          font-weight: 700;
          color: var(--primary-gold);
          margin-bottom: 15px;
        }

        .saved-item-actions {
          display: flex;
          gap: 10px;
        }

        .btn-add-cart,
        .btn-remove {
          flex: 1;
          padding: 12px;
          border: 2px solid var(--border-light);
          background: white;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-add-cart {
          background: var(--primary-gold);
          border-color: var(--primary-gold);
          color: var(--dark-bg);
        }

        .btn-add-cart:hover {
          background: var(--accent-rose);
          border-color: var(--accent-rose);
        }

        .btn-remove:hover {
          border-color: #e74c3c;
          color: #e74c3c;
        }

        /* Addresses */
        .addresses-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 25px;
          margin-bottom: 30px;
        }

        .address-card {
          border: 2px solid var(--border-light);
          border-radius: 12px;
          padding: 25px;
          position: relative;
          transition: all 0.3s ease;
        }

        .address-card.default {
          border-color: var(--primary-gold);
          background: rgba(212,175,55,0.05);
        }

        .address-card:hover {
          box-shadow: 0 5px 20px rgba(0,0,0,0.05);
        }

        .address-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          padding: 5px 15px;
          background: var(--primary-gold);
          color: white;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .address-card h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 15px;
        }

        .address-card p {
          font-size: 14px;
          color: #666;
          line-height: 1.8;
          margin-bottom: 20px;
        }

        .address-actions {
          display: flex;
          gap: 10px;
        }

        .btn-edit,
        .btn-delete {
          padding: 8px 20px;
          border: 1px solid var(--border-light);
          background: white;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-edit:hover {
          border-color: var(--primary-gold);
          color: var(--primary-gold);
        }

        .btn-delete:hover {
          border-color: #e74c3c;
          color: #e74c3c;
        }

        .btn-add-address {
          padding: 16px 40px;
          background: var(--primary-gold);
          color: var(--dark-bg);
          border: none;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 8px;
        }

        .btn-add-address:hover {
          background: var(--accent-rose);
          transform: translateY(-2px);
        }

        /* Settings */
        .settings-section {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .setting-item {
          padding: 25px;
          border: 2px solid var(--border-light);
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .setting-info h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 8px;
        }

        .setting-info p {
          font-size: 14px;
          color: #666;
        }

        .toggle-switch {
          position: relative;
          width: 60px;
          height: 30px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.4s;
          border-radius: 30px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 22px;
          width: 22px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }

        .toggle-switch input:checked + .toggle-slider {
          background-color: var(--primary-gold);
        }

        .toggle-switch input:checked + .toggle-slider:before {
          transform: translateX(30px);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .profile-container {
            grid-template-columns: 1fr;
            padding: 0 40px;
          }

          .profile-sidebar {
            position: relative;
            top: 0;
          }

          .saved-items-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .addresses-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .saved-items-grid {
            grid-template-columns: 1fr;
          }

          .profile-content {
            padding: 30px 20px;
          }
        }
      `}} />

      {/* Navigation */}
      <nav className="main-nav">
        <div className="logo" onClick={() => window.location.href='/Pages'}>Zulu Jewellers</div>
        <ul className="nav-menu">
          <li><a href="/Pages">Home</a></li>
          <li><a href="/Pages/engagement">Engagement</a></li>
          <li><a href="/Pages/wedding">Wedding</a></li>
          <li><a href="/Pages/custom">Cusstom</a></li>
          <li><a href="/Pages/About">About</a></li>
          <li><a href="/Pages/contact">Contact</a></li>
        </ul>
        <div className="nav-icons">
          <Link href="/Pages/Profile" className="icon-btn active" aria-label="User Profile">
            <User size={18} strokeWidth={1.5} />
          </Link>
          <Link href="/Pages/cart" className="icon-btn" aria-label="Shopping Cart">
            <ShoppingCart size={18} strokeWidth={1.5} />
          </Link>
        </div>
      </nav>

      {/* Profile Container */}
      <div className="profile-container">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-header">
            {/* <div className="profile-avatar">JD</div>
            <h2>John Doe</h2>
            <p>john.doe@email.com</p> */}
            {user && (
              <>
                <div className="profile-avatar">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <h2>{user.firstName} {user.lastName}</h2>
                <p>{user.email}</p>
              </>
            )}
          </div>
          
          <ul className="profile-menu">
            <li className={activeTab === 0 ? 'active' : ''} onClick={() => setActiveTab(0)}>
              <User size={20} strokeWidth={1.5} />&nbsp; Account Details
            </li>
            <li className={activeTab === 1 ? 'active' : ''} onClick={() => setActiveTab(1)}>
              <ShoppingCart size={20} strokeWidth={2} />&nbsp; Order History
            </li>
            <li className={activeTab === 2 ? 'active' : ''} onClick={() => setActiveTab(2)}>
              <Heart size={20} strokeWidth={2} />&nbsp; Saved Items
            </li>
            <li className={activeTab === 3 ? 'active' : ''} onClick={() => setActiveTab(3)}>
              <MapPin size={20} strokeWidth={2} />&nbsp; Addresses
            </li>
            <li className={activeTab === 4 ? 'active' : ''} onClick={() => setActiveTab(4)}>
              <Settings size={20} strokeWidth={2} />&nbsp; Settings
            </li>
          </ul>

          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </aside>

        {/* Main Content */}
        <main className="profile-content">
          {/* Account Details Section */}
          <div className={`profile-section ${activeTab === 0 ? 'active' : ''}`}>
            <div className="section-header">
              <h1>Account Details</h1>
              <p>Manage your personal information</p>
            </div>

            <form className="profile-form" onSubmit={handleProfileSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                  type="text"
                  className="form-input"
                  value={user?.firstName || ''}
                  onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                  required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                  type="text"
                  className="form-input"
                  value={user?.lastName || ''}
                  onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                  required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                type="text"
                className="form-input"
                value={user?.email || ''}
                disabled
                readOnly
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                {/* <input type="tel" className="form-input" defaultValue="+1 (555) 123-4567" /> */}
                <input
                type="text"
                className="form-input"
                value={user?.phone || ''}
                onChange={(e) => setUser({ ...user, contact_no: e.target.value })}
                required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                type="date"
                className="form-input"
                value={user?.dob || ''}
                onChange={(e) => setUser({ ...user, dob: e.target.value })}
                required
                />
              </div>

              <button type="submit" className="save-btn">Save Changes</button>
            </form>

            <div className="section-header" style={{marginTop: '60px'}}>
              <h1>Change Password</h1>
              <p>Update your password to keep your account secure</p>
            </div>

            <form className="profile-form" onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    style={{ paddingRight: '52px' }}
                    type={showCurrentPassword ? 'text' : 'password'} 
                    name="currentPassword" 
                    className="form-input" 
                    required 
                  />
                  <span
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      cursor: 'pointer',
                      color: '#999',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showCurrentPassword ? <EyeOff size={26} /> : <Eye size={26} />}
                  </span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      style={{ paddingRight: '50px' }}
                      type={showNewPassword ? 'text' : 'password'} 
                      name="newPassword" 
                      className="form-input" 
                      required 
                    />
                    <span
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                        color: '#999',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showNewPassword ? <EyeOff size={26} /> : <Eye size={26} />}
                    </span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      style={{ paddingRight: '50px' }}
                      type={showConfirmPassword ? 'text' : 'password'} 
                      name="confirmPassword" 
                      className="form-input" 
                      required 
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                        color: '#999',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={26} /> : <Eye size={26} />}
                    </span>
                  </div>
                </div>
              </div>

              <button type="submit" className="save-btn">Update Password</button>
            </form>
          </div>

          {/* Order History Section */}
          <div className={`profile-section ${activeTab === 1 ? 'active' : ''}`}>
            <div className="section-header">
              <h1>Order History</h1>
              <p>Track and manage your orders</p>
            </div>

            <div className="orders-list">
              <div className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #ZJ-2024-001</h3>
                    <p>Placed on December 15, 2024 · Total: $3,500.00</p>
                  </div>
                  <span className="order-status delivered">Delivered</span>
                </div>

                <div className="order-items">
                  <div className="order-item">
                    <div className="item-image"></div>
                    <div className="item-details">
                      <h4>The Eternal Solitaire Ring</h4>
                      <p>18K White Gold | 2.0 CT Round Diamond</p>
                    </div>
                  </div>
                </div>

                <div className="order-actions">
                  <button className="btn-track">Track Order</button>
                  <button className="btn-reorder">Reorder</button>
                </div>
              </div>

              <div className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #ZJ-2024-002</h3>
                    <p>Placed on December 20, 2024 · Total: $2,800.00</p>
                  </div>
                  <span className="order-status processing">Processing</span>
                </div>

                <div className="order-items">
                  <div className="order-item">
                    <div className="item-image"></div>
                    <div className="item-details">
                      <h4>Classic Diamond Studs</h4>
                      <p>18K Yellow Gold | 1.5 CT Total Weight</p>
                    </div>
                  </div>
                </div>

                <div className="order-actions">
                  <button className="btn-track">Track Order</button>
                  <button className="btn-reorder">Reorder</button>
                </div>
              </div>
            </div>
          </div>

          {/* Saved Items Section */}
          <div className={`profile-section ${activeTab === 2 ? 'active' : ''}`}>
            <div className="section-header">
              <h1>Saved Items</h1>
              <p>Your wishlist of favorite jewelry pieces</p>
            </div>

            <div className="saved-items-grid">
              <div className="saved-item-card">
                <div className="saved-item-image"></div>
                <div className="saved-item-info">
                  <h3>The Classic Solitaire</h3>
                  <p>18K White Gold | Round</p>
                  <div className="saved-item-price">$2,800</div>
                  <div className="saved-item-actions">
                    <button className="btn-add-cart">Add to Cart</button>
                    <button className="btn-remove">Remove</button>
                  </div>
                </div>
              </div>

              <div className="saved-item-card">
                <div className="saved-item-image"></div>
                <div className="saved-item-info">
                  <h3>Halo Diamond Ring</h3>
                  <p>Platinum | Princess Cut</p>
                  <div className="saved-item-price">$4,200</div>
                  <div className="saved-item-actions">
                    <button className="btn-add-cart">Add to Cart</button>
                    <button className="btn-remove">Remove</button>
                  </div>
                </div>
              </div>

              <div className="saved-item-card">
                <div className="saved-item-image"></div>
                <div className="saved-item-info">
                  <h3>Eternity Band</h3>
                  <p>18K Rose Gold | Round</p>
                  <div className="saved-item-price">$1,950</div>
                  <div className="saved-item-actions">
                    <button className="btn-add-cart">Add to Cart</button>
                    <button className="btn-remove">Remove</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Addresses Section */}
          <div className={`profile-section ${activeTab === 3 ? 'active' : ''}`}>
            <div className="section-header">
              <h1>Saved Addresses</h1>
              <p>Manage your shipping and billing addresses</p>
            </div>

            <div className="addresses-grid">
              <div className="address-card default">
                <span className="address-badge">Default</span>
                <h3>Home</h3>
                <p>
                  John Doe<br />
                  123 Main Street, Apt 4B<br />
                  New York, NY 10001<br />
                  United States<br />
                  Phone: +1 (555) 123-4567
                </p>
                <div className="address-actions">
                  <button className="btn-edit">Edit</button>
                  <button className="btn-delete">Delete</button>
                </div>
              </div>

              <div className="address-card">
                <h3>Work</h3>
                <p>
                  John Doe<br />
                  456 Business Ave, Suite 100<br />
                  New York, NY 10002<br />
                  United States<br />
                  Phone: +1 (555) 987-6543
                </p>
                <div className="address-actions">
                  <button className="btn-edit">Edit</button>
                  <button className="btn-delete">Delete</button>
                </div>
              </div>
            </div>

            <button className="btn-add-address">+ Add New Address</button>
          </div>

          {/* Settings Section */}
          <div className={`profile-section ${activeTab === 4 ? 'active' : ''}`}>
            <div className="section-header">
              <h1>Account Settings</h1>
              <p>Manage your preferences and notifications</p>
            </div>

            <div className="settings-section">
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Email Notifications</h3>
                  <p>Receive updates about your orders and special offers</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h3>SMS Notifications</h3>
                  <p>Get text messages about order updates</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h3>Marketing Communications</h3>
                  <p>Receive newsletters and promotional content</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h3>Two-Factor Authentication</h3>
                  <p>Add an extra layer of security to your account</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}