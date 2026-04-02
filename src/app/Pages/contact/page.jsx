'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Phone, Mail, MapPin, Instagram, Twitter, Facebook } from 'lucide-react';
import TrustBadge from '@/components/home/trustBadge';

export default function ContactPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  const handleContactForm = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      subject: formData.get('subject'),
      message: formData.get('message')
    };

    try {
      const response = await fetch('/api/Pages/Contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Thank you for contacting us! We will get back to you within 24 hours.');
        e.target.reset();
      } else {
        toast.error(result.message || 'Failed to submit inquiry. Please try again.');
      }
    } catch (error) {
      console.error('Contact Form Error:', error);
      toast.error('An error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .ct-page { font-family: 'Montserrat', sans-serif; background: #ffffff; padding-top: 72px; }

        /* General Variables */
        :root {
          --zj-black: #000000;
          --zj-white: #ffffff;
          --zj-gold: #EAB308;
          --zj-bg: #F9F9F9;
        }

        /* Hero Banner */
        .ct-hero {
          position: relative;
          min-height: 480px;
          background-image: url("/Contact Page/Header/Contac Us Header.png");
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
        }
        .ct-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%);
        }
        .ct-hero-content { position: relative; z-index: 1; padding: 0 24px; }
        .ct-hero-eyebrow {
          font-size: 11px;
          letter-spacing: 0.24em;
          color: #EAB308;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 20px;
        }
        .ct-hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 6vw, 60px);
          color: #ffffff;
          font-weight: 700;
          line-height: 1.1;
        }

        /* Main section */
        .ct-main { max-width: 1280px; margin: 0 auto; padding: 40px 24px; }
        .ct-grid {
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 100px;
          align-items: start;
        }

        /* Info Column */
        .ct-info-section { margin-bottom: 40px; }
        .ct-info-label {
          font-size: 10px;
          letter-spacing: 0.22em;
          color: #EAB308;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 12px;
        }
        .ct-info-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px;
          color: #000000;
          font-weight: 500;
          margin-bottom: 16px;
          line-height: 1.2;
        }
        .ct-info-text { font-size: 14px; color: #555555; line-height: 1.8; }
        .ct-info-divider { border: none; border-top: 1px solid #EFEFEF; margin: 32px 0; }

        .ct-contact-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 20px;
        }
        .ct-contact-icon {
          width: 40px;
          height: 40px;
          background: #F9F9F9;
          border: 1px solid #EFEFEF;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #EAB308;
        }
        .ct-contact-item-label { font-size: 10px; color: #888888; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; margin-bottom: 4px; }
        .ct-contact-item-value { font-size: 14px; color: #000000; font-weight: 500; }

        .ct-social-row {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }
        .ct-social-link {
          width: 40px;
          height: 40px;
          border: 1px solid #EFEFEF;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #555555;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .ct-social-link:hover { border-color: #000000; color: #ffffff; background: #000000; }

        /* Form Column */
        .ct-form-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px;
          color: #000000;
          font-weight: 500;
          margin-bottom: 32px;
        }
        .ct-form { display: flex; flex-direction: column; gap: 20px; }
        .ct-form-group { display: flex; flex-direction: column; gap: 8px; }
        .ct-form-label {
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #666666;
          font-weight: 600;
        }
        .ct-form-input, .ct-form-textarea {
          width: 100%;
          padding: 16px 20px;
          background: #F9F9F9;
          border: 1px solid #F9F9F9;
          border-radius: 2px;
          outline: none;
          font-size: 14px;
          font-family: 'Montserrat', sans-serif;
          color: #000000;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .ct-form-input:focus, .ct-form-textarea:focus {
          border-color: #EAB308;
          background: #ffffff;
        }
        .ct-form-input::placeholder, .ct-form-textarea::placeholder { color: #aaaaaa; }
        .ct-form-textarea { min-height: 160px; resize: vertical; }
        .ct-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .ct-submit-btn {
          width: 100%;
          padding: 18px;
          background: #000000;
          color: #ffffff;
          border: none;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Montserrat', sans-serif;
          margin-top: 10px;
        }
        .ct-submit-btn:hover { background: #EAB308; color: #000000; }

        /* Map Section */
        .ct-map-section { 
          width: 100%;
          height: 480px;
          padding-left: 40px;
          padding-right: 40px;
          background: #F9F9F9;
          border-top: 1px solid #EFEFEF;
        }
        .ct-map-iframe {
          width: 100%;
          height: 100%;
          padding: 40px;
          border: none;
          filter: contrast(1.1);
        }

        @media (max-width: 768px) {
          .ct-grid { grid-template-columns: 1fr; gap: 64px; }
          .ct-form-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <Navbar />

      <main className="ct-page">
        {/* Hero */}
        <section className="ct-hero">
          <div className="ct-hero-content">
            <h1 className="ct-hero-title">Crafting Timeless Elegance</h1>
          </div>
        </section>

        {/* Main Content */}
        <section className="ct-main">
          <div className="ct-grid">
            {/* Info Column */}
            <div>
              <div className="ct-info-section">
                <p className="ct-info-label">Let&apos;s Talk</p>
                <h2 className="ct-info-title">We&apos;d Love to Hear From You</h2>
                <p className="ct-info-text">Whether you have a question about our collections, need help with a custom order, or simply want to say hello — our team is always here to help.</p>
              </div>

              <hr className="ct-info-divider" />

              <div className="ct-info-section">
                <p className="ct-info-label">Reach Us Directly</p>
                <div className="ct-contact-item">
                  <div className="ct-contact-icon"><Phone size={16} /></div>
                  <div>
                    <p className="ct-contact-item-label">Phone</p>
                    <p className="ct-contact-item-value">+91 98765 43210</p>
                  </div>
                </div>
                <div className="ct-contact-item">
                  <div className="ct-contact-icon"><Mail size={16} /></div>
                  <div>
                    <p className="ct-contact-item-label">Email</p>
                    <p className="ct-contact-item-value">support@zulujewellers.com</p>
                  </div>
                </div>
              </div>

              <hr className="ct-info-divider" />

              <div className="ct-info-section">
                <p className="ct-info-label">Visit Our Store</p>
                <div className="ct-contact-item">
                  <div className="ct-contact-icon"><MapPin size={16} /></div>
                  <div>
                    <p className="ct-contact-item-label">Address</p>
                    <p className="ct-contact-item-value">Soni Diamond Business Institute<br/>Varachha, Surat, Gujarat 395006</p>
                    <p className="ct-info-text" style={{ marginTop: '6px', fontSize: '12px' }}>Mon – Sat: 10:00 AM – 7:30 PM<br/>Sunday: Closed</p>
                  </div>
                </div>
              </div>

              <hr className="ct-info-divider" />

              <div>
                <p className="ct-info-label">Follow Us</p>
                <div className="ct-social-row">
                  <a href="#" className="ct-social-link" aria-label="Instagram"><Instagram size={16} /></a>
                  <a href="#" className="ct-social-link" aria-label="Twitter"><Twitter size={16} /></a>
                  <a href="#" className="ct-social-link" aria-label="Facebook"><Facebook size={16} /></a>
                </div>
              </div>
            </div>

            {/* Form Column */}
            <div>
              <h2 className="ct-form-title">Send Us a Message</h2>
              <form className="ct-form contact-form" onSubmit={handleContactForm}>
                <div className="ct-form-row">
                  <div className="ct-form-group">
                    <label className="ct-form-label">Full Name *</label>
                    <input className="ct-form-input" type="text" name="name" placeholder="Your full name" required />
                  </div>
                  <div className="ct-form-group">
                    <label className="ct-form-label">Email Address *</label>
                    <input className="ct-form-input" type="email" name="email" placeholder="your@email.com" required />
                  </div>
                </div>
                <div className="ct-form-row">
                  <div className="ct-form-group">
                    <label className="ct-form-label">Phone Number</label>
                    <input className="ct-form-input" type="tel" name="phone" placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div className="ct-form-group">
                    <label className="ct-form-label">Subject *</label>
                    <input className="ct-form-input" type="text" name="subject" placeholder="How can we help?" required />
                  </div>
                </div>
                <div className="ct-form-group">
                  <label className="ct-form-label">Message *</label>
                  <textarea className="ct-form-textarea" name="message" placeholder="Tell us more about your enquiry..." required />
                </div>
                <button type="submit" className="ct-submit-btn" disabled={loading}>
                  {loading ? 'Sending...' : 'Submit Message'}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="ct-map-section">
          <iframe 
            className="ct-map-iframe"
            src="https://maps.google.com/maps?q=Soni%20Diamond%20Business%20Institute&t=k&z=19&output=embed"
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </section>

        <TrustBadge />
      </main>

      <Footer />
    </>
  );
}