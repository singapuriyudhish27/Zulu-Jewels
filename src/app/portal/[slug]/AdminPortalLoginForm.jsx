'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Shield } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function AdminPortalLoginForm({ slug }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, portalSlug: slug }),
      });

      const data = await response.json();

      if (response.ok && data.user?.role === 'admin') {
        toast.success('Welcome to Admin Panel');
        router.push(`/portal/${slug}/panel`);
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch {
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: portalStyles }} />
      <div className="portal-page">
        <div className="portal-bg-glow portal-bg-glow--left" />
        <div className="portal-bg-glow portal-bg-glow--right" />
        <div className="portal-grain" />

        <main className="portal-card">
          <div className="portal-logo-wrap">
            <div className="portal-logo-ring" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Vector 1.png"
              alt="Zulu Jewellers Admin"
              className="portal-logo"
            />
          </div>

          <div className="portal-badge">
            <Shield size={12} strokeWidth={2} />
            <span>Secure Admin Access</span>
          </div>

          <p className="portal-eyebrow">Zulu Jewellers</p>
          <h1 className="portal-title">Admin Portal</h1>

          <div className="portal-divider">
            <span className="portal-divider-line" />
            <span className="portal-divider-diamond">◆</span>
            <span className="portal-divider-line" />
          </div>

          <p className="portal-subtitle">
            Sign in to manage your boutique, orders, and collections.
          </p>

          <form className="portal-form" onSubmit={handleLogin}>
            <div className="portal-field">
              <label className="portal-label" htmlFor="admin-email">
                Email Address
              </label>
              <input
                id="admin-email"
                type="email"
                className="portal-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="portal-field">
              <label className="portal-label" htmlFor="admin-password">
                Password
              </label>
              <div className="portal-input-wrap">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  className="portal-input portal-input--password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="portal-password-toggle"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="portal-submit"
              disabled={loading}
            >
              <span className="portal-submit-text">
                {loading ? 'Authenticating...' : 'Enter Admin Panel'}
              </span>
              {!loading && <span className="portal-submit-shine" />}
            </button>
          </form>

          <p className="portal-footnote">
            Authorized personnel only. This session is private and encrypted.
          </p>
          <footer className="portal-footer">
            <span>© {new Date().getFullYear()} Zulu Jewellers · Admin</span>
          </footer>
        </main>
      </div>
    </>
  );
}

const portalStyles = `
  html, body {
    margin: 0;
    overflow: hidden;
    height: 100%;
  }

  .portal-page {
    height: 100dvh;
    max-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    background: #0D0C09;
    font-family: 'Montserrat', sans-serif;
    color: #F5EFE3;
  }

  .portal-grain {
    position: absolute;
    inset: 0;
    opacity: 0.04;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  .portal-card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 400px;
    padding: 40px 36px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #1A1712;
    border: 1px solid rgba(206, 162, 104, 0.3);
    border-radius: 2px;
    box-shadow:
      0 0 80px rgba(206, 162, 104, 0.06),
      0 24px 64px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(206, 162, 104, 0.12) inset;
    animation: portal-fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes portal-fade-up {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .portal-logo-wrap {
    position: relative;
    width: 64px;
    height: 64px;
    margin: 0 auto 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .portal-logo {
    position: relative;
    z-index: 1;
  }

  .portal-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 12px;
    margin-bottom: 12px;
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #CEA268;
    background: rgba(206, 162, 104, 0.08);
    border: 1px solid rgba(206, 162, 104, 0.25);
    border-radius: 100px;
  }

  .portal-eyebrow {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #7A6A55;
    margin: 0 0 4px;
  }

  .portal-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(24px, 4vh, 32px);
    font-weight: 400;
    line-height: 1.2;
    color: #F5EFE3;
    letter-spacing: 0.02em;
    margin: 0;
  }

  .portal-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin: 8px 0;
    width: 100%;
  }

  .portal-divider-line {
    width: 40px;
    height: 1px;
    background: rgba(206, 162, 104, 0.25);
  }

  .portal-divider-diamond {
    font-size: 7px;
    color: #CEA268;
  }

  .portal-subtitle {
    font-size: 12px;
    line-height: 1.5;
    color: #9E8E78;
    margin: 0 0 20px;
  }

  .portal-form {
    text-align: left;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .portal-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .portal-label {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #7A6A55;
  }

  .portal-input-wrap {
    position: relative;
  }

  .portal-input {
    width: 100%;
    padding: 10px 12px;
    font-family: 'Montserrat', sans-serif;
    font-size: 13px;
    color: #F5EFE3;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(206, 162, 104, 0.2);
    border-radius: 2px;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.2s ease, background 0.2s ease;
  }

  .portal-input::placeholder {
    color: #5A4E3E;
  }

  .portal-input:focus {
    border-color: rgba(206, 162, 104, 0.6);
    background: rgba(255, 255, 255, 0.07);
  }

  .portal-input--password {
    padding-right: 40px;
  }

  .portal-password-toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #5A4E3E;
    padding: 4px;
    display: flex;
    align-items: center;
    transition: color 0.2s ease;
  }

  .portal-password-toggle:hover {
    color: #CEA268;
  }

  .portal-submit {
    position: relative;
    margin-top: 4px;
    padding: 12px 20px;
    width: 100%;
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #1A1712;
    background: #CEA268;
    border: none;
    border-radius: 2px;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }

  .portal-submit:hover:not(:disabled) {
    opacity: 0.9;
  }

  .portal-submit:disabled {
    opacity: 0.65;
    cursor: wait;
  }

  .portal-submit-text {
    position: relative;
    z-index: 1;
  }

  .portal-footnote {
    margin-top: 16px;
    font-size: 10px;
    line-height: 1.5;
    color: #5A4E3E;
    text-align: center;
  }

  .portal-footer {
    margin-top: 12px;
    font-size: 10px;
    color: #5A4E3E;
  }

  @media (max-width: 480px) {
    .portal-page {
      padding: 16px;
    }

    .portal-card {
      padding: 24px 20px;
    }
  }
`;
