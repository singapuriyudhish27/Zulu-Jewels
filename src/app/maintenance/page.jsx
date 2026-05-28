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
    padding: 24px;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    background: #0D0C09;
    font-family: 'Montserrat', sans-serif;
    color: #F5EFE3;
  }

  .maint-grain {
    position: absolute;
    inset: 0;
    opacity: 0.04;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  .maint-card {
    position: relative;
    z-index: 1;
    max-width: 480px;
    width: 100%;
    text-align: center;
    padding: 44px 40px;
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
    animation: maint-fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes maint-fade-up {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .maint-logo-wrap {
    position: relative;
    width: 64px;
    height: 64px;
    margin: 0 auto 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .maint-logo {
    position: relative;
    z-index: 1;
  }

  .maint-eyebrow {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #CEA268;
    margin: 0 0 8px;
  }

  .maint-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(24px, 4vh, 32px);
    font-weight: 400;
    line-height: 1.2;
    color: #F5EFE3;
    letter-spacing: 0.02em;
    margin: 0 0 16px;
  }

  .maint-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin: 0 0 20px;
    width: 100%;
  }

  .maint-divider-line {
    width: 40px;
    height: 1px;
    background: rgba(206, 162, 104, 0.25);
  }

  .maint-divider-diamond {
    font-size: 8px;
    color: #CEA268;
  }

  .maint-message {
    font-size: 13px;
    font-weight: 400;
    line-height: 1.6;
    color: #9E8E78;
    margin: 0 auto;
    max-width: 360px;
  }

  .maint-countdown {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid rgba(206, 162, 104, 0.2);
    width: 100%;
  }

  .maint-countdown-label {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #CEA268;
    margin-bottom: 12px;
  }

  .maint-countdown-grid {
    display: flex;
    justify-content: center;
    gap: 12px;
  }

  .maint-countdown-unit {
    flex: 1;
    max-width: 64px;
    padding: 8px 4px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(206, 162, 104, 0.2);
    border-radius: 2px;
  }

  .maint-countdown-value {
    display: block;
    font-size: 22px;
    font-weight: 500;
    color: #F5EFE3;
    line-height: 1;
  }

  .maint-countdown-name {
    display: block;
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #7A6A55;
    margin-top: 4px;
  }

  .maint-return-date {
    font-size: 11px;
    color: #7A6A55;
    margin-top: 12px;
  }

  .maint-tagline {
    margin-top: 24px;
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #5A4E3E;
  }

  .maint-footer {
    margin-top: 16px;
    font-size: 10px;
    color: #5A4E3E;
  }

  .maint-loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .maint-loader-ring {
    width: 36px;
    height: 36px;
    border: 1.5px solid #EAE6DF;
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
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #8C8C8C;
  }

  @media (max-width: 480px) {
    .maint-page {
      padding: 16px;
    }

    .maint-card {
      padding: 24px 20px;
    }
  }
`;
