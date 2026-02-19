'use client';

import { useEffect, useState } from 'react';
import { Search, Heart, User, ShoppingCart, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function HomePage() {
    const [showSearch, setShowSearch] = useState(false);
    const [loading, setLoading] = useState(false);
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

    const handleProfileCheck = async () => {
        try {
            setLoading(true);

            const response = await fetch('/api/Pages/Profile', {
                credentials: 'include',
            });
            const data = await response.json();

            if (response.status === 401 || response.status === 404) {
                router.replace('/auth/login');
                return;
            }

            if (!response.ok) {
                throw new Error(data?.message || 'Failed to fetch profile data');
            }

            if (data.user === "zulujewels@gmail.com") {
                router.replace('/Pages/Admin');
                return;
            }

            router.replace('/Pages/Profile');
        } catch (error) {
            console.error("Profile Fetching From API Error:", error);
            router.replace('/auth/login');
        } finally {
            setLoading(false);
        }
    }
    
  useEffect(() => {

        // Smooth scroll animation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Add scroll animation effects
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.shape-card, .product-card, .category-card, .trust-item').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
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
            overflow-x: hidden;
        }

        /* Figma-style Frame Container */
        .figma-container {
            max-width: 1920px;
            margin: 40px auto;
            background: white;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
        }

        /* Hero Section */
        .hero-section {
            position: relative;
            height: 90vh;
            background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%);
            overflow: hidden;
        }

        .hero-video-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                linear-gradient(45deg, rgba(212,175,55,0.1) 0%, rgba(200,168,130,0.1) 100%),
                url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><pattern id="grain" x="0" y="0" width="300" height="300" patternUnits="userSpaceOnUse"><circle cx="150" cy="150" r="1" fill="rgba(255,255,255,0.03)"/></pattern></defs><rect width="1200" height="800" fill="url(%23grain)"/></svg>');
            opacity: 0.6;
            animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes shimmer {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 0.8; }
        }

        /* Navigation */
        nav {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
            padding: 30px 80px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%);
        }

        .logo {
            font-family: 'Cormorant Garamond', serif;
            font-size: 32px;
            font-weight: 600;
            color: var(--primary-gold);
            letter-spacing: 2px;
            text-transform: uppercase;
        }

        .nav-menu {
            display: flex;
            gap: 50px;
            list-style: none;
        }

        .nav-menu a {
            color: var(--text-light);
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            letter-spacing: 1px;
            text-transform: uppercase;
            transition: all 0.3s ease;
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
            gap: 25px;
        }

        .icon-btn {
            width: 40px;
            height: 40px;
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: white;
            background: transparent;
            outline: none;
            box-shadow: none;
            appearance: none;
            -webkit-appearance: none;
            border-image: none;
            cursor: pointer;
            transition: all 0.3s ease;
            padding: 0;
        }

        .icon-btn:hover {
            background: var(--primary-gold);
            border-color: var(--primary-gold);
            transform: scale(1.1);
        }

        /* Hero Content */
        .hero-content {
            position: relative;
            z-index: 10;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 0 80px;
        }

        .hero-badge {
            display: inline-block;
            padding: 12px 30px;
            background: rgba(212,175,55,0.15);
            border: 1px solid var(--primary-gold);
            border-radius: 50px;
            color: var(--primary-gold);
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 40px;
            animation: fadeInDown 1s ease;
        }

        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .hero-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 90px;
            font-weight: 300;
            color: white;
            line-height: 1.2;
            margin-bottom: 30px;
            animation: fadeInUp 1s ease 0.2s both;
        }

        .hero-title strong {
            font-weight: 700;
            background: linear-gradient(135deg, var(--primary-gold), var(--accent-rose));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .hero-subtitle {
            font-size: 18px;
            color: rgba(255,255,255,0.8);
            font-weight: 300;
            letter-spacing: 1px;
            margin-bottom: 50px;
            animation: fadeInUp 1s ease 0.4s both;
        }

        .cta-buttons {
            display: flex;
            gap: 20px;
            animation: fadeInUp 1s ease 0.6s both;
        }

        .btn-primary, .btn-secondary {
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

        .btn-primary {
            background: var(--primary-gold);
            color: var(--dark-bg);
        }

        .btn-primary:hover {
            background: var(--accent-rose);
            transform: translateY(-3px);
            box-shadow: 0 10px 30px rgba(212,175,55,0.3);
        }

        .btn-secondary {
            background: transparent;
            color: white;
            border: 2px solid white;
        }

        .btn-secondary:hover {
            background: white;
            color: var(--dark-bg);
            transform: translateY(-3px);
        }

        /* Diamond Shapes Section */
        .shapes-section {
            padding: 120px 80px;
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
            margin-bottom: 20px;
        }

        .section-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 56px;
            font-weight: 400;
            color: var(--text-dark);
            line-height: 1.3;
        }

        .shapes-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 40px;
            margin-bottom: 60px;
        }

        .shape-card {
            text-align: center;
            padding: 40px 20px;
            background: white;
            border: 1px solid var(--border-light);
            border-radius: 8px;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .shape-card:hover {
            border-color: var(--primary-gold);
            transform: translateY(-10px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.08);
        }

        .shape-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 25px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .shape-icon svg {
            width: 100%;
            height: 100%;
            fill: var(--text-dark);
            transition: all 0.3s ease;
        }

        .shape-card:hover .shape-icon svg {
            fill: var(--primary-gold);
            transform: scale(1.1);
        }

        .shape-name {
            font-size: 16px;
            font-weight: 600;
            letter-spacing: 1px;
            color: var(--text-dark);
            text-transform: uppercase;
        }

        /* Featured Products Section */
        .featured-section {
            padding: 120px 80px;
            background: linear-gradient(to bottom, #f9f9f9, white);
        }

        .products-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 50px;
        }

        .product-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.06);
            transition: all 0.4s ease;
            cursor: pointer;
        }

        .product-card:hover {
            transform: translateY(-15px);
            box-shadow: 0 20px 60px rgba(0,0,0,0.12);
        }

        .product-image {
            position: relative;
            width: 100%;
            height: 400px;
            background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
            overflow: hidden;
        }

        .product-image::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 200px;
            height: 200px;
            background: radial-gradient(circle, rgba(212,175,55,0.2), transparent);
            animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
        }

        .product-badge {
            position: absolute;
            top: 20px;
            left: 20px;
            padding: 8px 20px;
            background: var(--primary-gold);
            color: var(--dark-bg);
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
            border-radius: 20px;
        }

        .product-info {
            padding: 35px;
        }

        .product-name {
            font-family: 'Cormorant Garamond', serif;
            font-size: 28px;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 15px;
        }

        .product-details {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .product-specs {
            font-size: 13px;
            color: #888;
            letter-spacing: 0.5px;
        }

        .product-price {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .price-current {
            font-size: 26px;
            font-weight: 700;
            color: var(--primary-gold);
        }

        .price-original {
            font-size: 18px;
            color: #999;
            text-decoration: line-through;
        }

        .product-cta {
            width: 100%;
            padding: 15px;
            background: var(--dark-bg);
            color: white;
            border: none;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 4px;
        }

        .product-cta:hover {
            background: var(--primary-gold);
            color: var(--dark-bg);
        }

        /* Categories Section */
        .categories-section {
            padding: 120px 80px;
            background: var(--dark-bg);
            color: white;
        }

        .categories-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 30px;
        }

        .category-card {
            position: relative;
            height: 400px;
            border-radius: 12px;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.4s ease;
        }

        .category-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.8));
            z-index: 1;
            transition: all 0.4s ease;
        }

        .category-card:hover::before {
            background: linear-gradient(to bottom, transparent 20%, rgba(212,175,55,0.6));
        }

        .category-bg {
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #2c2c2c, #1a1a1a);
            transition: all 0.4s ease;
        }

        .category-card:hover .category-bg {
            transform: scale(1.1);
        }

        .category-content {
            position: absolute;
            bottom: 30px;
            left: 30px;
            right: 30px;
            z-index: 2;
        }

        .category-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 32px;
            font-weight: 600;
            margin-bottom: 10px;
        }

        .category-count {
            font-size: 14px;
            color: rgba(255,255,255,0.7);
            letter-spacing: 1px;
        }

        /* Trust Badges Section */
        .trust-section {
            padding: 100px 80px;
            background: white;
        }

        .trust-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 60px;
            text-align: center;
        }

        .trust-item {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .trust-icon {
            width: 80px;
            height: 80px;
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(200,168,130,0.1));
            border-radius: 50%;
        }

        .trust-icon svg {
            width: 40px;
            height: 40px;
            fill: var(--primary-gold);
        }

        .trust-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 12px;
            letter-spacing: 0.5px;
        }

        .trust-desc {
            font-size: 14px;
            color: #666;
            line-height: 1.6;
        }

        /* Footer */
        footer {
            background: var(--dark-bg);
            color: rgba(255,255,255,0.7);
            padding: 80px 80px 40px;
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
            margin-bottom: 20px;
            letter-spacing: 2px;
        }

        .footer-desc {
            font-size: 14px;
            line-height: 1.8;
            margin-bottom: 30px;
        }

        .social-links {
            display: flex;
            gap: 15px;
        }

        .social-icon {
            width: 40px;
            height: 40px;
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgba(255,255,255,0.7);
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .social-icon:hover {
            background: var(--primary-gold);
            border-color: var(--primary-gold);
            color: var(--dark-bg);
        }

        .footer-title {
            font-size: 16px;
            font-weight: 600;
            color: white;
            margin-bottom: 25px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .footer-links {
            list-style: none;
        }

        .footer-links li {
            margin-bottom: 15px;
        }

        .footer-links a {
            color: rgba(255,255,255,0.7);
            text-decoration: none;
            font-size: 14px;
            transition: all 0.3s ease;
        }

        .footer-links a:hover {
            color: var(--primary-gold);
            padding-left: 5px;
        }

        .footer-bottom {
            padding-top: 40px;
            border-top: 1px solid rgba(255,255,255,0.1);
            text-align: center;
            font-size: 13px;
        }

        /* Responsive */
        @media (max-width: 1200px) {
            .shapes-grid {
                grid-template-columns: repeat(3, 1fr);
            }
            .products-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            .categories-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (max-width: 768px) {
            nav {
                padding: 20px 30px;
            }
            .hero-title {
                font-size: 48px;
            }
            .shapes-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            .products-grid,
            .categories-grid {
                grid-template-columns: 1fr;
            }
            .trust-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            .footer-grid {
                grid-template-columns: 1fr;
            }
        }

        /* Search Bar */
        .search-bar-container {
            position: absolute;
            top: 100px;
            right: 80px;
            width: 400px;
            max-width: calc(100% - 40px);
            background: white;
            border-radius: 50px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            padding: 10px 18px;
            animation: slideDown 0.3s ease;
            z-index: 999;
        }

        .search-bar-container input {
            flex: 1;
            border: none;
            outline: none;
            font-size: 14px;
            padding: 8px 10px;
        }

        .cancel-btn {
            background: none;
            border: none;
            cursor: pointer;
            color: #666;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .cancel-btn:hover {
            color: var(--primary-gold);
        }

        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    
      `}} />
      
    <div className="figma-container">
        {/* <!-- Navigation --> */}
        <nav>
            <div className="logo">Zulu Jewellers</div>
            <ul className="nav-menu">
                <li><a href="/Pages/engagement">Engagement</a></li>
                <li><a href="/Pages/wedding">Wedding</a></li>
                <li><a href="/Pages/custom">Custom</a></li>
                <li><a href="/Pages/About">About</a></li>
                <li><a href="/Pages/Contact">Contact</a></li>
            </ul>
            <div className="nav-icons">
                <button className="icon-btn" aria-label='Search Products' onClick={() => setShowSearch(prev => !prev)}>
                    <Search size={18} strokeWidth={1.5} />
                </button>
                <div className="icon-btn" aria-label="User Wishlist" onClick={() => requireAuth(() => router.push('/Pages/wishlist'))}>
                    <Heart size={18} strokeWidth={1.5} />
                </div>
                <button className="icon-btn" aria-label="User Profile" onClick={handleProfileCheck}>
                    <User size={18} strokeWidth={1.5} />
                </button>
                <div className="icon-btn" aria-label="Shopping Cart" onClick={() => requireAuth(() => router.push('/Pages/cart'))}>
                    <ShoppingCart size={18} strokeWidth={1.5} />
                </div>
            </div>
        </nav>
        {loading && (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                fontSize: '18px',
                fontWeight: '600'
            }}>
                Checking profile...
            </div>
        )}

        {/* Search Bar */}
        {showSearch && (
            <div className="search-bar-container">
                <input
                type="text"
                placeholder="Search jewelry, diamonds, rings..."
                autoFocus
                />
                <button className="cancel-btn" onClick={() => setShowSearch(false)}>
                    <X size={18} />
                </button>
            </div>
        )}


        {/* <!-- Hero Section --> */}
        <section className="hero-section">
            <div className="hero-video-overlay"></div>
            <div className="hero-content">
                <span className="hero-badge">30% OFF Premium Collection</span>
                <h1 className="hero-title">Timeless <strong>Elegance</strong><br />Meets Modern Luxury</h1>
                <p className="hero-subtitle">Lab-Grown Diamonds | Certified Excellence | Made in NYC</p>
                <div className="cta-buttons">
                    <button className="btn-primary">Start With A Diamond</button>
                    <button className="btn-secondary">Explore Settings</button>
                </div>
            </div>
        </section>

        {/* <!-- Diamond Shapes Section --> */}
        <section className="shapes-section">
            <div className="section-header">
                <div className="section-label">Choose Your Perfect Shape</div>
                <h2 className="section-title">Browse By Diamond Shape</h2>
            </div>
            <div className="shapes-grid">
                <div className="shape-card">
                    <div className="shape-icon">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40"/>
                        </svg>
                    </div>
                    <div className="shape-name">Round</div>
                </div>
                <div className="shape-card">
                    <div className="shape-icon">
                        <svg viewBox="0 0 100 100">
                            <ellipse cx="50" cy="50" rx="30" ry="45"/>
                        </svg>
                    </div>
                    <div className="shape-name">Oval</div>
                </div>
                <div className="shape-card">
                    <div className="shape-icon">
                        <svg viewBox="0 0 100 100">
                            <rect x="25" y="20" width="50" height="60" rx="2"/>
                        </svg>
                    </div>
                    <div className="shape-name">Emerald</div>
                </div>
                <div className="shape-card">
                    <div className="shape-icon">
                        <svg viewBox="0 0 100 100">
                            <rect x="30" y="30" width="40" height="40"/>
                        </svg>
                    </div>
                    <div className="shape-name">Princess</div>
                </div>
                <div className="shape-card">
                    <div className="shape-icon">
                        <svg viewBox="0 0 100 100">
                            <path d="M50,20 L70,50 L50,80 L30,50 Z"/>
                        </svg>
                    </div>
                    <div className="shape-name">Marquise</div>
                </div>
                <div className="shape-card">
                    <div className="shape-icon">
                        <svg viewBox="0 0 100 100">
                            <path d="M50,20 Q70,30 70,50 Q70,70 50,80 L30,50 Q30,30 50,20"/>
                        </svg>
                    </div>
                    <div className="shape-name">Pear</div>
                </div>
                <div className="shape-card">
                    <div className="shape-icon">
                        <svg viewBox="0 0 100 100">
                            <rect x="30" y="25" width="40" height="50" rx="8"/>
                        </svg>
                    </div>
                    <div className="shape-name">Cushion</div>
                </div>
                <div className="shape-card">
                    <div className="shape-icon">
                        <svg viewBox="0 0 100 100">
                            <rect x="30" y="30" width="40" height="40" rx="2"/>
                        </svg>
                    </div>
                    <div className="shape-name">Asscher</div>
                </div>
                <div className="shape-card">
                    <div className="shape-icon">
                        <svg viewBox="0 0 100 100">
                            <path d="M50,20 Q30,35 30,50 Q30,65 50,80 Q70,65 70,50 Q70,35 50,20"/>
                        </svg>
                    </div>
                    <div className="shape-name">Heart</div>
                </div>
                <div className="shape-card">
                    <div className="shape-icon">
                        <svg viewBox="0 0 100 100">
                            <rect x="28" y="23" width="44" height="54" rx="5"/>
                        </svg>
                    </div>
                    <div className="shape-name">Radiant</div>
                </div>
            </div>
        </section>

        {/* <!-- Featured Products Section --> */}
        <section className="featured-section">
            <div className="section-header">
                <div className="section-label">Handcrafted Excellence</div>
                <h2 className="section-title">Our Most-Loved Engagement Rings</h2>
            </div>
            <div className="products-grid">
                <div className="product-card">
                    <div className="product-image">
                        <span className="product-badge">30% OFF</span>
                    </div>
                    <div className="product-info">
                        <h3 className="product-name">The Serenity</h3>
                        <div className="product-details">
                            <span className="product-specs">14K White Gold | Round</span>
                        </div>
                        <div className="product-price">
                            <span className="price-current">$1,332</span>
                            <span className="price-original">$1,904</span>
                        </div>
                        <button className="product-cta">View Details</button>
                    </div>
                </div>
                <div className="product-card">
                    <div className="product-image">
                        <span className="product-badge">30% OFF</span>
                    </div>
                    <div className="product-info">
                        <h3 className="product-name">The Luminaire</h3>
                        <div className="product-details">
                            <span className="product-specs">18K Yellow Gold | Oval</span>
                        </div>
                        <div className="product-price">
                            <span className="price-current">$1,866</span>
                            <span className="price-original">$2,667</span>
                        </div>
                        <button className="product-cta">View Details</button>
                    </div>
                </div>
                <div className="product-card">
                    <div className="product-image">
                        <span className="product-badge">30% OFF</span>
                    </div>
                    <div className="product-info">
                        <h3 className="product-name">The Celestial</h3>
                        <div className="product-details">
                            <span className="product-specs">Platinum | Emerald</span>
                        </div>
                        <div className="product-price">
                            <span className="price-current">$2,100</span>
                            <span className="price-original">$3,000</span>
                        </div>
                        <button className="product-cta">View Details</button>
                    </div>
                </div>
            </div>
        </section>

        {/* <!-- Categories Section --> */}
        <section className="categories-section">
            <div className="section-header">
                <div className="section-label" style={{color: 'var(--primary-gold)'}}>Explore Our Collections</div>
                <h2 className="section-title" style={{color: 'white'}}>Shop By Category</h2>
            </div>
            <div className="categories-grid">
                <div className="category-card">
                    <div className="category-bg"></div>
                    <div className="category-content">
                        <h3 className="category-title">Engagement Rings</h3>
                        <p className="category-count">500+ Designs</p>
                    </div>
                </div>
                <div className="category-card">
                    <div className="category-bg"></div>
                    <div className="category-content">
                        <h3 className="category-title">Wedding Bands</h3>
                        <p className="category-count">200+ Designs</p>
                    </div>
                </div>
                <div className="category-card">
                    <div className="category-bg"></div>
                    <div className="category-content">
                        <h3 className="category-title">Fine Jewelry</h3>
                        <p className="category-count">350+ Pieces</p>
                    </div>
                </div>
                <div className="category-card">
                    <div className="category-bg"></div>
                    <div className="category-content">
                        <h3 className="category-title">Loose Diamonds</h3>
                        <p className="category-count">10,000+ Stones</p>
                    </div>
                </div>
            </div>
        </section>

        {/* <!-- Trust Badges Section --> */}
        <section className="trust-section">
            <div className="trust-grid">
                <div className="trust-item">
                    <div className="trust-icon">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                        </svg>
                    </div>
                    <h4 className="trust-title">GIA & IGI Certified</h4>
                    <p className="trust-desc">Every diamond certified by leading gemological institutes</p>
                </div>
                <div className="trust-item">
                    <div className="trust-icon">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                    </div>
                    <h4 className="trust-title">Lifetime Warranty</h4>
                    <p className="trust-desc">Comprehensive coverage on all our jewelry</p>
                </div>
                <div className="trust-item">
                    <div className="trust-icon">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                        </svg>
                    </div>
                    <h4 className="trust-title">30-Day Returns</h4>
                    <p className="trust-desc">Free returns and exchanges within 30 days</p>
                </div>
                <div className="trust-item">
                    <div className="trust-icon">
                        <svg viewBox="0 0 24 24">
                            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z"/>
                        </svg>
                    </div>
                    <h4 className="trust-title">Free Shipping</h4>
                    <p className="trust-desc">Complimentary insured shipping worldwide</p>
                </div>
            </div>
        </section>

        {/* <!-- Footer --> */}
        <footer>
            <div className="footer-grid">
                <div>
                    <div className="footer-brand">Zulu Jewellers</div>
                    <p className="footer-desc">Creating timeless moments through exceptional craftsmanship and lab-grown diamonds. Made with love in New York City.</p>
                    <div className="social-links">
                        <div className="social-icon">f</div>
                        <div className="social-icon">in</div>
                        <div className="social-icon">📷</div>
                        <div className="social-icon">P</div>
                    </div>
                </div>
                <div>
                    <h4 className="footer-title">Shop</h4>
                    <ul className="footer-links">
                        <li><a href="#">Engagement Rings</a></li>
                        <li><a href="#">Wedding Bands</a></li>
                        <li><a href="#">Fine Jewelry</a></li>
                        <li><a href="#">Loose Diamonds</a></li>
                        <li><a href="#">Custom Design</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="footer-title">About</h4>
                    <ul className="footer-links">
                        <li><a href="#">Our Story</a></li>
                        <li><a href="#">Lab-Grown Diamonds</a></li>
                        <li><a href="#">Sustainability</a></li>
                        <li><a href="#">Reviews</a></li>
                        <li><a href="#">Blog</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="footer-title">Support</h4>
                    <ul className="footer-links">
                        <li><a href="#">Contact Us</a></li>
                        <li><a href="#">Shipping & Returns</a></li>
                        <li><a href="#">Ring Size Guide</a></li>
                        <li><a href="#">Care Instructions</a></li>
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
                        <li><a href="#">Price Match</a></li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2025 Zulu Jewellers. All rights reserved. | Privacy Policy | Terms of Service</p>
            </div>
        </footer>
    </div>
    </>
  );
}