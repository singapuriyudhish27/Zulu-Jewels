'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  ShieldCheck, 
  HelpCircle, 
  ArrowLeft, 
  ExternalLink,
  Clock
} from 'lucide-react';

export default function PolicyPageContent({ slug, fallbackTitle }) {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const res = await fetch(`/api/Pages/Policies/${slug}`);
        const result = await res.json();
        if (res.ok && result.success && result.data) {
          setPolicy(result.data);
        }
      } catch (err) {
        console.error('Failed to load policy content:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, [slug]);

  const handlePrint = () => {
    window.print();
  };

  const title = policy?.page_name || fallbackTitle;
  const lastUpdated = policy?.updated_at 
    ? new Date(policy.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <Navbar />
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@200;300;400;500;600;700&display=swap');

        .policy-wrapper {
          font-family: 'Montserrat', sans-serif;
          background: #faf9f6;
          color: #222;
          min-height: 80vh;
          padding-bottom: 80px;
        }

        .policy-hero {
          background: linear-gradient(135deg, #141414 0%, #1f1b16 100%);
          color: #fff;
          padding: 80px 20px 60px;
          text-align: center;
          position: relative;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
        }

        .policy-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #D4AF37;
          font-weight: 600;
          margin-bottom: 14px;
        }

        .policy-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 44px;
          font-weight: 600;
          letter-spacing: 0.5px;
          color: #ffffff;
          margin-bottom: 14px;
        }

        .policy-meta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          font-size: 13px;
          color: #aaa;
          flex-wrap: wrap;
        }

        .policy-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .policy-container {
          max-width: 1040px;
          margin: -30px auto 0;
          padding: 0 20px;
          position: relative;
          z-index: 2;
        }

        .policy-action-bar {
          background: #ffffff;
          border: 1px solid #ede8df;
          border-radius: 12px;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 8px 30px rgba(0,0,0,0.04);
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .policy-tabs-nav {
          display: flex;
          gap: 8px;
        }

        .policy-nav-link {
          font-size: 13px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 6px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .policy-nav-link.active {
          background: #141414;
          color: #fff;
        }

        .policy-nav-link:not(.active) {
          color: #666;
          background: #f5f4f0;
        }

        .policy-nav-link:hover:not(.active) {
          color: #141414;
          background: #ebe9e3;
        }

        .policy-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn-pdf-download {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #D4AF37;
          color: #141414;
          font-size: 13px;
          font-weight: 600;
          padding: 9px 18px;
          border-radius: 6px;
          text-decoration: none;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
        }

        .btn-pdf-download:hover {
          background: #c29d29;
          transform: translateY(-1px);
        }

        .btn-print {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          border: 1px solid #ddd;
          color: #555;
          font-size: 13px;
          font-weight: 500;
          padding: 8px 14px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-print:hover {
          color: #141414;
          border-color: #999;
        }

        .policy-content-card {
          background: #ffffff;
          border: 1px solid #ede8df;
          border-radius: 12px;
          padding: 48px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          line-height: 1.8;
          color: #333;
        }

        .policy-body h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          color: #141414;
          margin-top: 32px;
          margin-bottom: 14px;
          padding-bottom: 8px;
          border-bottom: 1px solid #eee;
        }

        .policy-body h2:first-of-type {
          margin-top: 0;
        }

        .policy-body h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          color: #2c2c2c;
          margin-top: 24px;
          margin-bottom: 10px;
        }

        .policy-body p {
          font-size: 15px;
          margin-bottom: 18px;
          color: #4a4a4a;
        }

        .policy-body ul, .policy-body ol {
          margin-left: 24px;
          margin-bottom: 20px;
        }

        .policy-body li {
          margin-bottom: 8px;
          font-size: 15px;
          color: #4a4a4a;
        }

        .policy-support-card {
          margin-top: 40px;
          background: #fdfbf7;
          border: 1px solid #e8dec8;
          border-radius: 10px;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .policy-support-info {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .policy-support-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #f5eedf;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #D4AF37;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .policy-hero {
            padding: 60px 20px 50px;
          }
          .policy-title {
            font-size: 32px;
          }
          .policy-content-card {
            padding: 24px;
          }
          .policy-action-bar {
            padding: 16px;
          }
        }

        @media print {
          .policy-hero {
            background: #fff !important;
            color: #000 !important;
            padding: 20px 0 !important;
          }
          .policy-title {
            color: #000 !important;
          }
          .policy-action-bar, .policy-support-card, nav, footer {
            display: none !important;
          }
          .policy-content-card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
        }
      `}} />

      <main className="policy-wrapper">
        <header className="policy-hero">
          <div className="policy-tag">
            <ShieldCheck size={14} /> Official Legal Policy
          </div>
          <h1 className="policy-title">{title}</h1>
          <div className="policy-meta">
            <span className="policy-meta-item">
              <Calendar size={14} color="#D4AF37" /> Last Updated: {lastUpdated}
            </span>
            <span>•</span>
            <span className="policy-meta-item">
              <Clock size={14} color="#D4AF37" /> Zulu Jewellers Private Limited
            </span>
          </div>
        </header>

        <div className="policy-container">
          {/* Action & Navigation Bar */}
          <div className="policy-action-bar">
            <div className="policy-tabs-nav">
              <Link 
                href="/Pages/terms" 
                className={`policy-nav-link ${slug === 'terms' ? 'active' : ''}`}
              >
                Terms & Conditions
              </Link>
              <Link 
                href="/Pages/privacy" 
                className={`policy-nav-link ${slug === 'privacy' ? 'active' : ''}`}
              >
                Privacy Policy
              </Link>
            </div>

            <div className="policy-actions">
              {policy?.pdf_url && (
                <a 
                  href={policy.pdf_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-pdf-download"
                  download
                >
                  <Download size={15} /> Download Official PDF
                </a>
              )}
              <button 
                type="button" 
                className="btn-print"
                onClick={handlePrint}
                title="Print this policy"
              >
                <Printer size={15} /> Print
              </button>
            </div>
          </div>

          {/* Main Content Card */}
          <article className="policy-content-card">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
                <p>Loading policy documentation...</p>
              </div>
            ) : policy?.content ? (
              <div 
                className="policy-body"
                dangerouslySetInnerHTML={{ __html: policy.content }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#777' }}>
                <FileText size={48} style={{ margin: '0 auto 16px', color: '#ccc' }} />
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', color: '#333' }}>
                  Policy Document Being Updated
                </h3>
                <p style={{ marginTop: '8px', fontSize: '14px', maxWidth: '400px', margin: '8px auto 0' }}>
                  Our legal team is currently reviewing and updating this policy. Please check back shortly or reach out to our concierge team.
                </p>
              </div>
            )}

            {/* Support Callout */}
            <div className="policy-support-card">
              <div className="policy-support-info">
                <div className="policy-support-icon">
                  <HelpCircle size={22} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1a1a1a' }}>
                    Have questions about this policy?
                  </h4>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>
                    Our customer care and legal concierge is here to assist you anytime.
                  </p>
                </div>
              </div>
              <Link 
                href="/Pages/contact"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#141414',
                  color: '#fff',
                  padding: '9px 18px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                Contact Concierge
              </Link>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
