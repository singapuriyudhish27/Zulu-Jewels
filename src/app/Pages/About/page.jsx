'use client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import TrustBadge from '@/components/home/trustBadge';

export default function AboutPage() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .ab-page { font-family: 'Montserrat', sans-serif; background: #ffffff; padding-top: 72px; }

        /* General Variables */
        :root {
          --zj-black: #000000;
          --zj-white: #ffffff;
          --zj-gold: #EAB308;
          --zj-bg: #F9F9F9;
        }

        /* Hero */
        .ab-hero {
          position: relative;
          min-height: 480px;
          background: #000000 url('/About%20Page/Header/Frame%2037391.png') no-repeat center center;
          background-size: cover;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
        }
        .ab-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%);
        }
        .ab-hero-content { position: relative; z-index: 1; padding: 0 24px; max-width: 720px; }
        .ab-hero-eyebrow {
          font-size: 11px;
          letter-spacing: 0.24em;
          color: #EAB308;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 24px;
        }
        .ab-hero-title {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(32px, 5vw, 48px);
          color: #ffffff;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 24px;
        }
        .ab-hero-subtitle {
          font-size: 15px;
          color: rgba(255,255,255,0.7);
          line-height: 1.8;
          font-weight: 300;
          max-width: 600px;
          margin: 0 auto;
        }

        /* Journey Section */
        .ab-journey-outer { background: #F9F5F2; overflow: hidden; margin-top: 40px; }
        .ab-journey-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          height: auto;
          max-width: 1580px;
          margin: 0 auto;
          padding: 40px 40px;
        }
        .ab-journey-content {
          padding: 20px 10% 20px 12%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
        }
        .ab-journey-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 38px;
          color: #000000;
          font-weight: 600;
          margin-bottom: 32px;
          line-height: 1.2;
          text-transform: capitalize;
        }
        .ab-journey-text {
          font-size: 15px;
          color: #333;
          line-height: 1.8;
          margin-bottom: 40px;
          max-width: 480px;
        }
        .ab-journey-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #000000;
          color: #000000;
          background: transparent;
          padding: 12px 28px;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s;
          font-family: 'Montserrat', sans-serif;
        }
        .ab-journey-btn:hover { background: #000000; color: #ffffff; }
        .ab-journey-image {
          width: 100%;
          height: 450px;
          position: relative;
          overflow: hidden;
          border-radius: 4px;
        }
        .ab-journey-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.8s ease;
        }
        .ab-journey-image:hover .ab-journey-img {
          transform: scale(1.05);
        }

        .ab-section { max-width: 1280px; margin: 0 auto; padding: 40px 24px; }
        .ab-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        .ab-two-col.reverse { direction: rtl; }
        .ab-two-col.reverse > * { direction: ltr; }
        .ab-img-placeholder {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 0px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 100px;
          overflow: hidden;
        }
        .ab-img-gold { background: #F9F9F9; }
        .ab-img-dark { background: #111111; color: #EAB308; }
        .ab-eyebrow {
          font-size: 10px;
          letter-spacing: 0.22em;
          color: #EAB308;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .ab-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(32px, 4vw, 44px);
          color: #000000;
          font-weight: 500;
          line-height: 1.15;
          margin-bottom: 24px;
        }
        .ab-text {
          font-size: 14px;
          color: #555555;
          line-height: 1.85;
          margin-bottom: 20px;
        }
        .ab-outline-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          border: 1px solid #000000;
          color: #000000;
          background: transparent;
          padding: 15px 32px;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 24px;
          font-family: 'Montserrat', sans-serif;
        }
        .ab-outline-btn:hover { background: #000000; color: #ffffff; }

        /* Craftsmanship Features */
        .ab-craft-features { display: flex; flex-direction: column; gap: 24px; margin-top: 32px; }
        .ab-craft-item { display: flex; gap: 20px; align-items: flex-start; }
        .ab-craft-dot {
          width: 8px;
          height: 8px;
          background: #EAB308;
          border-radius: 50%;
          margin-top: 6px;
          flex-shrink: 0;
        }
        .ab-craft-item-title { font-size: 14px; font-weight: 600; color: #000000; margin-bottom: 6px; }
        .ab-craft-item-text { font-size: 13px; color: #666666; line-height: 1.65; }

        /* Divider */
        .ab-divider { border: none; border-top: 1px solid #EFEFEF; }

        /* Trust / Certifications */
        .ab-trust-section { background: #F9F9F9; padding: 100px 24px; }
        .ab-trust-inner { max-width: 1280px; margin: 0 auto; text-align: center; }
        .ab-trust-eyebrow {
          font-size: 10px;
          letter-spacing: 0.22em;
          color: #EAB308;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .ab-trust-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(30px, 4vw, 42px);
          color: #000000;
          font-weight: 500;
          margin-bottom: 16px;
        }
        .ab-trust-subtitle { font-size: 14px; color: #666666; max-width: 600px; margin: 0 auto 56px; line-height: 1.75; }
        .ab-cert-logos {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 64px;
          flex-wrap: wrap;
          filter: grayscale(100%);
          opacity: 0.6;
          transition: filter 0.3s, opacity 0.3s;
        }
        .ab-cert-logos:hover {
          filter: grayscale(80%);
          opacity: 0.8;
        }
        .ab-cert-logo {
          font-size: 14px;
          font-weight: 700;
          color: #000000;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: default;
        }

        /* CTA Bottom */
        .ab-cta-section {
          background: #F9F5F2;
          padding: 80px 24px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .ab-cta-content { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; }
        .ab-cta-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 32px;
          color: #000000;
          font-weight: 600;
          margin-bottom: 24px;
          line-height: 1.2;
        }
        .ab-cta-text {
          font-size: 15px;
          color: #333;
          line-height: 1.7;
          margin-bottom: 40px;
          max-width: 720px;
          margin-left: auto;
          margin-right: auto;
        }
        .ab-cta-buttons { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; }
        .ab-cta-btn-dark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #000000;
          color: #ffffff;
          border: none;
          padding: 14px 44px;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Montserrat', sans-serif;
          border-radius: 50px;
        }
        .ab-cta-btn-dark:hover { background: #333; transform: translateY(-2px); }
        .ab-cta-btn-outline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          color: #000000;
          border: 1px solid #000000;
          padding: 14px 44px;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Montserrat', sans-serif;
          border-radius: 50px;
        }
        .ab-cta-btn-outline:hover { background: #f5f5f5; transform: translateY(-2px); }

        @media (max-width: 768px) {
          .ab-two-col { grid-template-columns: 1fr; gap: 48px; }
          .ab-two-col.reverse { direction: ltr; }
          .ab-cert-logos { gap: 32px; }
          .ab-cta-buttons { flex-direction: column; gap: 16px; align-items: stretch; }
          .ab-cta-buttons a { justify-content: center; }
        }
      ` }} />

      <Navbar />

      <main className="ab-page">
        {/* Hero */}
        <section className="ab-hero">
          <div className="ab-hero-content">
            <h1 className="ab-hero-title">Crafting Timeless Elegance</h1>
            <p className="ab-hero-subtitle">
              At ZULU JEWELLERS, every piece tells a story — a story of luxury, craftsmanship, and enduring beauty that transcends generations.
            </p>
          </div>
        </section>

        {/* Our Journey */}
        <div className="ab-journey-outer">
          <section className="ab-journey-inner">
            <div className="ab-journey-content">
              <h2 className="ab-journey-title">Our Journey of Craftsmanship and Passion</h2>
              <p className="ab-journey-text">
                Founded with a vision to redefine luxury, ZULU JEWELLERS has been creating exquisite jewelry that combines timeless elegance with modern design. Our mission is to craft pieces that celebrate life's precious moments.
                <br />
                From humble beginnings to becoming a trusted name in premium jewelry, our brand is rooted in passion, precision, and authenticity. Every piece reflects our commitment to quality and artistry.
              </p>
              <Link href="/Pages/Products" className="ab-journey-btn">Shop Gifts</Link>
            </div>
            <div className="ab-journey-image">
              <img src="/About Page/Expert/Rectangle 37.png" alt="Our Legacy" className="ab-journey-img" />
            </div>
          </section>
        </div>

        <hr className="ab-divider" />

        {/* Expert Craftsmanship */}
        <section className="ab-section">
          <div className="ab-two-col">
            <div className="ab-img-placeholder ab-img-dark" style={{ justifyContent: 'center' }}>
              <img src="/About%20Page/Journey/Rectangle%2037.png" alt="Our Legacy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <h2 className="ab-journey-title" style={{ fontSize: '32px', marginBottom: '20px' }}>Expert Craftsmanship,<br />Handpicked Perfection</h2>
              <p className="ab-journey-text" style={{ marginBottom: '16px' }}>
                At ZULU JEWELLERS, we believe that luxury lies in the details. Each piece is meticulously handcrafted by skilled artisans using the finest materials:
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0' }}>
                <li className="ab-journey-text" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '4px', height: '4px', background: '#000', borderRadius: '50%' }}></span>
                  Gold & Platinum of the highest purity
                </li>
                <li className="ab-journey-text" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '4px', height: '4px', background: '#000', borderRadius: '50%' }}></span>
                  Certified Diamonds and ethically sourced gemstones
                </li>
                <li className="ab-journey-text" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '4px', height: '4px', background: '#000', borderRadius: '50%' }}></span>
                  Intricate designs crafted with precision
                </li>
              </ul>
              <p className="ab-journey-text">
                From concept to creation, our design process ensures perfection in every curve, sparkle, and finish. Whether it's a statement ring, a delicate bracelet, or a bridal set, our jewelry is a reflection of artistry and passion.
              </p>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="ab-trust-section">
          <div className="ab-trust-inner">
            <h2 className="ab-trust-title">Certified Luxury You Can Trust</h2>
            <p className="ab-trust-subtitle">Every piece undergoes rigorous quality checks and comes with internationally recognised certifications, so you buy with complete confidence.</p>
            <div className="ab-cert-logos">
              <span className="ab-cert-logo">GIA Certified</span>
              <span className="ab-cert-logo">IGI Certified</span>
              <span className="ab-cert-logo">BIS Hallmark</span>
              <span className="ab-cert-logo">ISO 9001</span>
              <span className="ab-cert-logo">SGL Certified</span>
            </div>
          </div>
        </section>

        <TrustBadge />

        {/* CTA Bottom */}
        <section className="ab-cta-section">
          <div className="ab-cta-content">
            <h2 className="ab-cta-title">Experience ZULU JEWELLERS</h2>
            <p className="ab-cta-text">
              Discover collections that celebrate your style, your milestones, and your story. Whether you’re choosing a timeless classic or designing a custom masterpiece, ZULU JEWELLERS is with you every step of the way.
            </p>
            <div className="ab-cta-buttons">
              <Link href="/Pages/Products" className="ab-cta-btn-dark">Shop Our Collections</Link>
              <Link href="/Pages/custom" className="ab-cta-btn-outline">Start Your Custom Design</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}