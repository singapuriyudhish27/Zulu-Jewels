'use client';
import { useEffect } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import { Search, User, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function WeddingPage() {
  useEffect(() => {

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Wishlist toggle
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                this.textContent = this.textContent === '♡' ? '♥' : '♡';
                this.style.color = this.textContent === '♥' ? '#D4AF37' : '';
            });
        });
    
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

        /* Hero Banner */
        .hero-banner {
            margin-top: 90px;
            height: 500px;
            background: linear-gradient(135deg, rgba(212,175,55,0.9), rgba(200,168,130,0.9)),
                        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><rect fill="%231a1a1a" width="1200" height="800"/></svg>');
            background-size: cover;
            background-position: center;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: white;
            position: relative;
            overflow: hidden;
        }

        .hero-banner::before {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.2));
        }

        .hero-content {
            position: relative;
            z-index: 1;
            max-width: 800px;
            padding: 0 40px;
        }

        .hero-badge {
            display: inline-block;
            padding: 10px 25px;
            background: rgba(255,255,255,0.2);
            border: 1px solid white;
            border-radius: 50px;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 30px;
        }

        .hero-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 72px;
            font-weight: 400;
            margin-bottom: 20px;
        }

        .hero-subtitle {
            font-size: 18px;
            color: rgba(255,255,255,0.9);
            letter-spacing: 0.5px;
        }

        /* Category Tabs */
        .category-tabs {
            background: white;
            padding: 40px 80px;
            display: flex;
            justify-content: center;
            gap: 20px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.05);
        }

        .tab-btn {
            padding: 15px 40px;
            background: transparent;
            border: 2px solid var(--border-light);
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 50px;
            color: var(--text-dark);
        }

        .tab-btn.active,
        .tab-btn:hover {
            background: var(--primary-gold);
            border-color: var(--primary-gold);
            color: white;
        }

        /* Main Content */
        .main-content {
            padding: 80px 80px;
            max-width: 1600px;
            margin: 0 auto;
        }

        .section-header {
            text-align: center;
            margin-bottom: 60px;
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
            font-size: 48px;
            font-weight: 400;
            color: var(--text-dark);
        }

        /* Products Grid */
        .products-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 35px;
            margin-bottom: 60px;
        }

        .product-card {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 5px 25px rgba(0,0,0,0.06);
            transition: all 0.4s ease;
            cursor: pointer;
        }

        .product-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 15px 45px rgba(0,0,0,0.12);
        }

        .product-image {
            position: relative;
            width: 100%;
            height: 280px;
            background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
            overflow: hidden;
        }

        .product-image::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 120px;
            height: 120px;
            background: radial-gradient(circle, rgba(212,175,55,0.2), transparent);
            animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 0.9; }
        }

        .product-badge {
            position: absolute;
            top: 12px;
            left: 12px;
            padding: 5px 12px;
            background: var(--primary-gold);
            color: var(--dark-bg);
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
            border-radius: 12px;
        }

        .wishlist-btn {
            position: absolute;
            top: 12px;
            right: 12px;
            width: 32px;
            height: 32px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
        }

        .wishlist-btn:hover {
            background: var(--primary-gold);
            color: white;
            transform: scale(1.1);
        }

        .product-info {
            padding: 22px;
        }

        .product-name {
            font-family: 'Cormorant Garamond', serif;
            font-size: 20px;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 8px;
        }

        .product-specs {
            font-size: 12px;
            color: #888;
            margin-bottom: 12px;
        }

        .product-price {
            font-size: 22px;
            font-weight: 700;
            color: var(--primary-gold);
            margin-bottom: 12px;
        }

        .quick-view-btn {
            width: 100%;
            padding: 10px;
            background: var(--dark-bg);
            color: white;
            border: none;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 4px;
        }

        .quick-view-btn:hover {
            background: var(--primary-gold);
            color: var(--dark-bg);
        }

        /* Info Banner */
        .info-banner {
            background: linear-gradient(135deg, var(--dark-bg), #2c2c2c);
            padding: 80px;
            margin: 80px 0;
            border-radius: 12px;
            text-align: center;
            color: white;
        }

        .info-banner h2 {
            font-family: 'Cormorant Garamond', serif;
            font-size: 42px;
            margin-bottom: 20px;
        }

        .info-banner p {
            font-size: 16px;
            color: rgba(255,255,255,0.8);
            max-width: 700px;
            margin: 0 auto 30px;
            line-height: 1.8;
        }

        .info-btn {
            padding: 15px 40px;
            background: var(--primary-gold);
            color: var(--dark-bg);
            border: none;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 4px;
        }

        .info-btn:hover {
            background: var(--accent-rose);
            transform: translateY(-2px);
        }

        /* Features Grid */
        .features-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 40px;
            margin-top: 80px;
        }

        .feature-card {
            text-align: center;
            padding: 40px 30px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.04);
        }

        .feature-icon {
            width: 70px;
            height: 70px;
            margin: 0 auto 25px;
            background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(200,168,130,0.1));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
        }

        .feature-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 12px;
        }

        .feature-desc {
            font-size: 14px;
            color: #666;
            line-height: 1.6;
        }

        @media (max-width: 1200px) {
            .products-grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }

        @media (max-width: 768px) {
            nav {
                padding: 20px 30px;
            }
            .main-content {
                padding: 50px 30px;
            }
            .hero-title {
                font-size: 48px;
            }
            .products-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            .features-grid {
                grid-template-columns: 1fr;
            }
            .category-tabs {
                flex-wrap: wrap;
                padding: 30px 30px;
            }
        }
    
      `}} />
      
    {/* Navigation */}
    <nav>
        <div className="logo" onClick={() => window.location.href = '/Pages'}>Zulu Jewellers</div>
        <ul className="nav-menu">
            <li><a href="/Pages/engagement">Engagement</a></li>
            <li><a href="/Pages/wedding" className="active">Wedding</a></li>
            <li><a href="/Pages/custom">Custom</a></li>
            <li><a href="/Pages/About">About</a></li>
            <li><a href="/Pages/contact">Contact</a></li>
        </ul>
        <div className="nav-icons">
            <Link href="/Pages/Profile" className="icon-btn" aria-label="User Profile">
                <User size={18} strokeWidth={1.5} />
            </Link>
            <Link href="/Pages/cart" className="icon-btn" aria-label="Shopping Cart">
                <ShoppingCart size={18} strokeWidth={1.5} />
            </Link>
        </div>
    </nav>

    {/* Hero Banner */}
    <div className="hero-banner">
        <div className="hero-content">
            <div className="hero-badge">Perfect Match</div>
            <h1 className="hero-title">Wedding Bands</h1>
            <p className="hero-subtitle">Celebrate your eternal love with exquisite wedding bands crafted to perfection</p>
        </div>
    </div>

    {/* Category Tabs */}
    <div className="category-tabs">
        <button className="tab-btn active">Women Bands</button>
        <button className="tab-btn">Men Bands</button>
        <button className="tab-btn">Eternity Bands</button>
        <button className="tab-btn">Matching Sets</button>
    </div>

    {/* Main Content */}
    <div className="main-content">
        <div className="section-header">
            <div className="section-label">Timeless Commitment</div>
            <h2 className="section-title">Women Wedding Bands</h2>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
            <div className="product-card">
                <div className="product-image">
                    <span className="product-badge">POPULAR</span>
                    <div className="wishlist-btn">♡</div>
                </div>
                <div className="product-info">
                    <h3 className="product-name">Classic Pavé Band</h3>
                    <div className="product-specs">14K White Gold | Diamond</div>
                    <div className="product-price">$945</div>
                    <button className="quick-view-btn">Quick View</button>
                </div>
            </div>

            <div className="product-card">
                <div className="product-image">
                    <div className="wishlist-btn">♡</div>
                </div>
                <div className="product-info">
                    <h3 className="product-name">Delicate Eternity</h3>
                    <div className="product-specs">18K Yellow Gold | Diamond</div>
                    <div className="product-price">$1,245</div>
                    <button className="quick-view-btn">Quick View</button>
                </div>
            </div>

            <div className="product-card">
                <div className="product-image">
                    <span className="product-badge">NEW</span>
                    <div className="wishlist-btn">♡</div>
                </div>
                <div className="product-info">
                    <h3 className="product-name">Vintage Milgrain</h3>
                    <div className="product-specs">Platinum | Diamond</div>
                    <div className="product-price">$1,580</div>
                    <button className="quick-view-btn">Quick View</button>
                </div>
            </div>

            <div className="product-card">
                <div className="product-image">
                    <div className="wishlist-btn">♡</div>
                </div>
                <div className="product-info">
                    <h3 className="product-name">Channel Set Band</h3>
                    <div className="product-specs">14K Rose Gold | Diamond</div>
                    <div className="product-price">$1,125</div>
                    <button className="quick-view-btn">Quick View</button>
                </div>
            </div>

            <div className="product-card">
                <div className="product-image">
                    <span className="product-badge">BEST SELLER</span>
                    <div className="wishlist-btn">♡</div>
                </div>
                <div className="product-info">
                    <h3 className="product-name">Half Eternity</h3>
                    <div className="product-specs">14K White Gold | Diamond</div>
                    <div className="product-price">$895</div>
                    <button className="quick-view-btn">Quick View</button>
                </div>
            </div>

            <div className="product-card">
                <div className="product-image">
                    <div className="wishlist-btn">♡</div>
                </div>
                <div className="product-info">
                    <h3 className="product-name">Art Deco Band</h3>
                    <div className="product-specs">18K White Gold | Diamond</div>
                    <div className="product-price">$1,450</div>
                    <button className="quick-view-btn">Quick View</button>
                </div>
            </div>

            <div className="product-card">
                <div className="product-image">
                    <div className="wishlist-btn">♡</div>
                </div>
                <div className="product-info">
                    <h3 className="product-name">Curved Contour</h3>
                    <div className="product-specs">14K Yellow Gold | Diamond</div>
                    <div className="product-price">$1,050</div>
                    <button className="quick-view-btn">Quick View</button>
                </div>
            </div>

            <div className="product-card">
                <div className="product-image">
                    <span className="product-badge">30% OFF</span>
                    <div className="wishlist-btn">♡</div>
                </div>
                <div className="product-info">
                    <h3 className="product-name">Twisted Band</h3>
                    <div className="product-specs">Platinum | Diamond</div>
                    <div className="product-price">$1,680</div>
                    <button className="quick-view-btn">Quick View</button>
                </div>
            </div>
        </div>

        {/* Info Banner */}
        <div className="info-banner">
            <h2>Find Your Perfect Match</h2>
            <p>Not sure which style suits you best? Our expert consultants are here to help you find the perfect wedding band that complements your engagement ring and personal style.</p>
            <button className="info-btn">Schedule a Consultation</button>
        </div>

        {/* Features Grid */}
        <div className="features-grid">
            <div className="feature-card">
                <div className="feature-icon">💎</div>
                <h3 className="feature-title">Quality Craftsmanship</h3>
                <p className="feature-desc">Every band is meticulously crafted by master jewelers with decades of experience</p>
            </div>
            <div className="feature-card">
                <div className="feature-icon">✨</div>
                <h3 className="feature-title">Perfect Sizing</h3>
                <p className="feature-desc">Free professional sizing to ensure your band fits perfectly and comfortably</p>
            </div>
            <div className="feature-card">
                <div className="feature-icon">🎁</div>
                <h3 className="feature-title">Complimentary Engraving</h3>
                <p className="feature-desc">Personalize your band with a special message or date at no extra cost</p>
            </div>
        </div>
    </div>

    </>
  );
}