'use client';
import { useEffect, useState } from 'react';
import { Settings, RefreshCw, Copy, Wrench, FileText, ShieldCheck, Upload, Trash2, ExternalLink, FileDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import PageLoader from '@/components/common/PageLoader';
import ConfirmModal from '@/components/common/ConfirmModal';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loggedInUserdata, setLoggedInUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [rotateModalOpen, setRotateModalOpen] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [adminPortalUrl, setAdminPortalUrl] = useState('');
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [maintenanceStartsAt, setMaintenanceStartsAt] = useState('');
  const [maintenanceEndsAt, setMaintenanceEndsAt] = useState('');
  const [maintenanceStatus, setMaintenanceStatus] = useState('inactive');

  // Legal Policies State
  const [policies, setPolicies] = useState({
    terms: { page_name: 'Terms & Conditions', content: '', pdf_url: null, status: true },
    privacy: { page_name: 'Privacy Policy', content: '', pdf_url: null, status: true },
  });
  const [selectedPolicySlug, setSelectedPolicySlug] = useState('terms');
  const [policyLoading, setPolicyLoading] = useState(false);
  const [policySaving, setPolicySaving] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [removePdfFlag, setRemovePdfFlag] = useState(false);
  const router = useRouter();

  const toDatetimeLocal = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const fetchAdminSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch('/api/Admin/Settings', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAdminPortalUrl(data.adminPortal?.url || '');
      setMaintenanceEnabled(Boolean(data.maintenance?.enabled));
      setMaintenanceMessage(data.maintenance?.message || '');
      setMaintenanceStartsAt(toDatetimeLocal(data.maintenance?.startsAt));
      setMaintenanceEndsAt(toDatetimeLocal(data.maintenance?.endsAt));
      setMaintenanceStatus(data.maintenance?.status || 'inactive');
    } catch (err) {
      toast.error(err.message || 'Failed to load settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      const res = await fetch('/api/Admin/Settings', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maintenanceEnabled,
          maintenanceMessage,
          maintenanceStartsAt: maintenanceEnabled ? new Date(maintenanceStartsAt).toISOString() : null,
          maintenanceEndsAt: maintenanceEnabled ? new Date(maintenanceEndsAt).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMaintenanceStatus(data.maintenance?.status || 'inactive');
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleRotateRoute = async () => {
    setRotating(true);
    try {
      const res = await fetch('/api/Admin/Settings/rotate-route', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAdminPortalUrl(data.adminPortal?.url || '');
      setRotateModalOpen(false);
      toast.success('New admin portal URL generated. Save it — old links no longer work.');
    } catch (err) {
      toast.error(err.message || 'Failed to rotate route');
    } finally {
      setRotating(false);
    }
  };

  const copyPortalUrl = () => {
    if (!adminPortalUrl) return;
    navigator.clipboard.writeText(adminPortalUrl);
    toast.success('Admin portal URL copied');
  };

  const fetchPolicies = async () => {
    setPolicyLoading(true);
    try {
      const res = await fetch('/api/Admin/Policies', { credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.success && data.policies) {
        setPolicies(data.policies);
      }
    } catch (err) {
      console.error('Failed to load policies:', err);
    } finally {
      setPolicyLoading(false);
    }
  };

  const handlePolicyFieldChange = (field, value) => {
    setPolicies(prev => ({
      ...prev,
      [selectedPolicySlug]: {
        ...prev[selectedPolicySlug],
        [field]: value,
      }
    }));
  };

  const handleSavePolicy = async () => {
    setPolicySaving(true);
    try {
      const current = policies[selectedPolicySlug] || {};
      const formData = new FormData();
      formData.append('slug', selectedPolicySlug);
      formData.append('page_name', current.page_name || (selectedPolicySlug === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'));
      formData.append('content', current.content || '');
      formData.append('status', String(current.status !== false));

      if (pdfFile) {
        formData.append('pdf_file', pdfFile);
      } else if (removePdfFlag) {
        formData.append('remove_pdf', 'true');
      }

      const res = await fetch('/api/Admin/Policies', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save policy');
      }

      toast.success(data.message || 'Policy saved successfully!');
      setPdfFile(null);
      setRemovePdfFlag(false);
      if (data.policy) {
        setPolicies(prev => ({
          ...prev,
          [selectedPolicySlug]: data.policy,
        }));
      }
    } catch (err) {
      console.error('Error saving policy:', err);
      toast.error(err.message || 'Failed to save policy');
    } finally {
      setPolicySaving(false);
    }
  };

  useEffect(() => {
    //Backend API Call
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/Admin/Profile', {
          credentials: 'include',
        });

        const data = await response.json();

        if(!response.ok) {
          throw new Error(data?.message || 'Failed to fetch profile data');
        }
        setLoggedInUserData(data);
        setUser({
          id: data.id || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          password: '',
          role: data.role || 'admin'
        });
      } catch (error) {
        console.error("Profile Fetching From API Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
    fetchAdminSettings();
    fetchPolicies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);



  const handleCurrentAdmin = async (e) => {
    e.preventDefault();
    if (!user) return;
    setProfileSaving(true);

    try {
      const response = await fetch("/api/Admin/Profile", {
        method: "PUT",
        credentials: 'include',
        headers: {
          'Content-Type': "application/json"
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Profile Update Failed");
      }

      toast.success("Profile Updated Successfully.");
      setLoggedInUserData({ ...loggedInUserdata, ...user, password: '' });
      setUser({ ...user, password: '' });
    } catch (error) {
      console.error("Admin Profile Updation Error:", error);
      toast.error(error.message);
    } finally {
      setProfileSaving(false);
    }
  }

  if (loading) return <PageLoader admin label="Loading admin profile" />;

  return (
    <>      <style dangerouslySetInnerHTML={{__html: `
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

        /* Profile Container */
        .profile-container {
          max-width: 800px;
          margin: 30px auto;
          padding: 0 20px;
          min-height: calc(100vh - 120px);
        }

        /* Main Content */
        .profile-content {
          background: var(--light-bg);
          border: 1px solid var(--border-light);
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
        }

        .profile-section {
          margin-bottom: 0;
        }

        .profile-divider {
          height: 1px;
          background: var(--border-light);
          margin: 40px 0;
        }

        .section-header {
          margin-bottom: 30px;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 16px;
        }

        .section-header h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 30px;
          color: var(--text-dark);
          margin-bottom: 6px;
          font-weight: 600;
        }

        .section-header p {
          font-size: 14px;
          color: #666;
        }

        /* Form Styles */
        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 11px;
          font-weight: 600;
          color: #666;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .form-input,
        .form-select,
        .form-textarea {
          padding: 12px 16px;
          border: 1px solid var(--border-light);
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          transition: all 0.3s ease;
          background: #fafafa;
          color: var(--text-dark);
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: var(--primary-gold);
          background: white;
          box-shadow: 0 0 0 3px rgba(212,175,55,0.1);
        }

        .form-input:disabled,
        .form-input[readonly] {
          background: #f5f5f5;
          color: #888;
          cursor: not-allowed;
        }

        .save-btn {
          padding: 12px 24px;
          background: var(--primary-gold);
          color: white;
          border: none;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 6px;
          width: fit-content;
        }

        .save-btn:hover {
          background: var(--accent-rose);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(212,175,55,0.25);
        }

        /* Settings */
        .settings-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .setting-item {
          padding: 20px;
          border: 1px solid var(--border-light);
          border-radius: 8px;
          background: #fafafa;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .setting-info h3 {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .setting-info p {
          font-size: 13px;
          color: #666;
        }

        .toggle-switch {
          position: relative;
          width: 50px;
          height: 26px;
          flex-shrink: 0;
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
          transition: 0.3s;
          border-radius: 30px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .toggle-switch input:checked + .toggle-slider {
          background-color: var(--primary-gold);
        }

        .toggle-switch input:checked + .toggle-slider:before {
          transform: translateX(24px);
        }

        /* Policy Management Styles */
        .policy-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 12px;
        }
        .policy-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          border-radius: 6px;
          border: 1px solid var(--border-light);
          background: #fafafa;
          color: #555;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .policy-tab-btn:hover {
          border-color: #aaa;
        }
        .policy-tab-btn.active {
          background: #1a1a1a;
          color: #fff;
          border-color: #1a1a1a;
        }
        .policy-meta-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fafafa;
          border: 1px solid var(--border-light);
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .policy-pdf-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #fdfbf7;
          border: 1px solid #e8dec8;
          border-radius: 8px;
          margin-top: 8px;
          flex-wrap: wrap;
          gap: 10px;
        }

        /* Responsive */
        @media (max-width: 767px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .profile-content {
            padding: 24px;
          }
        }
      `}} />

    {/* Navigation */}
    {/* <nav className="auth-nav">
        <div className="logo" onClick={() => window.location.href = '/Pages/Admin'}>Zulu Jewellers</div>
        <a href="/Pages/Admin" className="nav-link">← Back to Home</a>
    </nav> */}

      <div className="profile-container">
        {/* Main Content */}
        <main className="profile-content">
          {/* Account Details Section */}
          <div className="profile-section">
            <div className="section-header">
              <h1>Account Details</h1>
              <p>Manage your personal information</p>
            </div>

            <form id="profileForm" className="profile-form" onSubmit={handleCurrentAdmin}>
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

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                  type="email"
                  className="form-input"
                  value={user?.email || ''}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                  type="text"
                  className="form-input"
                  value={user?.phone || ''}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">New Password (leave blank to keep current)</label>
                  <input
                  type="password"
                  className="form-input"
                  value={user?.password || ''}
                  onChange={(e) => setUser({ ...user, password: e.target.value })}
                  placeholder="••••••••••••"
                  minLength={12}
                  maxLength={72}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input
                  type="text"
                  className="form-input"
                  value={user?.role || 'admin'}
                  disabled
                  style={{ background: '#f5f5f5', color: '#888', cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="save-btn"
                disabled={profileSaving}
                style={{ marginTop: '8px', maxWidth: '200px' }}
              >
                {profileSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* Divider */}
          <div className="profile-divider"></div>

          {/* Settings Section */}
          <div className="profile-section">
            <div className="section-header">
              <h1>Site Settings</h1>
              <p>Maintenance mode and admin portal security</p>
            </div>

            {settingsLoading ? (
              <p style={{ color: '#888', fontSize: '14px' }}>Loading settings...</p>
            ) : (
              <div className="settings-section">
                {/* Maintenance Mode */}
                <div className="setting-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                    <div className="setting-info">
                      <h3><Wrench size={16} style={{ display: 'inline', marginRight: '6px' }} />Maintenance Mode</h3>
                      <p>Visitors only see the maintenance page during the scheduled window</p>
                      <span style={{
                        display: 'inline-block',
                        marginTop: '8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: maintenanceStatus === 'active' ? '#c0392b' : '#CEA268',
                      }}>
                        Status: {maintenanceStatus === 'active' ? 'Live now' : maintenanceEnabled ? 'Scheduled / outside window' : 'Inactive'}
                      </span>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={maintenanceEnabled}
                        onChange={(e) => setMaintenanceEnabled(e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  {maintenanceEnabled && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                      <div>
                        <label className="form-label">Start</label>
                        <input
                          type="datetime-local"
                          className="form-input"
                          value={maintenanceStartsAt}
                          onChange={(e) => setMaintenanceStartsAt(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label">End</label>
                        <input
                          type="datetime-local"
                          className="form-input"
                          value={maintenanceEndsAt}
                          onChange={(e) => setMaintenanceEndsAt(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label">Message for visitors</label>
                        <textarea
                          className="form-input"
                          rows={3}
                          value={maintenanceMessage}
                          onChange={(e) => setMaintenanceMessage(e.target.value)}
                          placeholder="We are upgrading our store. Please check back soon."
                          style={{ resize: 'vertical', minHeight: '80px' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin Portal Route */}
                <div className="setting-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
                  <div className="setting-info">
                    <h3>Admin Portal URL</h3>
                    <p>Only this link allows admin login. Rotate to invalidate old URLs.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      readOnly
                      value={adminPortalUrl}
                      className="form-input"
                      style={{ flex: 1, minWidth: '200px', background: '#f9f9f9', fontSize: '12px' }}
                    />
                    <button type="button" className="save-btn" style={{ flex: 'none', padding: '10px 16px' }} onClick={copyPortalUrl}>
                      <Copy size={14} style={{ display: 'inline', marginRight: '4px' }} /> Copy
                    </button>
                    <button
                      type="button"
                      className="save-btn"
                      style={{ flex: 'none', padding: '10px 16px', background: '#CEA268', borderColor: '#CEA268' }}
                      onClick={() => setRotateModalOpen(true)}
                    >
                      <RefreshCw size={14} style={{ display: 'inline', marginRight: '4px' }} /> Rotate
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className="save-btn"
                  onClick={handleSaveSettings}
                  disabled={settingsSaving}
                  style={{ marginTop: '8px', maxWidth: '200px' }}
                >
                  {settingsSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="profile-divider"></div>

          {/* Legal Policies Section */}
          <div className="profile-section">
            <div className="section-header">
              <h1>Legal & Policies</h1>
              <p>Upload and manage Terms & Conditions and Privacy Policy for the customer storefront</p>
            </div>

            {policyLoading ? (
              <p style={{ color: '#888', fontSize: '14px' }}>Loading policies...</p>
            ) : (
              <div>
                {/* Tabs */}
                <div className="policy-tabs">
                  <button
                    type="button"
                    className={`policy-tab-btn ${selectedPolicySlug === 'terms' ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedPolicySlug('terms');
                      setPdfFile(null);
                      setRemovePdfFlag(false);
                    }}
                  >
                    <FileText size={15} /> Terms & Conditions
                  </button>
                  <button
                    type="button"
                    className={`policy-tab-btn ${selectedPolicySlug === 'privacy' ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedPolicySlug('privacy');
                      setPdfFile(null);
                      setRemovePdfFlag(false);
                    }}
                  >
                    <ShieldCheck size={15} /> Privacy Policy
                  </button>
                </div>

                {/* Status and Storefront link bar */}
                <div className="policy-meta-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>
                      Storefront Status:
                    </span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background: policies[selectedPolicySlug]?.status !== false ? '#e8f5e9' : '#fff3e0',
                      color: policies[selectedPolicySlug]?.status !== false ? '#2e7d32' : '#e65100',
                    }}>
                      {policies[selectedPolicySlug]?.status !== false ? 'Published (Live)' : 'Draft (Hidden)'}
                    </span>
                    <label className="toggle-switch" style={{ marginLeft: '4px' }}>
                      <input
                        type="checkbox"
                        checked={policies[selectedPolicySlug]?.status !== false}
                        onChange={(e) => handlePolicyFieldChange('status', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <a
                    href={selectedPolicySlug === 'terms' ? '/Pages/terms' : '/Pages/privacy'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      color: '#D4AF37',
                      fontSize: '13px',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    View Live Page <ExternalLink size={14} />
                  </a>
                </div>

                {/* Policy Edit Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Page Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={policies[selectedPolicySlug]?.page_name || ''}
                      onChange={(e) => handlePolicyFieldChange('page_name', e.target.value)}
                      placeholder={selectedPolicySlug === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Policy Content (HTML / Formatted Text)
                    </label>
                    <p style={{ fontSize: '12px', color: '#777', marginTop: '-4px', marginBottom: '4px' }}>
                      Type or paste your policy sections. Standard HTML tags (&lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;) are fully supported.
                    </p>
                    <textarea
                      className="form-input"
                      rows={12}
                      value={policies[selectedPolicySlug]?.content || ''}
                      onChange={(e) => handlePolicyFieldChange('content', e.target.value)}
                      placeholder="Enter policy content..."
                      style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.5' }}
                    />
                  </div>

                  {/* Official PDF Document Upload */}
                  <div className="form-group">
                    <label className="form-label">Official PDF Document (Upload Attachment)</label>
                    <p style={{ fontSize: '12px', color: '#777', marginTop: '-4px', marginBottom: '8px' }}>
                      Upload an official signed or formatted PDF document. Customers can view or download it directly from the policy page.
                    </p>

                    {policies[selectedPolicySlug]?.pdf_url && !removePdfFlag ? (
                      <div className="policy-pdf-box">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileDown size={18} color="#D4AF37" />
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#2c2c2c' }}>
                            Current PDF:
                          </span>
                          <a
                            href={policies[selectedPolicySlug].pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '13px', color: '#D4AF37', textDecoration: 'underline' }}
                          >
                            Download / View PDF
                          </a>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setRemovePdfFlag(true);
                            setPdfFile(null);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#fee2e2',
                            color: '#b91c1c',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={13} /> Remove PDF
                        </button>
                      </div>
                    ) : null}

                    {removePdfFlag && (
                      <div style={{ fontSize: '12px', color: '#b91c1c', marginTop: '6px', fontStyle: 'italic' }}>
                        PDF will be removed upon saving. You can also upload a new file below.
                      </div>
                    )}

                    <div style={{ marginTop: '10px' }}>
                      <input
                        type="file"
                        accept="application/pdf"
                        id="policy-pdf-input"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setPdfFile(e.target.files[0]);
                            setRemovePdfFlag(false);
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                      <label
                        htmlFor="policy-pdf-input"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 18px',
                          border: '1px dashed #D4AF37',
                          borderRadius: '8px',
                          background: '#fff9e6',
                          color: '#8c6d1f',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <Upload size={16} /> {pdfFile ? `Selected: ${pdfFile.name}` : policies[selectedPolicySlug]?.pdf_url && !removePdfFlag ? 'Replace PDF Document' : 'Upload Official PDF Document'}
                      </label>
                      {pdfFile && (
                        <button
                          type="button"
                          onClick={() => setPdfFile(null)}
                          style={{
                            marginLeft: '10px',
                            background: 'none',
                            border: 'none',
                            color: '#999',
                            cursor: 'pointer',
                            fontSize: '12px',
                            textDecoration: 'underline'
                          }}
                        >
                          Cancel file
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="save-btn"
                    onClick={handleSavePolicy}
                    disabled={policySaving}
                    style={{ marginTop: '12px', maxWidth: '240px' }}
                  >
                    {policySaving ? 'Saving Policy...' : `Save ${selectedPolicySlug === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}`}
                  </button>
                </div>
              </div>
            )}
          </div>

        <ConfirmModal
          isOpen={rotateModalOpen}
          onClose={() => setRotateModalOpen(false)}
          onConfirm={handleRotateRoute}
          title="Rotate Admin Portal URL?"
          message="This generates a new admin login URL. All old portal links will stop working immediately. Make sure to copy and save the new URL."
          confirmText={rotating ? 'Rotating...' : 'Rotate URL'}
          cancelText="Cancel"
          type="warning"
          icon={<RefreshCw size={24} />}
        />
        </main>
      </div>
    </>
  );
}
