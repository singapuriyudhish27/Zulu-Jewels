'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Instagram, Twitter, Facebook, Youtube, Linkedin, Award, ShieldCheck, Heart, Truck, Sparkles } from 'lucide-react';

export default function Footer() {
  const router = useRouter();
  const [openSections, setOpenSections] = useState({
    services: false,
    about: false,
    care: false,
    locations: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/Pages/Profile');
      const data = await response.json();

      if (data.role === "User" || data.role === "Admin") {
        router.push('/Pages/Profile?tab=orders');
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      router.push('/auth/login');
    }
  };
  return (
    <>
      <style>{`
        .zj-footer {
          background: #EEEDE9;
          color: #555;
          font-family: 'Montserrat', sans-serif;
          padding-top: 40px;
        }
        .zj-footer-grid {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px 32px;
          display: grid;
          grid-template-columns: repeat(4, 1fr) 1.4fr;
          gap: 40px;
        }
        .zj-footer-col-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .zj-footer-col-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #000;
          margin: 0;
        }
        .zj-footer-toggle-icon {
          display: none;
          font-size: 18px;
          font-weight: 300;
          color: #000;
          user-select: none;
        }
        .zj-footer-links-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .zj-footer-links-list li a {
          font-size: 13px;
          color: #555;
          text-decoration: none;
          transition: color 0.2s;
          line-height: 1.5;
        }
        .zj-footer-links-list li a:hover {
          color: #000;
        }
        .zj-footer-newsletter {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .zj-footer-newsletter-title {
          font-size: 20px;
          color: #000;
          font-weight: 600;
          line-height: 1.4;
        }
        .zj-footer-newsletter-tagline {
          font-size: 13px;
          color: #333;
          line-height: 1.5;
        }
        .zj-footer-email-row {
          display: flex;
          align-items: center;
          background: #fff;
          padding: 8px 16px;
          margin-top: 12px;
          border-radius: 2px;
        }
        .zj-footer-email-input {
          background: transparent;
          border: none;
          outline: none;
          color: #000;
          font-size: 13px;
          font-family: 'Montserrat', sans-serif;
          flex: 1;
        }
        .zj-footer-email-input::placeholder {
          color: #999;
        }
        .zj-footer-signup-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #000;
          transition: color 0.2s;
          white-space: nowrap;
          padding: 0 0 0 12px;
        }
        .zj-footer-signup-btn:hover {
          color: #fff;
        }
        .zj-footer-socials {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }
        .zj-footer-social-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          transition: all 0.2s;
          cursor: pointer;
        }
        .zj-footer-social-icon:hover {
          color: #000;
        }
        .zj-footer-bottom {
          border-top: 1px solid rgba(0,0,0,0.08);
          padding: 24px;
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .zj-footer-copy {
          font-size: 11px;
          color: #777;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .zj-footer-legal {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          align-items: center;
        }
        .zj-footer-legal a {
          font-size: 10px;
          color: #777;
          text-decoration: none;
          transition: color 0.2s;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .zj-footer-legal a:hover {
          color: #000;
        }
        @media (max-width: 900px) {
          .zj-footer-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .zj-footer-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .zj-footer-col {
            border-bottom: 1px solid rgba(0,0,0,0.06);
            padding-bottom: 15px;
          }
          .zj-footer-col:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }
          .zj-footer-col-header {
            margin-bottom: 0;
            cursor: pointer;
            padding: 5px 0;
          }
          .zj-footer-col-header.static {
            cursor: default;
            pointer-events: none;
          }
          .zj-footer-toggle-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
          }
          .zj-footer-links-list {
            display: none;
          }
          .zj-footer-links-list.open {
            display: flex;
            margin-top: 15px;
            animation: zj-footer-fade-in 0.25s ease-out;
          }
          .zj-footer-bottom {
            flex-direction: column;
            text-align: center;
          }
          .zj-footer-legal {
            justify-content: center;
          }
        }
        @keyframes zj-footer-fade-in {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .zj-footer-trust-bar {
          border-bottom: 1px solid rgba(0,0,0,0.06);
          padding: 32px 24px;
          margin-bottom: 40px;
        }
        .zj-footer-trust-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 24px;
        }
        .zj-footer-trust-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .zj-footer-trust-icon {
          font-size: 16px;
          color: #CEA268;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .zj-footer-trust-info {
          display: flex;
          flex-direction: column;
        }
        .zj-footer-trust-title {
          font-size: 11px;
          font-weight: 700;
          color: #000;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 2px;
        }
        .zj-footer-trust-desc {
          font-size: 10px;
          color: #777;
          line-height: 1.3;
        }
        @media (max-width: 1024px) {
          .zj-footer-trust-inner {
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
        }
        @media (max-width: 768px) {
          .zj-footer-trust-inner {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 480px) {
          .zj-footer-trust-inner {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>

      <footer className="zj-footer">
        {/* Trust Indicators Bar */}
        {/* <div className="zj-footer-trust-bar">
          <div className="zj-footer-trust-inner">
            <div className="zj-footer-trust-item">
              <div className="zj-footer-trust-icon"><Award size={22} /></div>
              <div className="zj-footer-trust-info">
                <span className="zj-footer-trust-title">Certified Diamonds</span>
                <span className="zj-footer-trust-desc">GIA & IGI Graded Solitaires</span>
              </div>
            </div>
            <div className="zj-footer-trust-item">
              <div className="zj-footer-trust-icon"><ShieldCheck size={22} /></div>
              <div className="zj-footer-trust-info">
                <span className="zj-footer-trust-title">BIS Hallmarked Gold</span>
                <span className="zj-footer-trust-desc">100% Purity Guaranteed</span>
              </div>
            </div>
            <div className="zj-footer-trust-item">
              <div className="zj-footer-trust-icon"><Heart size={22} /></div>
              <div className="zj-footer-trust-info">
                <span className="zj-footer-trust-title">Ethical Sourcing</span>
                <span className="zj-footer-trust-desc">Conflict-Free Origins</span>
              </div>
            </div>
            <div className="zj-footer-trust-item">
              <div className="zj-footer-trust-icon"><Truck size={22} /></div>
              <div className="zj-footer-trust-info">
                <span className="zj-footer-trust-title">Worldwide Shipping</span>
                <span className="zj-footer-trust-desc">Fully Secured & Insured</span>
              </div>
            </div>
            <div className="zj-footer-trust-item">
              <div className="zj-footer-trust-icon"><Sparkles size={22} /></div>
              <div className="zj-footer-trust-info">
                <span className="zj-footer-trust-title">Lifetime Support</span>
                <span className="zj-footer-trust-desc">Complimentary Polish & Care</span>
              </div>
            </div>
          </div>
        </div> */}

        {/* Main footer grid */}
        <div className="zj-footer-grid">
          {/* Column 1: Customer Services */}
          <div className="zj-footer-col">
            <div className="zj-footer-col-header" onClick={() => toggleSection('services')}>
              <h4 className="zj-footer-col-title">Customer Services</h4>
              <span className="zj-footer-toggle-icon">
                {openSections.services ? '−' : '+'}
              </span>
            </div>
            <ul className={`zj-footer-links-list ${openSections.services ? 'open' : ''}`}>
              <li><Link href="/Pages/contact">Contact Us</Link></li>
              <li><Link href="/Pages/Profile" onClick={handleTrackOrder}>Track your Order</Link></li>
              <li><Link href="#">Shipping &amp; Returns</Link></li>
              <li><Link href="#">Frequently Asked Questions</Link></li>
              <li><Link href="/Pages/contact">Schedule an Appointment</Link></li>
            </ul>
          </div>

          {/* Column 2: About Us */}
          <div className="zj-footer-col">
            <div className="zj-footer-col-header" onClick={() => toggleSection('about')}>
              <h4 className="zj-footer-col-title">About Us</h4>
              <span className="zj-footer-toggle-icon">
                {openSections.about ? '−' : '+'}
              </span>
            </div>
            <ul className={`zj-footer-links-list ${openSections.about ? 'open' : ''}`}>
              <li><Link href="/Pages/about">Origins</Link></li>
              <li><Link href="/Pages/about">Our Purpose</Link></li>
              <li><Link href="#">Careers</Link></li>
              <li><Link href="#">Sustainability</Link></li>
              <li><Link href="#">Giving Back</Link></li>
            </ul>
          </div>

          {/* Column 3: Material Care */}
          <div className="zj-footer-col">
            <div className="zj-footer-col-header" onClick={() => toggleSection('care')}>
              <h4 className="zj-footer-col-title">Material Care</h4>
              <span className="zj-footer-toggle-icon">
                {openSections.care ? '−' : '+'}
              </span>
            </div>
            <ul className={`zj-footer-links-list ${openSections.care ? 'open' : ''}`}>
              <li><Link href="#">Jewelry Repair</Link></li>
              <li><Link href="#">Ring Sizing</Link></li>
              <li><Link href="#">Metal Allergy Resources</Link></li>
              <li><Link href="#">Styling Tips</Link></li>
            </ul>
          </div>

          {/* Column 4: Main Locations */}
          <div className="zj-footer-col">
            <div className="zj-footer-col-header" onClick={() => toggleSection('locations')}>
              <h4 className="zj-footer-col-title">Main Locations</h4>
              <span className="zj-footer-toggle-icon">
                {openSections.locations ? '−' : '+'}
              </span>
            </div>
            <ul className={`zj-footer-links-list ${openSections.locations ? 'open' : ''}`}>
              <li><Link href="/Pages/contact">Surat, GJ</Link></li>
              <li><Link href="/Pages/contact">Mumbai, MH</Link></li>
              <li><Link href="/Pages/contact">Hyderabad, TS</Link></li>
              <li><Link href="/Pages/contact">New York, USA</Link></li>
            </ul>
          </div>

          {/* Column 5: Newsletter */}
          <div className="zj-footer-col">
            <div className="zj-footer-col-header static">
              <h4 className="zj-footer-col-title">Stay Connected</h4>
            </div>
            <div className="zj-footer-newsletter">
              <p className="zj-footer-newsletter-title">You can be one step ahead.</p>
              <p className="zj-footer-newsletter-tagline">Sign up for exclusive offers &amp; updates</p>
              <div className="zj-footer-email-row">
                <input
                  className="zj-footer-email-input"
                  type="email"
                  placeholder="Your email address"
                />
                <button className="zj-footer-signup-btn">Sign Up</button>
              </div>
              <div className="zj-footer-socials">
                <a href="" className="zj-footer-social-icon" aria-label="Instagram"><Instagram size={16} /></a>
                <a href="#" className="zj-footer-social-icon" aria-label="Twitter"><Twitter size={16} /></a>
                <a href="#" className="zj-footer-social-icon" aria-label="Facebook"><Facebook size={16} /></a>
                <a href="#" className="zj-footer-social-icon" aria-label="YouTube"><Youtube size={16} /></a>
                <a href="#" className="zj-footer-social-icon" aria-label="LinkedIn"><Linkedin size={16} /></a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', padding: '0' }}>
          <div className="zj-footer-bottom">
            <p className="zj-footer-copy">© {new Date().getFullYear()} Zulu Jewellers. All rights reserved.</p>
            <div className="zj-footer-legal">
              <Link href="/Pages/privacy">Privacy Policy</Link>
              <span style={{ color: '#999', fontSize: '10px' }}>&nbsp;·&nbsp;</span>
              <Link href="/Pages/terms">Terms &amp; Conditions</Link>
              <span style={{ color: '#999', fontSize: '10px' }}>&nbsp;·&nbsp;</span>
              <a href="#">Sitemap</a>
              <span style={{ color: '#999', fontSize: '10px' }}>&nbsp;·&nbsp;</span>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
