'use client';
import { useEffect } from 'react';
import { Search, User, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function EngagementPage() {
  useEffect(() => {

        // Shape filter toggle
        document.querySelectorAll('.shape-filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                this.classList.toggle('active');
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

        .nav-menu a.active,
        .nav-menu a:hover {
            color: var(--primary-gold);
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

        .nav-menu a.active::after,
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
            color: var(--text-dark);
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 18px;
        }

        .icon-btn:hover {
            background: var(--primary-gold);
            border-color: var(--primary-gold);
            color: white;
            transform: scale(1.05);
        }

        /* Page Header */
        .page-header {
            margin-top: 90px;
            padding: 80px 80px 60px;
            background: linear-gradient(135deg, var(--dark-bg) 0%, #2c2c2c 100%);
            text-align: center;
            color: white;
        }

        .breadcrumb {
            font-size: 13px;
            letter-spacing: 1px;
            color: rgba(255,255,255,0.6);
            margin-bottom: 20px;
        }

        .breadcrumb a {
            color: rgba(255,255,255,0.6);
            text-decoration: none;
            transition: color 0.3s ease;
        }

        .breadcrumb a:hover {
            color: var(--primary-gold);
        }

        .page-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 64px;
            font-weight: 400;
            margin-bottom: 20px;
        }

        .page-subtitle {
            font-size: 16px;
            color: rgba(255,255,255,0.8);
            letter-spacing: 0.5px;
        }

        /* Ring Builder CTA */
        .ring-builder-banner {
            background: linear-gradient(135deg, var(--primary-gold), var(--accent-rose));
            padding: 50px 80px;
            margin: 0;
        }

        .builder-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1400px;
            margin: 0 auto;
        }

        .builder-text h3 {
            font-family: 'Cormorant Garamond', serif;
            font-size: 36px;
            color: white;
            margin-bottom: 10px;
        }

        .builder-text p {
            color: rgba(255,255,255,0.9);
            font-size: 15px;
        }

        .builder-buttons {
            display: flex;
            gap: 15px;
        }

        .builder-btn {
            padding: 15px 35px;
            background: white;
            color: var(--dark-bg);
            border: none;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 2px;
        }

        .builder-btn:hover {
            background: var(--dark-bg);
            color: white;
            transform: translateY(-2px);
        }

        .builder-btn.secondary {
            background: transparent;
            border: 2px solid white;
            color: white;
        }

        .builder-btn.secondary:hover {
            background: white;
            color: var(--dark-bg);
        }

        /* Main Content */
        .content-wrapper {
            display: flex;
            gap: 40px;
            padding: 60px 80px;
            max-width: 1920px;
            margin: 0 auto;
        }

        /* Filters Sidebar */
        .filters-sidebar {
            width: 280px;
            flex-shrink: 0;
        }

        .filter-section {
            background: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 25px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.04);
        }

        .filter-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 20px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .filter-options {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .filter-option {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
        }

        .filter-option input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
            accent-color: var(--primary-gold);
        }

        .filter-option label {
            font-size: 14px;
            color: var(--text-dark);
            cursor: pointer;
        }

        .shape-filters {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
        }

        .shape-filter-btn {
            padding: 5px;
            background: white;
            border: 1px solid var(--border-light);
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: center;
        }

        .shape-filter-btn:hover,
        .shape-filter-btn.active {
            border-color: var(--primary-gold);
            background: rgba(212,175,55,0.05);
        }

        .shape-filter-btn svg {
            width: 30px;
            height: 30px;
            fill: var(--text-dark);
            margin-bottom: 5px;
        }

        .shape-filter-btn.active svg {
            fill: var(--primary-gold);
        }

        .shape-filter-name {
            font-size: 11px;
            font-weight: 600;
            color: var(--text-dark);
            text-transform: uppercase;
        }

        .price-range {
            margin-top: 15px;
        }

        .price-inputs {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }

        .price-input {
            flex: 1;
            padding: 10px;
            border: 1px solid var(--border-light);
            border-radius: 4px;
            font-size: 14px;
        }

        .apply-filter-btn {
            width: 100%;
            padding: 12px;
            background: var(--primary-gold);
            color: var(--dark-bg);
            border: none;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 4px;
            margin-top: 15px;
        }

        .apply-filter-btn:hover {
            background: var(--accent-rose);
        }

        /* Products Area */
        .products-area {
            flex: 1;
        }

        .products-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
        }

        .results-count {
            font-size: 14px;
            color: #666;
        }

        .sort-dropdown {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .sort-dropdown select {
            padding: 10px 35px 10px 15px;
            border: 1px solid var(--border-light);
            border-radius: 4px;
            font-size: 14px;
            cursor: pointer;
            background: white;
        }

        .products-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 40px;
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
            transform: translateY(-10px);
            box-shadow: 0 15px 45px rgba(0,0,0,0.12);
        }

        .product-image {
            position: relative;
            width: 100%;
            height: 320px;
            background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
            overflow: hidden;
        }

        .product-image::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 150px;
            height: 150px;
            background: radial-gradient(circle, rgba(212,175,55,0.2), transparent);
            animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
            50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.8; }
        }

        .product-badge {
            position: absolute;
            top: 15px;
            left: 15px;
            padding: 6px 15px;
            background: var(--primary-gold);
            color: var(--dark-bg);
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
            border-radius: 15px;
        }

        .wishlist-btn {
            position: absolute;
            top: 15px;
            right: 15px;
            width: 35px;
            height: 35px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .wishlist-btn:hover {
            background: var(--primary-gold);
            color: white;
            transform: scale(1.1);
        }

        .product-info {
            padding: 25px;
        }

        .product-name {
            font-family: 'Cormorant Garamond', serif;
            font-size: 22px;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 10px;
        }

        .product-specs {
            font-size: 12px;
            color: #888;
            letter-spacing: 0.5px;
            margin-bottom: 15px;
        }

        .product-price {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 15px;
        }

        .price-current {
            font-size: 24px;
            font-weight: 700;
            color: var(--primary-gold);
        }

        .price-original {
            font-size: 16px;
            color: #999;
            text-decoration: line-through;
        }

        .product-cta {
            width: 100%;
            padding: 12px;
            background: var(--dark-bg);
            color: white;
            border: none;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 1.2px;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 4px;
        }

        .product-cta:hover {
            background: var(--primary-gold);
            color: var(--dark-bg);
        }

        /* Pagination */
        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            margin-top: 60px;
            padding-bottom: 60px;
        }

        .page-btn {
            width: 40px;
            height: 40px;
            border: 1px solid var(--border-light);
            background: white;
            color: var(--text-dark);
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
        }

        .page-btn:hover,
        .page-btn.active {
            background: var(--primary-gold);
            border-color: var(--primary-gold);
            color: white;
        }

        /* Responsive */
        @media (max-width: 1200px) {
            .products-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (max-width: 768px) {
            nav {
                padding: 20px 30px;
            }
            .content-wrapper {
                flex-direction: column;
                padding: 40px 30px;
            }
            .filters-sidebar {
                width: 100%;
            }
            .products-grid {
                grid-template-columns: 1fr;
            }
            .page-header {
                padding: 60px 30px 40px;
            }
            .page-title {
                font-size: 42px;
            }
        }
    
      `}} />
      
    {/* Navigation */}
    <nav>
        <div className="logo" onClick={() => window.location.href = '/Pages'}>Zulu Jewellers</div>
        <ul className="nav-menu">
            <li><a href="/Pages/engagement" className="active">Engagement</a></li>
            <li><a href="/Pages/wedding">Wedding</a></li>
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

    {/* Page Header */}
    <div className="page-header">
        <div className="breadcrumb">
            <a href="/Pages">Home</a> / Engagement Rings
        </div>
        <h1 className="page-title">Engagement Rings</h1>
        <p className="page-subtitle">Discover our handcrafted collection of timeless engagement rings</p>
    </div>

    {/* Ring Builder Banner */}
    <div className="ring-builder-banner">
        <div className="builder-content">
            <div className="builder-text">
                <h3>Create Your Dream Ring</h3>
                <p>Design a one-of-a-kind engagement ring with our ring builder</p>
            </div>
            <div className="builder-buttons">
                <button className="builder-btn">Start With A Diamond</button>
                <button className="builder-btn secondary">Start With A Setting</button>
            </div>
        </div>
    </div>

    {/* Main Content */}
    <div className="content-wrapper">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
            <div className="filter-section">
                <h3 className="filter-title">Shape</h3>
                <div className="shape-filters">
                    <div className="shape-filter-btn active">
                        <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/></svg>
                        <div className="shape-filter-name">Round</div>
                    </div>
                    <div className="shape-filter-btn">
                        <svg viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="30" ry="45"/></svg>
                        <div className="shape-filter-name">Oval</div>
                    </div>
                    <div className="shape-filter-btn">
                        <svg viewBox="0 0 100 100"><rect x="25" y="20" width="50" height="60" rx="2"/></svg>
                        <div className="shape-filter-name">Emerald</div>
                    </div>
                    <div className="shape-filter-btn">
                        <svg viewBox="0 0 100 100"><rect x="30" y="30" width="40" height="40"/></svg>
                        <div className="shape-filter-name">Princess</div>
                    </div>
                    <div className="shape-filter-btn">
                        <svg viewBox="0 0 100 100"><path d="M50,20 L70,50 L50,80 L30,50 Z"/></svg>
                        <div className="shape-filter-name">Marquise</div>
                    </div>
                    <div className="shape-filter-btn">
                        <svg viewBox="0 0 100 100"><path d="M50,20 Q70,30 70,50 Q70,70 50,80 L30,50 Q30,30 50,20"/></svg>
                        <div className="shape-filter-name">Pear</div>
                    </div>
                </div>
            </div>

            <div className="filter-section">
                <h3 className="filter-title">Metal Type</h3>
                <div className="filter-options">
                    <div className="filter-option">
                        <input type="checkbox" id="white-gold" defaultChecked />
                        <label htmlFor="white-gold">14K White Gold</label>
                    </div>
                    <div className="filter-option">
                        <input type="checkbox" id="yellow-gold" />
                        <label htmlFor="yellow-gold">14K Yellow Gold</label>
                    </div>
                    <div className="filter-option">
                        <input type="checkbox" id="rose-gold" />
                        <label htmlFor="rose-gold">14K Rose Gold</label>
                    </div>
                    <div className="filter-option">
                        <input type="checkbox" id="platinum" />
                        <label htmlFor="platinum">Platinum 950</label>
                    </div>
                </div>
            </div>

            <div className="filter-section">
                <h3 className="filter-title">Style</h3>
                <div className="filter-options">
                    <div className="filter-option">
                        <input type="checkbox" id="solitaire" />
                        <label htmlFor="solitaire">Solitaire</label>
                    </div>
                    <div className="filter-option">
                        <input type="checkbox" id="halo" />
                        <label htmlFor="halo">Halo</label>
                    </div>
                    <div className="filter-option">
                        <input type="checkbox" id="hidden-halo" />
                        <label htmlFor="hidden-halo">Hidden Halo</label>
                    </div>
                    <div className="filter-option">
                        <input type="checkbox" id="three-stone" />
                        <label htmlFor="three-stone">Three Stone</label>
                    </div>
                    <div className="filter-option">
                        <input type="checkbox" id="side-stone" />
                        <label htmlFor="side-stone">Side Stone</label>
                    </div>
                </div>
            </div>

            <div className="filter-section">
                <h3 className="filter-title">Price Range</h3>
                <div className="price-range">
                    <div className="price-inputs">
                        <input type="number" className="price-input" placeholder="Min" defaultValue={1000} />
                        <input type="number" className="price-input" placeholder="Max" defaultValue={5000} />
                    </div>
                    <button className="apply-filter-btn">Apply Filters</button>
                </div>
            </div>
        </aside>

        {/* Products Area */}
        <div className="products-area">
            <div className="products-header">
                <div className="results-count">Showing 1-9 of 247 results</div>
                <div className="sort-dropdown">
                    <label htmlFor="sort">Sort by:</label>
                    <select id="sort">
                        <option>Best Selling</option>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                        <option>Newest First</option>
                        <option>Most Popular</option>
                    </select>
                </div>
            </div>

            <div className="products-grid">
                {/* Product 1 */}
                <div className="product-card">
                    <div className="product-image">
                        <span className="product-badge">30% OFF</span>
                        <div className="wishlist-btn">♡</div>
                    </div>
                    <div className="product-info">
                        <h3 className="product-name">The Serenity</h3>
                        <div className="product-specs">14K White Gold | Round | Solitaire</div>
                        <div className="product-price">
                            <span className="price-current">$1,332</span>
                            <span className="price-original">$1,904</span>
                        </div>
                        <button className="product-cta">View Details</button>
                    </div>
                </div>

                {/* Product 2 */}
                <div className="product-card">
                    <div className="product-image">
                        <span className="product-badge">30% OFF</span>
                        <div className="wishlist-btn">♡</div>
                    </div>
                    <div className="product-info">
                        <h3 className="product-name">The Luminaire</h3>
                        <div className="product-specs">18K Yellow Gold | Oval | Halo</div>
                        <div className="product-price">
                            <span className="price-current">$1,866</span>
                            <span className="price-original">$2,667</span>
                        </div>
                        <button className="product-cta">View Details</button>
                    </div>
                </div>

                {/* Product 3 */}
                <div className="product-card">
                    <div className="product-image">
                        <span className="product-badge">30% OFF</span>
                        <div className="wishlist-btn">♡</div>
                    </div>
                    <div className="product-info">
                        <h3 className="product-name">The Celestial</h3>
                        <div className="product-specs">Platinum | Emerald | Three Stone</div>
                        <div className="product-price">
                            <span className="price-current">$2,100</span>
                            <span className="price-original">$3,000</span>
                        </div>
                        <button className="product-cta">View Details</button>
                    </div>
                </div>

                {/* Product 4 */}
                <div className="product-card">
                    <div className="product-image">
                        <span className="product-badge">30% OFF</span>
                        <div className="wishlist-btn">♡</div>
                    </div>
                    <div className="product-info">
                        <h3 className="product-name">The Elegance</h3>
                        <div className="product-specs">14K Rose Gold | Princess | Side Stone</div>
                        <div className="product-price">
                            <span className="price-current">$1,470</span>
                            <span className="price-original">$2,100</span>
                        </div>
                        <button className="product-cta">View Details</button>
                    </div>
                </div>

                {/* Product 5 */}
                <div className="product-card">
                    <div className="product-image">
                        <span className="product-badge">BEST SELLER</span>
                        <div className="wishlist-btn">♡</div>
                    </div>
                    <div className="product-info">
                        <h3 className="product-name">The Radiance</h3>
                        <div className="product-specs">14K White Gold | Round | Hidden Halo</div>
                        <div className="product-price">
                            <span className="price-current">$1,645</span>
                            <span className="price-original">$2,350</span>
                        </div>
                        <button className="product-cta">View Details</button>
                    </div>
                </div>

                {/* Product 6 */}
                <div className="product-card">
                    <div className="product-image">
                        <span className="product-badge">30% OFF</span>
                        <div className="wishlist-btn">♡</div>
                    </div>
                    <div className="product-info">
                        <h3 className="product-name">The Aurora</h3>
                        <div className="product-specs">18K White Gold | Cushion | Halo</div>
                        <div className="product-price">
                            <span className="price-current">$1,995</span>
                            <span className="price-original">$2,850</span>
                        </div>
                        <button className="product-cta">View Details</button>
                    </div>
                </div>

                {/* Product 7 */}
                <div className="product-card">
                    <div className="product-image">
                        <span className="product-badge">NEW</span>
                        <div className="wishlist-btn">♡</div>
                    </div>
                    <div className="product-info">
                        <h3 className="product-name">The Solstice</h3>
                        <div className="product-specs">Platinum | Oval | Solitaire</div>
                        <div className="product-price">
                            <span className="price-current">$2,450</span>
                            <span className="price-original">$3,500</span>
                        </div>
                        <button className="product-cta">View Details</button>
                    </div>
                </div>

                {/* Product 8 */}
                <div className="product-card">
                    <div className="product-image">
                        <span className="product-badge">30% OFF</span>
                        <div className="wishlist-btn">♡</div>
                    </div>
                    <div className="product-info">
                        <h3 className="product-name">The Enchanted</h3>
                        <div className="product-specs">14K Yellow Gold | Pear | Three Stone</div>
                        <div className="product-price">
                            <span className="price-current">$1,750</span>
                            <span className="price-original">$2,500</span>
                        </div>
                        <button className="product-cta">View Details</button>
                    </div>
                </div>

                {/* Product 9 */}
                <div className="product-card">
                    <div className="product-image">
                        <span className="product-badge">30% OFF</span>
                        <div className="wishlist-btn">♡</div>
                    </div>
                    <div className="product-info">
                        <h3 className="product-name">The Eternity</h3>
                        <div className="product-specs">14K White Gold | Marquise | Side Stone</div>
                        <div className="product-price">
                            <span className="price-current">$1,540</span>
                            <span className="price-original">$2,200</span>
                        </div>
                        <button className="product-cta">View Details</button>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            <div className="pagination">
                <button className="page-btn">‹</button>
                <button className="page-btn active">1</button>
                <button className="page-btn">2</button>
                <button className="page-btn">3</button>
                <button className="page-btn">4</button>
                <button className="page-btn">5</button>
                <button className="page-btn">›</button>
            </div>
        </div>
    </div>

    </>
  );
}