'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, User, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const router = useRouter();
  const pathname = usePathname();

  const requireAuth = (action) => {
    const token = document.cookie
      .split("; ")
      .find(row => row.startsWith("zulu_jewels="))
      ?.split("=")[1];

    if (!token) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    if (action) action();
  };
  useEffect(() => {
    function handleContactForm(e) {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        subject: formData.get('subject'),
        message: formData.get('message')
      };
      
      console.log('Contact form submitted:', data);
      toast.success('Thank you for contacting us! We will get back to you within 24 hours.');
      e.target.reset();
    }

    const form = document.querySelector('.contact-form');
    if (form) {
      form.addEventListener('submit', handleContactForm);
      return () => form.removeEventListener('submit', handleContactForm);
    }
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
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

        body {
          font-family: 'Montserrat', sans-serif;
          background: #f9f9f9;
          color: var(--text-dark);
        }

        /* Navigation */
        .main-nav {
          padding: 25px 80px;
          background: white;
          box-shadow: 0 2px 20px rgba(0,0,0,0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 600;
          color: var(--primary-gold);
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
        }

        .nav-menu {
          display: flex;
          gap: 50px;
          list-style: none;
        }

        .nav-menu a {
          color: var(--text-dark);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: color 0.3s ease;
          position: relative;
        }

        .nav-menu a::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 0;
            height: 2px;
            background: var(--primary-gold);
            transition: width 0.3s ease;
        }

        .nav-menu a:hover::after {
            width: 100%;
        }

        .nav-icons {
          display: flex;
          gap: 20px;
        }

        .icon-btn {
          width: 40px;
          height: 40px;
          border: 1px solid var(--border-light);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .icon-btn:hover {
          background: var(--primary-gold);
          border-color: var(--primary-gold);
          color: white;
        }

        /* Hero Section */
        .contact-hero {
          background: linear-gradient(135deg, var(--dark-bg) 0%, #2c2c2c 100%);
          padding: 100px 80px;
          text-align: center;
          color: white;
        }

        .contact-hero h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 56px;
          font-weight: 600;
          margin-bottom: 20px;
          background: linear-gradient(135deg, var(--primary-gold), var(--accent-rose));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .contact-hero p {
          font-size: 18px;
          color: rgba(255,255,255,0.8);
          max-width: 600px;
          margin: 0 auto;
        }

        /* Contact Container */
        .contact-container {
          max-width: 1400px;
          margin: -50px auto 80px;
          padding: 0 80px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
        }

        /* Contact Info */
        .contact-info {
          background: white;
          padding: 60px;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }

        .contact-info h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 36px;
          color: var(--text-dark);
          margin-bottom: 30px;
        }

        .info-item {
          display: flex;
          align-items: start;
          gap: 20px;
          margin-bottom: 35px;
          padding-bottom: 35px;
          border-bottom: 1px solid var(--border-light);
        }

        .info-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .info-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, var(--primary-gold), var(--accent-rose));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          flex-shrink: 0;
        }

        .info-content h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 8px;
        }

        .info-content p {
          font-size: 15px;
          color: #666;
          line-height: 1.6;
        }

        .info-content a {
          color: var(--primary-gold);
          text-decoration: none;
        }

        .info-content a:hover {
          text-decoration: underline;
        }

        /* Business Hours */
        .business-hours {
          margin-top: 40px;
          padding-top: 40px;
          border-top: 2px solid var(--border-light);
        }

        .business-hours h3 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 20px;
          color: var(--text-dark);
        }

        .hours-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .hours-item {
          display: flex;
          justify-content: space-between;
          font-size: 15px;
        }

        .hours-item .day {
          color: var(--text-dark);
          font-weight: 500;
        }

        .hours-item .time {
          color: #666;
        }

        /* Contact Form */
        .contact-form-wrapper {
          background: white;
          padding: 60px;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }

        .contact-form-wrapper h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 36px;
          color: var(--text-dark);
          margin-bottom: 10px;
        }

        .contact-form-wrapper .form-description {
          font-size: 15px;
          color: #666;
          margin-bottom: 40px;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .form-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-dark);
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .form-label .required {
          color: #e74c3c;
        }

        .form-input,
        .form-select,
        .form-textarea {
          padding: 15px 20px;
          border: 2px solid var(--border-light);
          border-radius: 8px;
          font-size: 15px;
          font-family: 'Montserrat', sans-serif;
          transition: all 0.3s ease;
          background: #fafafa;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: var(--primary-gold);
          background: white;
          box-shadow: 0 0 0 4px rgba(212,175,55,0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 150px;
        }

        .form-checkbox {
          display: flex;
          align-items: start;
          gap: 12px;
          font-size: 14px;
          color: #666;
        }

        .form-checkbox input[type="checkbox"] {
          margin-top: 3px;
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .submit-btn {
          padding: 18px 40px;
          background: var(--primary-gold);
          color: var(--dark-bg);
          border: none;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 8px;
          margin-top: 10px;
        }

        .submit-btn:hover {
          background: var(--accent-rose);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(212,175,55,0.3);
        }

        /* Map Section */
        .map-section {
          max-width: 1400px;
          margin: 80px auto;
          padding: 0 80px;
        }

        .map-section h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 42px;
          text-align: center;
          margin-bottom: 50px;
          color: var(--text-dark);
        }

        .map-container {
          width: 100%;
          height: 500px;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          background: #e0e0e0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          font-size: 18px;
        }

        /* Social Links */
        .social-section {
          background: var(--dark-bg);
          padding: 80px;
          text-align: center;
          color: white;
        }

        .social-section h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 42px;
          margin-bottom: 20px;
          color: var(--primary-gold);
        }

        .social-section p {
          font-size: 16px;
          color: rgba(255,255,255,0.7);
          margin-bottom: 40px;
        }

        .social-links {
          display: flex;
          justify-content: center;
          gap: 25px;
        }

        .social-link {
          width: 60px;
          height: 60px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .social-link:hover {
          background: var(--primary-gold);
          border-color: var(--primary-gold);
          transform: translateY(-5px);
        }

        /* Footer */
        footer {
          background: #0a0a0a;
          padding: 80px 80px 40px;
          color: rgba(255,255,255,0.7);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
          gap: 60px;
          margin-bottom: 60px;
        }

        .footer-brand {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 600;
          color: var(--primary-gold);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .footer-desc {
          font-size: 14px;
          line-height: 1.8;
          margin-bottom: 30px;
        }

        .footer-title {
          font-size: 16px;
          font-weight: 600;
          color: white;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-links a {
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s ease;
        }

        .footer-links a:hover {
          color: var(--primary-gold);
        }

        .footer-bottom {
          text-align: center;
          padding-top: 40px;
          border-top: 1px solid rgba(255,255,255,0.1);
          font-size: 14px;
        }

        /* Responsive */
        @media (max-width: 968px) {
          .contact-container {
            grid-template-columns: 1fr;
            padding: 0 40px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .footer-grid {
            grid-template-columns: 1fr 1fr;
          }

          .main-nav,
          .contact-hero,
          .map-section {
            padding-left: 40px;
            padding-right: 40px;
          }
        }

        @media (max-width: 480px) {
          .contact-hero h1 {
            font-size: 36px;
          }

          .contact-info,
          .contact-form-wrapper {
            padding: 40px 30px;
          }

          .footer-grid {
            grid-template-columns: 1fr;
          }
        }
      `}} />

      {/* Navigation */}
      <nav className="main-nav">
        <div className="logo" onClick={() => window.location.href='/Pages'}>Zulu Jewellers</div>
        <ul className="nav-menu">
          <li><a href="/Pages">Home</a></li>
          <li><a href="/Pages/engagement">Engagement</a></li>
          <li><a href="/Pages/wedding">Wedding</a></li>
          <li><a href="/Pages/About">About</a></li>
          <li><a href="/Pages/contact">Contact</a></li>
        </ul>
        <div className="nav-icons">
            <div className="icon-btn" aria-label="User Profile" onClick={() => requireAuth(() => router.push('/Pages/Profile'))}>
                <User size={18} strokeWidth={1.5} />
            </div>
            <div className="icon-btn" aria-label="Shopping Cart" onClick={() => requireAuth(() => router.push('/Pages/cart'))}>
                <ShoppingCart size={18} strokeWidth={1.5} />
            </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="contact-hero">
        <h1>Get In Touch</h1>
        <p>Have questions about our jewelry? We are here to help you find the perfect piece or create something truly unique.</p>
      </section>

      {/* Contact Container */}
      <div className="contact-container">
        {/* Contact Information */}
        <div className="contact-info">
          <h2>Contact Information</h2>
          
          <div className="info-item">
            <div className="info-icon">📍</div>
            <div className="info-content">
              <h3>Visit Our Showroom</h3>
              <p>
                123 Diamond Avenue<br />
                New York, NY 10001<br />
                United States
              </p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">📞</div>
            <div className="info-content">
              <h3>Call Us</h3>
              <p>
                Phone: <a href="tel:+12125551234">+1 (212) 555-1234</a><br />
                Toll Free: <a href="tel:+18005551234">+1 (800) 555-1234</a>
              </p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">✉️</div>
            <div className="info-content">
              <h3>Email Us</h3>
              <p>
                General: <a href="mailto:info@zulujewellers.com">info@zulujewellers.com</a><br />
                Support: <a href="mailto:support@zulujewellers.com">support@zulujewellers.com</a>
              </p>
            </div>
          </div>

          <div className="business-hours">
            <h3>Business Hours</h3>
            <div className="hours-list">
              <div className="hours-item">
                <span className="day">Monday - Friday</span>
                <span className="time">10:00 AM - 7:00 PM</span>
              </div>
              <div className="hours-item">
                <span className="day">Saturday</span>
                <span className="time">10:00 AM - 6:00 PM</span>
              </div>
              <div className="hours-item">
                <span className="day">Sunday</span>
                <span className="time">12:00 PM - 5:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-form-wrapper">
          <h2>Send Us a Message</h2>
          <p className="form-description">Fill out the form below and we will get back to you within 24 hours.</p>
          
          <form className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="firstName"
                  className="form-input" 
                  placeholder="John" 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="lastName"
                  className="form-input" 
                  placeholder="Doe" 
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email <span className="required">*</span></label>
                <input 
                  type="email" 
                  name="email"
                  className="form-input" 
                  placeholder="john.doe@example.com" 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  className="form-input" 
                  placeholder="+1 (555) 000-0000" 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Subject <span className="required">*</span></label>
              <select name="subject" className="form-select" required>
                <option value="">Select a subject</option>
                <option value="general">General Inquiry</option>
                <option value="custom">Custom Design</option>
                <option value="appointment">Book Appointment</option>
                <option value="order">Order Status</option>
                <option value="feedback">Feedback</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Message <span className="required">*</span></label>
              <textarea 
                name="message"
                className="form-textarea" 
                placeholder="Tell us how we can help you..."
                required
              ></textarea>
            </div>

            <div className="form-checkbox">
              <input type="checkbox" id="newsletter" name="newsletter" />
              <label htmlFor="newsletter">
                I would like to receive updates about new collections and special offers
              </label>
            </div>

            <button type="submit" className="submit-btn">Send Message</button>
          </form>
        </div>
      </div>

      {/* Map Section */}
      <section className="map-section">
        <h2>Find Us Here</h2>
        <div className="map-container">
          {/* Google Maps Embed Would Go Here */}
          <p>📍 Map Integration: Add your Google Maps embed code here</p>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="social-section">
        <h2>Follow Us</h2>
        <p>Stay connected with us on social media for the latest updates and exclusive offers</p>
        <div className="social-links">
          <div className="social-link">f</div>
          <div className="social-link">📷</div>
          <div className="social-link">in</div>
          <div className="social-link">𝕏</div>
          <div className="social-link">P</div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-grid">
          <div>
            <div className="footer-brand">Zulu Jewellers</div>
            <p className="footer-desc">Creating timeless moments through exceptional craftsmanship and lab-grown diamonds. Made with love in New York City.</p>
          </div>
          <div>
            <h4 className="footer-title">Shop</h4>
            <ul className="footer-links">
              <li><a href="/engagement">Engagement Rings</a></li>
              <li><a href="/wedding">Wedding Bands</a></li>
              <li><a href="#">Fine Jewelry</a></li>
              <li><a href="#">Loose Diamonds</a></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-title">About</h4>
            <ul className="footer-links">
              <li><a href="/about">Our Story</a></li>
              <li><a href="#">Sustainability</a></li>
              <li><a href="#">Reviews</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-title">Support</h4>
            <ul className="footer-links">
              <li><a href="/contact">Contact Us</a></li>
              <li><a href="#">Shipping & Returns</a></li>
              <li><a href="#">Ring Size Guide</a></li>
              <li><a href="#">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-title">Resources</h4>
            <ul className="footer-links">
              <li><a href="#">Diamond Education</a></li>
              <li><a href="#">4 C Guide</a></li>
              <li><a href="#">Metal Types</a></li>
              <li><a href="#">Certification</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Zulu Jewellers. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </footer>
    </>
  );
}