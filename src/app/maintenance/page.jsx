'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';

function formatDateTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTimeRemaining(endIso) {
  const diff = new Date(endIso).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function MaintenancePage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/maintenance/status');
        const data = await res.json();
        setStatus(data);
        if (!data.active) {
          window.location.href = '/Pages';
        }
      } catch {
        setStatus({
          active: true,
          message: 'We are carefully refining your experience. Please return shortly.',
        });
      } finally {
        setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!status?.endsAt) return;

    const tick = () => {
      const remaining = getTimeRemaining(status.endsAt);
      if (!remaining) {
        window.location.href = '/Pages';
        return;
      }
      setCountdown(remaining);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [status?.endsAt]);

  const countdownUnits = useMemo(
    () =>
      countdown
        ? [
            { label: 'Days', value: countdown.days },
            { label: 'Hours', value: countdown.hours },
            { label: 'Minutes', value: countdown.minutes },
            { label: 'Seconds', value: countdown.seconds },
          ]
        : [],
    [countdown]
  );

  if (loading) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: maintenanceStyles }} />
        <div className="maint-page">
          <div className="maint-loader">
            <div className="maint-loader-ring" />
            <span className="maint-loader-text">Preparing something beautiful</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: maintenanceStyles }} />
      <div className="maint-page">
        <div className="maint-bg-glow maint-bg-glow--left" />
        <div className="maint-bg-glow maint-bg-glow--right" />
        <div className="maint-grain" />

        <main className="maint-card">
          <div className="maint-logo-wrap">
            <div className="maint-logo-ring" />
            <Image
              src="/Vector 1.png"
              alt="Zulu Jewellers"
              width={56}
              height={56}
              priority
              className="maint-logo"
            />
          </div>

          <p className="maint-eyebrow">Scheduled Maintenance</p>

          <h1 className="maint-title">We&apos;ll Return Shortly</h1>

          <div className="maint-divider">
            <span className="maint-divider-line" />
            <span className="maint-divider-diamond">◆</span>
            <span className="maint-divider-line" />
          </div>

          <p className="maint-message">
            {status?.message ||
              'Our atelier is undergoing a brief enhancement. Thank you for your patience while we polish every detail for you.'}
          </p>

          {status?.endsAt && countdownUnits.length > 0 && (
            <div className="maint-countdown">
              <p className="maint-countdown-label">Reopening in</p>
              <div className="maint-countdown-grid">
                {countdownUnits.map((unit) => (
                  <div key={unit.label} className="maint-countdown-unit">
                    <span className="maint-countdown-value">
                      {String(unit.value).padStart(2, '0')}
                    </span>
                    <span className="maint-countdown-name">{unit.label}</span>
                  </div>
                ))}
              </div>
              <p className="maint-return-date">
                Expected return · {formatDateTime(status.endsAt)}
              </p>
            </div>
          )}

          <p className="maint-tagline">Lab-Grown Diamond Jewelry · Timeless Craftsmanship</p>
          <footer className="maint-footer">
            <span>© {new Date().getFullYear()} Zulu Jewellers</span>
          </footer>
        </main>
      </div>
    </>
  );
}

