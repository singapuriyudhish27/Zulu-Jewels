'use client';
import { useEffect, useState } from 'react';
import { Settings, RefreshCw, Copy, Wrench } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
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