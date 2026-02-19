'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Search, User, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

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
            background: white;
            color: var(--text-dark);
        }

        /* Navigation */
        nav {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            padding: 25px 80px;
            background: white;
            box-shadow: 0 2px 20px rgba(0,0,0,0.05);
            display: flex;
            justify-content: space-between;
            align-items: center;
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
            gap: 45px;
            list-style: none;
        }

        .nav-menu a {
            color: var(--text-dark);
            text-decoration: none;
            font-size: 13px;
            font-weight: 500;
            letter-spacing: 1px;
            text-transform: uppercase;
            transition: all 0.3s ease;
            position: relative;
        }

        .nav-menu a.active::after,
        .nav-menu a:hover::after {
            width: 100%;
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
            color: var(--text-dark);
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 18px;
        }

        .icon-btn:hover {
            background: var(--primary-gold);
            border-color: var(--primary-gold);
            color: white;
        }

        /* Hero Section */
        .hero-section {
            margin-top: 90px;
            height: 600px;
            background: linear-gradient(135deg, var(--dark-bg), #2c2c2c);
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: white;
            position: relative;
            overflow: hidden;
        }

        .hero-section::before {
            content: '';
            position: absolute;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(212,175,55,0.15), transparent);
            animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(50px, 50px); }
        }

        .hero-content {
            position: relative;
            z-index: 1;
            max-width: 900px;
            padding: 0 40px;
        }

        .hero-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 80px;
            font-weight: 300;
            margin-bottom: 25px;
        }

        .hero-title strong {
            font-weight: 700;
            background: linear-gradient(135deg, var(--primary-gold), var(--accent-rose));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
            font-size: 20px;
            color: rgba(255,255,255,0.85);
            margin-bottom: 40px;
            line-height: 1.6;
        }

        .hero-cta {
            padding: 18px 45px;
            background: var(--primary-gold);
            color: var(--dark-bg);
            border: none;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 2px;
        }

        .hero-cta:hover {
            background: var(--accent-rose);
            transform: translateY(-3px);
            box-shadow: 0 10px 30px rgba(212,175,55,0.3);
        }

        /* Process Section */
        .process-section {
            padding: 100px 80px;
            background: white;
        }

        .section-header {
            text-align: center;
            margin-bottom: 80px;
        }

        .section-label {
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 3px;
            color: var(--primary-gold);
            text-transform: uppercase;
            margin-bottom: 15px;
        }

        .section-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 52px;
            font-weight: 400;
            color: var(--text-dark);
        }

        .process-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 50px;
            max-width: 1400px;
            margin: 0 auto;
        }

        .process-step {
            text-align: center;
            position: relative;
        }

        .step-number {
            width: 80px;
            height: 80px;
            margin: 0 auto 30px;
            background: linear-gradient(135deg, var(--primary-gold), var(--accent-rose));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            font-weight: 700;
            color: white;
            position: relative;
        }

        .process-step:not(:last-child) .step-number::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 100%;
            width: 100px;
            height: 2px;
            background: linear-gradient(to right, var(--primary-gold), var(--border-light));
        }

        .step-title {
            font-size: 20px;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 15px;
        }

        .step-desc {
            font-size: 14px;
            color: #666;
            line-height: 1.7;
        }

        /* Services Section */
        .services-section {
            padding: 100px 80px;
            background: #f9f9f9;
        }

        .services-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 40px;
            max-width: 1400px;
            margin: 0 auto;
        }

        .service-card {
            background: white;
            padding: 50px 40px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.06);
            transition: all 0.4s ease;
            text-align: center;
        }

        .service-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 60px rgba(0,0,0,0.12);
        }

        .service-icon {
            font-size: 48px;
            margin-bottom: 25px;
        }

        .service-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 28px;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 15px;
        }

        .service-desc {
            font-size: 15px;
            color: #666;
            line-height: 1.7;
            margin-bottom: 25px;
        }

        .service-link {
            color: var(--primary-gold);
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
            text-decoration: none;
            transition: all 0.3s ease;
        }

        .service-link:hover {
            color: var(--accent-rose);
        }

        /* Gallery Section */
        .gallery-section {
            padding: 100px 80px;
            background: white;
        }

        .gallery-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 30px;
            max-width: 1400px;
            margin: 0 auto;
        }

        .gallery-item {
            position: relative;
            height: 400px;
            background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
            border-radius: 12px;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.4s ease;
        }

        .gallery-item:hover {
            transform: scale(1.03);
            box-shadow: 0 20px 50px rgba(0,0,0,0.15);
        }

        .gallery-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.7));
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .gallery-item:hover::before {
            opacity: 1;
        }

        .gallery-overlay {
            position: absolute;
            bottom: -100px;
            left: 0;
            right: 0;
            padding: 30px;
            color: white;
            transition: bottom 0.3s ease;
        }

        .gallery-item:hover .gallery-overlay {
            bottom: 0;
        }

        .gallery-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .gallery-desc {
            font-size: 14px;
            color: rgba(255,255,255,0.9);
        }

        /* CTA Section */
        .cta-section {
            padding: 100px 80px;
            background: linear-gradient(135deg, var(--primary-gold), var(--accent-rose));
            text-align: center;
            color: white;
        }

        .cta-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 56px;
            font-weight: 400;
            margin-bottom: 25px;
        }

        .cta-desc {
            font-size: 18px;
            color: rgba(255,255,255,0.95);
            max-width: 700px;
            margin: 0 auto 40px;
            line-height: 1.7;
        }

        .cta-buttons {
            display: flex;
            gap: 20px;
            justify-content: center;
        }

        .cta-btn {
            padding: 18px 45px;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 2px;
        }

        .cta-btn.primary {
            background: white;
            color: var(--dark-bg);
        }

        .cta-btn.primary:hover {
            background: var(--dark-bg);
            color: white;
            transform: translateY(-3px);
        }

        .cta-btn.secondary {
            background: transparent;
            color: white;
            border: 2px solid white;
        }

        .cta-btn.secondary:hover {
            background: white;
            color: var(--dark-bg);
            transform: translateY(-3px);
        }

        @media (max-width: 1200px) {
            .process-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            .process-step:not(:last-child) .step-number::after {
                display: none;
            }
        }

        @media (max-width: 768px) {
            nav {
                padding: 20px 30px;
            }
            .hero-title {
                font-size: 48px;
            }
            .process-section,
            .services-section,
            .gallery-section,
            .cta-section {
                padding: 60px 30px;
            }
            .process-grid,
            .services-grid,
            .gallery-grid {
                grid-template-columns: 1fr;
            }
        }
    
      `}} />
      
    {/* <!-- Navigation --> */}
    <nav>
        <div className="logo" onClick={() => window.location.href = '/Pages'}>Zulu Jewellers</div>
        <ul className="nav-menu">
            <li><a href="/Pages/engagement">Engagement</a></li>
            <li><a href="/Pages/wedding">Wedding</a></li>
            <li><a href="/Pages/custom" className="active">Custom</a></li>
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

    {/* <!-- Hero Section --> */}
    <div className="hero-section">
        <div className="hero-content">
            <h1 className="hero-title">Design Your <strong>Dream Jewelry</strong></h1>
            <p className="hero-subtitle">Create a truly unique piece that reflects your personal style and story. Our master craftsmen bring your vision to life with unparalleled artistry and precision.</p>
            <button className="hero-cta" onClick={() => window.location.href = '/Pages/contact'}>Start Your Design Journey</button>
        </div>
    </div>

    {/* <!-- Process Section --> */}
    <div className="process-section">
        <div className="section-header">
            <div className="section-label">How It Works</div>
            <h2 className="section-title">The Custom Design Process</h2>
        </div>

        <div className="process-grid">
            <div className="process-step">
                <div className="step-number">1</div>
                <h3 className="step-title">Consultation</h3>
                <p className="step-desc">Meet with our design experts to discuss your vision, preferences, and budget. We will help refine your ideas.</p>
            </div>

            <div className="process-step">
                <div className="step-number">2</div>
                <h3 className="step-title">Design Creation</h3>
                <p className="step-desc">Our designers create detailed sketches and 3D renderings for your review and approval.</p>
            </div>

            <div className="process-step">
                <div className="step-number">3</div>
                <h3 className="step-title">Crafting</h3>
                <p className="step-desc">Master jewelers handcraft your piece using premium materials and time-honored techniques.</p>
            </div>

            <div className="process-step">
                <div className="step-number">4</div>
                <h3 className="step-title">Delivery</h3>
                <p className="step-desc">Receive your one-of-a-kind masterpiece, beautifully packaged and ready to be treasured.</p>
            </div>
        </div>
    </div>

    {/* <!-- Services Section --> */}
    <div className="services-section">
        <div className="section-header">
            <div className="section-label">Our Services</div>
            <h2 className="section-title">Custom Design Services</h2>
        </div>

        <div className="services-grid">
            <div className="service-card">
                <div className="service-icon">💍</div>
                <h3 className="service-title">Engagement Rings</h3>
                <p className="service-desc">Design the perfect engagement ring that captures your love story and reflects your unique style.</p>
                <a href="#" className="service-link">Learn More →</a>
            </div>

            <div className="service-card">
                <div className="service-icon">✨</div>
                <h3 className="service-title">Fine Jewelry</h3>
                <p className="service-desc">Create bespoke necklaces, earrings, bracelets, and more with our expert guidance.</p>
                <a href="#" className="service-link">Learn More →</a>
            </div>

            <div className="service-card">
                <div className="service-icon">🔨</div>
                <h3 className="service-title">Redesign & Restore</h3>
                <p className="service-desc">Transform heirloom pieces into modern treasures while preserving sentimental value.</p>
                <a href="#" className="service-link">Learn More →</a>
            </div>

            <div className="service-card">
                <div className="service-icon">🎨</div>
                <h3 className="service-title">Ring Modifications</h3>
                <p className="service-desc">Resize, reshape, or add stones to your existing jewelry with precision craftsmanship.</p>
                <a href="#" className="service-link">Learn More →</a>
            </div>

            <div className="service-card">
                <div className="service-icon">💎</div>
                <h3 className="service-title">Stone Selection</h3>
                <p className="service-desc">Choose from our curated collection of certified diamonds and precious gemstones.</p>
                <a href="#" className="service-link">Learn More →</a>
            </div>

            <div className="service-card">
                <div className="service-icon">📝</div>
                <h3 className="service-title">Engraving</h3>
                <p className="service-desc">Personalize your piece with custom engraving, from dates to special messages.</p>
                <a href="#" className="service-link">Learn More →</a>
            </div>
        </div>
    </div>

    {/* <!-- Gallery Section --> */}
    <div className="gallery-section">
        <div className="section-header">
            <div className="section-label">Our Creations</div>
            <h2 className="section-title">Custom Design Portfolio</h2>
        </div>

        <div className="gallery-grid">
            <div className="gallery-item">
                <div className="gallery-overlay">
                    <h3 className="gallery-title">Art Deco Revival</h3>
                    <p className="gallery-desc">Vintage-inspired engagement ring with geometric details</p>
                </div>
            </div>

            <div className="gallery-item">
                <div className="gallery-overlay">
                    <h3 className="gallery-title">Nature Embrace</h3>
                    <p className="gallery-desc">Organic leaf motif with emerald accents</p>
                </div>
            </div>

            <div className="gallery-item">
                <div className="gallery-overlay">
                    <h3 className="gallery-title">Modern Minimalist</h3>
                    <p className="gallery-desc">Sleek solitaire with hidden diamond details</p>
                </div>
            </div>

            <div className="gallery-item">
                <div className="gallery-overlay">
                    <h3 className="gallery-title">Royal Heritage</h3>
                    <p className="gallery-desc">Heirloom redesign with sapphire centerpiece</p>
                </div>
            </div>

            <div className="gallery-item">
                <div className="gallery-overlay">
                    <h3 className="gallery-title">Celestial Dream</h3>
                    <p className="gallery-desc">Star-inspired pendant with diamond constellation</p>
                </div>
            </div>

            <div className="gallery-item">
                <div className="gallery-overlay">
                    <h3 className="gallery-title">Timeless Classic</h3>
                    <p className="gallery-desc">Three stone ring with matching wedding band</p>
                </div>
            </div>
        </div>
    </div>

    {/* <!-- CTA Section --> */}
    <div className="cta-section">
        <h2 className="cta-title">Ready to Begin?</h2>
        <p className="cta-desc">Schedule a complimentary consultation with our design team to explore possibilities and bring your vision to life. No obligation, just creative inspiration.</p>
        <div className="cta-buttons">
            <button className="cta-btn primary">Book a Consultation</button>
            <button className="cta-btn secondary">View Design Gallery</button>
        </div>
    </div>

    </>
  );
}