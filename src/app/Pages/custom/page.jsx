'use client';

import { useRouter, usePathname } from 'next/navigation';
import { User, ShoppingCart, ChevronRight, PenTool, Sparkles, Hammer, Scissors, Gem, FileText } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import TrustBadge from '@/components/home/trustBadge';

export default function CustomPage() {
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

  return (
    <>
      <style>{`
        .cu-page { font-family: 'Montserrat', sans-serif; background: #ffffff; padding-top: 72px; }

        /* General Variables */
        :root {
          --zj-black: #000000;
          --zj-white: #ffffff;
          --zj-gold: #EAB308;
          --zj-bg: #F9F9F9;
        }

        /* Hero */
        .cu-hero {
          position: relative;
          min-height: 520px;
          background: #000000 url('/Contact Page/Header/Contac Us Header.png') no-repeat center center;
          background-size: cover;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
        }
        .cu-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 100%);
        }
        .cu-hero-content { position: relative; z-index: 1; padding: 0 24px; max-width: 800px; }
        .cu-hero-eyebrow {
          font-size: 11px;
          letter-spacing: 0.24em;
          color: #EAB308;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 24px;
        }
        .cu-hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 6vw, 64px);
          color: #ffffff;
          font-weight: 500;
          line-height: 1.1;
          margin-bottom: 24px;
        }
        .cu-hero-subtitle {
          font-size: 15px;
          color: rgba(255,255,255,0.8);
          line-height: 1.8;
          font-weight: 300;
          max-width: 640px;
          margin: 0 auto 32px;
        }
        .cu-hero-btn {
          display: inline-flex;
          align-items: center;
          padding: 16px 40px;
          background: #EAB308;
          color: #000000;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.3s ease;
          border-radius: 2px;
        }
        .cu-hero-btn:hover { background: #ffffff; transform: translateY(-2px); }

        /* Section Styling */
        .cu-section { padding: 100px 24px; max-width: 1280px; margin: 0 auto; }
        .cu-section-header { text-align: center; margin-bottom: 64px; }
        .cu-section-eyebrow {
          font-size: 10px;
          letter-spacing: 0.22em;
          color: #EAB308;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 12px;
        }
        .cu-section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(32px, 4vw, 44px);
          color: #000000;
          font-weight: 500;
        }

        /* Process Section */
        .cu-process-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
        }
        .cu-process-item { text-align: center; position: relative; }
        .cu-process-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 64px;
          line-height: 1;
          color: #F0F0F0;
          font-weight: 300;
          margin-bottom: -24px;
          display: block;
        }
        .cu-process-content { position: relative; z-index: 1; }
        .cu-process-title { font-size: 16px; font-weight: 600; color: #000000; margin-bottom: 16px; }
        .cu-process-desc { font-size: 14px; color: #666666; line-height: 1.7; }

        /* Services Section */
        .cu-services-bg { background: #F9F9F9; }
        .cu-services-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
        }
        .cu-service-card {
          background: #ffffff;
          padding: 48px 32px;
          border: 1px solid #EFEFEF;
          transition: all 0.4s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .cu-service-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.05); border-color: #EAB308; }
        .cu-service-icon { color: #EAB308; margin-bottom: 24px; }
        .cu-service-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; color: #000000; margin-bottom: 16px; font-weight: 500; }
        .cu-service-desc { font-size: 14px; color: #666666; line-height: 1.7; margin-bottom: 24px; }
        .cu-service-link {
          font-size: 11px;
          font-weight: 700;
          color: #000000;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: color 0.2s ease;
        }
        .cu-service-link:hover { color: #EAB308; }

        /* Portfolio/Gallery Section */
        .cu-gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .cu-gallery-item {
          aspect-ratio: 4/5;
          position: relative;
          background: #F9F9F9;
          overflow: hidden;
          cursor: pointer;
        }
        .cu-gallery-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        .cu-gallery-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 32px;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .cu-gallery-item:hover .cu-gallery-img { transform: scale(1.05); }
        .cu-gallery-item:hover .cu-gallery-overlay { opacity: 1; }
        .cu-gallery-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; color: #ffffff; margin-bottom: 8px; }
        .cu-gallery-desc { font-size: 13px; color: rgba(255,255,255,0.8); }

        /* Bottom CTA */
        .cu-cta-section { background: #F9F5F2; padding: 100px 24px; text-align: center; }
        .cu-cta-content { max-width: 800px; margin: 0 auto; }
        .cu-cta-title {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(28px, 4vw, 38px);
          color: #000000;
          font-weight: 600;
          margin-bottom: 24px;
        }
        .cu-cta-text { font-size: 15px; color: #555555; line-height: 1.8; margin-bottom: 40px; }
        .cu-cta-btns { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; }
        .cu-btn-dark {
          padding: 16px 40px;
          background: #000000;
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .cu-btn-dark:hover { background: #333; transform: translateY(-2px); }
        .cu-btn-outline {
          padding: 16px 40px;
          background: transparent;
          color: #000000;
          border: 1px solid #000000;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .cu-btn-outline:hover { background: #000000; color: #ffffff; transform: translateY(-2px); }

        @media (max-width: 1024px) {
          .cu-process-grid { grid-template-columns: repeat(2, 1fr); gap: 48px; }
          .cu-services-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .cu-services-grid, .cu-gallery-grid { grid-template-columns: 1fr; }
          .cu-process-grid { grid-template-columns: 1fr; }
          .cu-hero { min-height: 480px; }
        }
      `}</style>

      <Navbar />

      <main className="cu-page">
        {/* Hero Section */}
        <section className="cu-hero">
          <div className="cu-hero-content">
            <p className="cu-hero-eyebrow">Bespoke Jewelry Design</p>
            <h1 className="cu-hero-title">Design Your <strong>Dream Jewelry</strong></h1>
            <p className="cu-hero-subtitle">Create a truly unique piece that reflects your personal style and story. Our master craftsmen bring your vision to life with unparalleled artistry and precision.</p>
            <Link href="/Pages/contact" className="cu-hero-btn">Start Your Design Journey</Link>
          </div>
        </section>

        {/* Process Section */}
        <section className="cu-section">
          <div className="cu-section-header">
            <p className="cu-section-eyebrow">How It Works</p>
            <h2 className="cu-section-title">The Custom Design Process</h2>
          </div>

          <div className="cu-process-grid">
            <div className="cu-process-item">
              <span className="cu-process-num">01</span>
              <div className="cu-process-content">
                <h3 className="cu-process-title">Consultation</h3>
                <p className="cu-process-desc">Meet with our design experts to discuss your vision, preferences, and budget. We will help refine your ideas.</p>
              </div>
            </div>
            <div className="cu-process-item">
              <span className="cu-process-num">02</span>
              <div className="cu-process-content">
                <h3 className="cu-process-title">Design Creation</h3>
                <p className="cu-process-desc">Our designers create detailed sketches and 3D renderings for your review and approval.</p>
              </div>
            </div>
            <div className="cu-process-item">
              <span className="cu-process-num">03</span>
              <div className="cu-process-content">
                <h3 className="cu-process-title">Crafting</h3>
                <p className="cu-process-desc">Master jewelers handcraft your piece using premium materials and time-honored techniques.</p>
              </div>
            </div>
            <div className="cu-process-item">
              <span className="cu-process-num">04</span>
              <div className="cu-process-content">
                <h3 className="cu-process-title">Delivery</h3>
                <p className="cu-process-desc">Receive your one-of-a-kind masterpiece, beautifully packaged and ready to be treasured.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <div className="cu-services-bg">
          <section className="cu-section">
            <div className="cu-section-header">
              <p className="cu-section-eyebrow">Our Services</p>
              <h2 className="cu-section-title">Custom Design Services</h2>
            </div>

            <div className="cu-services-grid">
              <div className="cu-service-card">
                <Sparkles className="cu-service-icon" size={40} strokeWidth={1} />
                <h3 className="cu-service-title">Engagement Rings</h3>
                <p className="cu-service-desc">Design the perfect engagement ring that captures your love story and reflects your unique style.</p>
                <Link href="/Pages/contact" className="cu-service-link">Learn More <ChevronRight size={14} /></Link>
              </div>

              <div className="cu-service-card">
                <Gem className="cu-service-icon" size={40} strokeWidth={1} />
                <h3 className="cu-service-title">Fine Jewelry</h3>
                <p className="cu-service-desc">Create bespoke necklaces, earrings, bracelets, and more with our expert guidance.</p>
                <Link href="/Pages/contact" className="cu-service-link">Learn More <ChevronRight size={14} /></Link>
              </div>

              <div className="cu-service-card">
                <Hammer className="cu-service-icon" size={40} strokeWidth={1} />
                <h3 className="cu-service-title">Redesign & Restore</h3>
                <p className="cu-service-desc">Transform heirloom pieces into modern treasures while preserving sentimental value.</p>
                <Link href="/Pages/contact" className="cu-service-link">Learn More <ChevronRight size={14} /></Link>
              </div>

              <div className="cu-service-card">
                <PenTool className="cu-service-icon" size={40} strokeWidth={1} />
                <h3 className="cu-service-title">Ring Modifications</h3>
                <p className="cu-service-desc">Resize, reshape, or add stones to your existing jewelry with precision craftsmanship.</p>
                <Link href="/Pages/contact" className="cu-service-link">Learn More <ChevronRight size={14} /></Link>
              </div>

              <div className="cu-service-card">
                <Scissors className="cu-service-icon" size={40} strokeWidth={1} />
                <h3 className="cu-service-title">Stone Selection</h3>
                <p className="cu-service-desc">Choose from our curated collection of certified diamonds and precious gemstones.</p>
                <Link href="/Pages/contact" className="cu-service-link">Learn More <ChevronRight size={14} /></Link>
              </div>

              <div className="cu-service-card">
                <FileText className="cu-service-icon" size={40} strokeWidth={1} />
                <h3 className="cu-service-title">Engraving</h3>
                <p className="cu-service-desc">Personalize your piece with custom engraving, from dates to special messages.</p>
                <Link href="/Pages/contact" className="cu-service-link">Learn More <ChevronRight size={14} /></Link>
              </div>
            </div>
          </section>
        </div>

        {/* Gallery Section */}
        <section className="cu-section">
          <div className="cu-section-header">
            <p className="cu-section-eyebrow">Our Creations</p>
            <h2 className="cu-section-title">Custom Design Portfolio</h2>
          </div>

          <div className="cu-gallery-grid">
            <div className="cu-gallery-item">
              <img src="/Home Page/Most Loved Pieces/Frame 122.png" alt="Art Deco Revival" className="cu-gallery-img" />
              <div className="cu-gallery-overlay">
                <h3 className="cu-gallery-title">Art Deco Revival</h3>
                <p className="cu-gallery-desc">Vintage-inspired engagement ring with geometric details</p>
              </div>
            </div>
            <div className="cu-gallery-item">
              <img src="/Home Page/Most Loved Pieces/Frame 123.png" alt="Nature Embrace" className="cu-gallery-img" />
              <div className="cu-gallery-overlay">
                <h3 className="cu-gallery-title">Nature Embrace</h3>
                <p className="cu-gallery-desc">Organic leaf motif with emerald accents</p>
              </div>
            </div>
            <div className="cu-gallery-item">
              <img src="/Home Page/Most Loved Pieces/Frame 124.png" alt="Modern Minimalist" className="cu-gallery-img" />
              <div className="cu-gallery-overlay">
                <h3 className="cu-gallery-title">Modern Minimalist</h3>
                <p className="cu-gallery-desc">Sleek solitaire with hidden diamond details</p>
              </div>
            </div>
            <div className="cu-gallery-item">
              <img src="/Home Page/Most Loved Pieces/Frame 125.png" alt="Royal Heritage" className="cu-gallery-img" />
              <div className="cu-gallery-overlay">
                <h3 className="cu-gallery-title">Royal Heritage</h3>
                <p className="cu-gallery-desc">Heirloom redesign with sapphire centerpiece</p>
              </div>
            </div>
            <div className="cu-gallery-item">
              <img src="/Home Page/Custom Design Template/Frame 91.png" alt="Celestial Dream" className="cu-gallery-img" />
              <div className="cu-gallery-overlay">
                <h3 className="cu-gallery-title">Celestial Dream</h3>
                <p className="cu-gallery-desc">Star-inspired pendant with diamond constellation</p>
              </div>
            </div>
            <div className="cu-gallery-item">
              <img src="/About Page/Header/Frame 37391.png" alt="Timeless Classic" className="cu-gallery-img" />
              <div className="cu-gallery-overlay">
                <h3 className="cu-gallery-title">Timeless Classic</h3>
                <p className="cu-gallery-desc">Three stone ring with matching wedding band</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cu-cta-section">
          <div className="cu-cta-content">
            <h2 className="cu-cta-title">Ready to Begin?</h2>
            <p className="cu-cta-text">Schedule a complimentary consultation with our design team to explore possibilities and bring your vision to life. No obligation, just creative inspiration.</p>
            <div className="cu-cta-btns">
              <Link href="/Pages/contact" className="cu-btn-dark">Book a Consultation</Link>
              <Link href="/Pages" className="cu-btn-outline">View Design Gallery</Link>
            </div>
          </div>
        </section>

        <TrustBadge />
      </main>

      <Footer />
    </>
  );
}