const maintenanceStyles = `
  html, body {
    margin: 0;
    overflow: hidden;
    height: 100%;
  }

  .maint-page {
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
    background: radial-gradient(ellipse 120% 80% at 50% 0%, #1f1a14 0%, #0a0a0a 55%, #050505 100%);
    font-family: 'Montserrat', sans-serif;
    color: #f5f0e8;
  }

  .maint-bg-glow {
    position: absolute;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.35;
    pointer-events: none;
  }

  .maint-bg-glow--left {
    top: -120px;
    left: -100px;
    background: radial-gradient(circle, #CEA268 0%, transparent 70%);
    animation: maint-float 12s ease-in-out infinite;
  }

  .maint-bg-glow--right {
    bottom: -80px;
    right: -120px;
    background: radial-gradient(circle, #8b6914 0%, transparent 70%);
    animation: maint-float 14s ease-in-out infinite reverse;
  }

  .maint-grain {
    position: absolute;
    inset: 0;
    opacity: 0.04;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  @keyframes maint-float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(24px, 16px) scale(1.05); }
  }

  .maint-card {
    position: relative;
    z-index: 1;
    max-width: 520px;
    width: 100%;
    max-height: calc(100dvh - 32px);
    text-align: center;
    padding: 28px 32px 22px;
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: linear-gradient(
      165deg,
      rgba(255, 255, 255, 0.06) 0%,
      rgba(255, 255, 255, 0.02) 40%,
      rgba(0, 0, 0, 0.2) 100%
    );
    border: 1px solid rgba(206, 162, 104, 0.25);
    border-radius: 2px;
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.04) inset,
      0 32px 80px rgba(0, 0, 0, 0.55),
      0 0 120px rgba(206, 162, 104, 0.08);
    backdrop-filter: blur(12px);
    animation: maint-fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  @keyframes maint-fade-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .maint-logo-wrap {
    position: relative;
    width: 72px;
    height: 72px;
    margin: 0 auto 12px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .maint-logo-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1px solid rgba(206, 162, 104, 0.4);
    animation: maint-pulse-ring 3s ease-in-out infinite;
  }

  @keyframes maint-pulse-ring {
    0%, 100% {
      transform: scale(1);
      opacity: 0.6;
    }
    50% {
      transform: scale(1.08);
      opacity: 1;
    }
  }

  .maint-logo {
    position: relative;
    z-index: 1;
    filter: drop-shadow(0 4px 24px rgba(206, 162, 104, 0.35));
  }

  .maint-eyebrow {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: #CEA268;
    margin: 0 0 6px;
  }

  .maint-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(28px, 4.5vh, 40px);
    font-weight: 400;
    line-height: 1.1;
    color: #fff;
    letter-spacing: 0.02em;
    margin: 0;
  }

  .maint-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin: 12px 0 10px;
  }

  .maint-divider-line {
    width: 56px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #CEA268, transparent);
  }

  .maint-divider-diamond {
    font-size: 8px;
    color: #CEA268;
    opacity: 0.9;
  }

  .maint-message {
    font-size: 13px;
    font-weight: 400;
    line-height: 1.5;
    color: rgba(245, 240, 232, 0.75);
    margin: 0 auto;
    max-width: 400px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .maint-countdown {
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid rgba(206, 162, 104, 0.15);
    width: 100%;
  }

  .maint-countdown-label {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(206, 162, 104, 0.85);
    margin-bottom: 10px;
  }

  .maint-countdown-grid {
    display: flex;
    justify-content: center;
    gap: 8px;
    flex-wrap: nowrap;
  }

  .maint-countdown-unit {
    flex: 1;
    max-width: 72px;
    min-width: 0;
    padding: 10px 6px 8px;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(206, 162, 104, 0.2);
    border-radius: 2px;
  }

  .maint-countdown-value {
    display: block;
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(22px, 3.5vh, 28px);
    font-weight: 500;
    color: #fff;
    line-height: 1;
    letter-spacing: 0.04em;
  }

  .maint-countdown-name {
    display: block;
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(206, 162, 104, 0.7);
    margin-top: 4px;
  }

  .maint-return-date {
    font-size: 11px;
    color: rgba(245, 240, 232, 0.45);
    margin-top: 10px;
    letter-spacing: 0.03em;
  }

  .maint-tagline {
    margin-top: 12px;
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(206, 162, 104, 0.5);
  }

  .maint-footer {
    margin-top: 10px;
    padding-top: 0;
    font-size: 10px;
    letter-spacing: 0.06em;
    color: rgba(245, 240, 232, 0.22);
  }

  .maint-loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }

  .maint-loader-ring {
    width: 48px;
    height: 48px;
    border: 1px solid rgba(206, 162, 104, 0.2);
    border-top-color: #CEA268;
    border-radius: 50%;
    animation: maint-spin 1s linear infinite;
  }

  @keyframes maint-spin {
    to { transform: rotate(360deg); }
  }

  .maint-loader-text {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(206, 162, 104, 0.6);
  }

  @media (max-width: 480px) {
    .maint-page {
      padding: 12px 16px;
    }

    .maint-card {
      padding: 22px 20px 18px;
      max-height: calc(100dvh - 24px);
    }

    .maint-logo-wrap {
      width: 64px;
      height: 64px;
      margin-bottom: 10px;
    }

    .maint-countdown-grid {
      gap: 6px;
    }

    .maint-countdown-unit {
      padding: 8px 4px 6px;
    }
  }

  @media (max-height: 640px) {
    .maint-card {
      padding: 20px 24px 16px;
    }

    .maint-logo-wrap {
      width: 56px;
      height: 56px;
      margin-bottom: 8px;
    }

    .maint-title {
      font-size: 26px;
    }

    .maint-divider {
      margin: 8px 0;
    }

    .maint-countdown {
      margin-top: 12px;
      padding-top: 10px;
    }

    .maint-tagline,
    .maint-footer {
      margin-top: 8px;
    }
  }
`;
