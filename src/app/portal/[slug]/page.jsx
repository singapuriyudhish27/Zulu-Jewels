'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Eye, EyeOff, Shield } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function AdminPortalLoginPage() {
  const { slug } = useParams();
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
            <Image
              src="/Vector 1.png"
              alt="Zulu Jewellers Admin"
              width={56}
              height={56}
              priority
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
    padding: 16px 20px;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    background: radial-gradient(ellipse 110% 90% at 50% -10%, #1f1a14 0%, #0a0a0a 50%, #050505 100%);
    font-family: 'Montserrat', sans-serif;
    color: #f5f0e8;
  }

  .portal-bg-glow {
    position: absolute;
    width: 480px;
    height: 480px;
    border-radius: 50%;
    filter: blur(110px);
    opacity: 0.32;
    pointer-events: none;
  }

  .portal-bg-glow--left {
    top: -140px;
    left: -120px;
    background: radial-gradient(circle, #CEA268 0%, transparent 68%);
    animation: portal-float 11s ease-in-out infinite;
  }

  .portal-bg-glow--right {
    bottom: -100px;
    right: -140px;
    background: radial-gradient(circle, #6b5220 0%, transparent 70%);
    animation: portal-float 13s ease-in-out infinite reverse;
  }

  .portal-grain {
    position: absolute;
    inset: 0;
    opacity: 0.045;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  @keyframes portal-float {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(20px, 14px); }
  }

  .portal-card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 400px;
    max-height: calc(100dvh - 32px);
    padding: 26px 32px 20px;
    box-sizing: border-box;
    overflow: hidden;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: linear-gradient(
      168deg,
      rgba(255, 255, 255, 0.07) 0%,
      rgba(255, 255, 255, 0.02) 45%,
      rgba(0, 0, 0, 0.25) 100%
    );
    border: 1px solid rgba(206, 162, 104, 0.28);
    border-radius: 2px;
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.05) inset,
      0 40px 100px rgba(0, 0, 0, 0.6),
      0 0 140px rgba(206, 162, 104, 0.1);
    backdrop-filter: blur(14px);
    animation: portal-fade-up 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  @keyframes portal-fade-up {
    from {
      opacity: 0;
      transform: translateY(24px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .portal-logo-wrap {
    position: relative;
    width: 72px;
    height: 72px;
    margin: 0 auto 10px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .portal-logo-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1px solid rgba(206, 162, 104, 0.45);
    animation: portal-pulse-ring 3.2s ease-in-out infinite;
  }

  @keyframes portal-pulse-ring {
    0%, 100% {
      transform: scale(1);
      opacity: 0.55;
    }
    50% {
      transform: scale(1.07);
      opacity: 1;
    }
  }

  .portal-logo {
    position: relative;
    z-index: 1;
    filter: drop-shadow(0 4px 28px rgba(206, 162, 104, 0.4));
  }

  .portal-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 12px;
    margin-bottom: 10px;
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #CEA268;
    background: rgba(206, 162, 104, 0.1);
    border: 1px solid rgba(206, 162, 104, 0.25);
    border-radius: 100px;
  }

  .portal-eyebrow {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: rgba(206, 162, 104, 0.75);
    margin: 0 0 4px;
  }

  .portal-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(28px, 4.5vh, 38px);
    font-weight: 400;
    line-height: 1.1;
    color: #fff;
    letter-spacing: 0.03em;
    margin: 0;
  }

  .portal-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin: 10px 0 8px;
  }

  .portal-divider-line {
    width: 52px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #CEA268, transparent);
  }

  .portal-divider-diamond {
    font-size: 7px;
    color: #CEA268;
  }

  .portal-subtitle {
    font-size: 12px;
    line-height: 1.45;
    color: rgba(245, 240, 232, 0.55);
    margin: 0 0 16px;
    max-width: 300px;
  }

  .portal-form {
    text-align: left;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .portal-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .portal-label {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(206, 162, 104, 0.85);
  }

  .portal-input-wrap {
    position: relative;
  }

  .portal-input {
    width: 100%;
    padding: 11px 12px;
    font-family: 'Montserrat', sans-serif;
    font-size: 13px;
    color: #f5f0e8;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(206, 162, 104, 0.2);
    border-radius: 2px;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
  }

  .portal-input::placeholder {
    color: rgba(245, 240, 232, 0.25);
  }

  .portal-input:focus {
    border-color: rgba(206, 162, 104, 0.55);
    background: rgba(0, 0, 0, 0.45);
    box-shadow: 0 0 0 3px rgba(206, 162, 104, 0.12);
  }

  .portal-input--password {
    padding-right: 48px;
  }

  .portal-password-toggle {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: rgba(206, 162, 104, 0.5);
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
    overflow: hidden;
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #0a0a0a;
    background: linear-gradient(135deg, #e8d4a8 0%, #CEA268 45%, #a88442 100%);
    border: none;
    border-radius: 2px;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.25s ease, opacity 0.2s ease;
    box-shadow:
      0 4px 24px rgba(206, 162, 104, 0.35),
      0 0 0 1px rgba(255, 255, 255, 0.15) inset;
  }

  .portal-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow:
      0 8px 32px rgba(206, 162, 104, 0.45),
      0 0 0 1px rgba(255, 255, 255, 0.2) inset;
  }

  .portal-submit:active:not(:disabled) {
    transform: translateY(0);
  }

  .portal-submit:disabled {
    opacity: 0.65;
    cursor: wait;
  }

  .portal-submit-text {
    position: relative;
    z-index: 1;
  }

  .portal-submit-shine {
    position: absolute;
    top: 0;
    left: -100%;
    width: 60%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.35),
      transparent
    );
    animation: portal-shine 4s ease-in-out infinite;
  }

  @keyframes portal-shine {
    0%, 100% { left: -100%; }
    50% { left: 140%; }
  }

  .portal-footnote {
    margin-top: 12px;
    font-size: 10px;
    line-height: 1.45;
    color: rgba(245, 240, 232, 0.3);
    letter-spacing: 0.02em;
  }

  .portal-footer {
    margin-top: 8px;
    font-size: 10px;
    letter-spacing: 0.06em;
    color: rgba(245, 240, 232, 0.22);
  }

  @media (max-width: 480px) {
    .portal-page {
      padding: 12px 16px;
    }

    .portal-card {
      padding: 22px 20px 16px;
      max-height: calc(100dvh - 24px);
    }

    .portal-logo-wrap {
      width: 64px;
      height: 64px;
    }
  }

  @media (max-height: 640px) {
    .portal-card {
      padding: 18px 24px 14px;
    }

    .portal-logo-wrap {
      width: 56px;
      height: 56px;
      margin-bottom: 8px;
    }

    .portal-badge {
      margin-bottom: 6px;
    }

    .portal-title {
      font-size: 26px;
    }

    .portal-divider {
      margin: 8px 0 6px;
    }

    .portal-subtitle {
      margin-bottom: 12px;
      font-size: 11px;
    }

    .portal-form {
      gap: 10px;
    }

    .portal-footnote,
    .portal-footer {
      margin-top: 6px;
    }
  }
`;
