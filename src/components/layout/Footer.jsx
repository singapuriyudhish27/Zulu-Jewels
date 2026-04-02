import Link from 'next/link';
import { Instagram, Twitter, Facebook, Youtube, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <>
      <style>{`
        .zj-footer {
          background: #1a1a1a;
          color: #ccc;
          font-family: 'Montserrat', sans-serif;
          padding-top: 60px;
        }
        .zj-footer-grid {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px 48px;
          display: grid;
          grid-template-columns: repeat(4, 1fr) 1.4fr;
          gap: 40px;
        }
        .zj-footer-col-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #fff;
          margin-bottom: 20px;
        }
        .zj-footer-col ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .zj-footer-col ul li a {
          font-size: 13px;
          color: #aaa;
          text-decoration: none;
          transition: color 0.2s;
          line-height: 1.5;
        }
        .zj-footer-col ul li a:hover {
          color: #CEA268;
        }
        .zj-footer-newsletter {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .zj-footer-newsletter-title {
          font-size: 13px;
          color: #fff;
          line-height: 1.6;
        }
        .zj-footer-newsletter-tagline {
          font-size: 11px;
          color: #666;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .zj-footer-email-row {
          display: flex;
          align-items: center;
          border-bottom: 1px solid #444;
          padding-bottom: 8px;
          margin-top: 4px;
        }
        .zj-footer-email-input {
          background: transparent;
          border: none;
          outline: none;
          color: #ccc;
          font-size: 13px;
          font-family: 'Montserrat', sans-serif;
          flex: 1;
        }
        .zj-footer-email-input::placeholder {
          color: #555;
        }
        .zj-footer-signup-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #CEA268;
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
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid #333;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #aaa;
          transition: all 0.2s;
          cursor: pointer;
        }
        .zj-footer-social-icon:hover {
          border-color: #CEA268;
          color: #CEA268;
          background: rgba(206,162,104,0.08);
        }
        .zj-footer-bottom {
          border-top: 1px solid #2a2a2a;
          padding: 20px 24px;
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
          color: #555;
          letter-spacing: 0.04em;
        }
        .zj-footer-legal {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }
        .zj-footer-legal a {
          font-size: 11px;
          color: #555;
          text-decoration: none;
          transition: color 0.2s;
          letter-spacing: 0.04em;
        }
        .zj-footer-legal a:hover {
          color: #CEA268;
        }
        @media (max-width: 900px) {
          .zj-footer-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .zj-footer-grid {
            grid-template-columns: 1fr;
          }
          .zj-footer-bottom {
            flex-direction: column;
            text-align: center;
          }
          .zj-footer-legal {
            justify-content: center;
          }
        }
      `}</style>

      <footer className="zj-footer">
        {/* Main footer grid */}
        <div className="zj-footer-grid">
          {/* Column 1: Customer Services */}
          <div className="zj-footer-col">
            <h4 className="zj-footer-col-title">Customer Services</h4>
            <ul>
              <li><Link href="/Pages/contact">Contact Us</Link></li>
              <li><Link href="#">Track your Order</Link></li>
              <li><Link href="#">Shipping &amp; Returns</Link></li>
              <li><Link href="#">FAQ</Link></li>
              <li><Link href="/Pages/custom">Schedule an Appointment</Link></li>
            </ul>
          </div>

          {/* Column 2: About Us */}
          <div className="zj-footer-col">
            <h4 className="zj-footer-col-title">About Us</h4>
            <ul>
              <li><Link href="/Pages/about">Origins</Link></li>
              <li><Link href="/Pages/about">Our Purpose</Link></li>
              <li><Link href="#">Careers</Link></li>
              <li><Link href="#">Sustainability</Link></li>
              <li><Link href="#">Giving Back</Link></li>
            </ul>
          </div>

          {/* Column 3: Material Care */}
          <div className="zj-footer-col">
            <h4 className="zj-footer-col-title">Material Care</h4>
            <ul>
              <li><Link href="#">Jewelry Repair</Link></li>
              <li><Link href="#">Ring Sizing</Link></li>
              <li><Link href="#">Metal Allergy Resources</Link></li>
              <li><Link href="#">Styling Tips</Link></li>
            </ul>
          </div>

          {/* Column 4: Main Locations */}
          <div className="zj-footer-col">
            <h4 className="zj-footer-col-title">Main Locations</h4>
            <ul>
              <li><Link href="#">Surat, GJ</Link></li>
              <li><Link href="#">Mumbai, MH</Link></li>
              <li><Link href="#">Hyderabad, TS</Link></li>
              <li><Link href="#">New York, USA</Link></li>
            </ul>
          </div>

          {/* Column 5: Newsletter */}
          <div className="zj-footer-col">
            <h4 className="zj-footer-col-title">Stay Connected</h4>
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
        <div style={{ borderTop: '1px solid #2a2a2a', padding: '0' }}>
          <div className="zj-footer-bottom">
            <p className="zj-footer-copy">© {new Date().getFullYear()} Zulu Jewellers. All rights reserved.</p>
            <div className="zj-footer-legal">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms &amp; Conditions</a>
              <a href="#">Sitemap</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
