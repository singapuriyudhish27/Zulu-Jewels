'use client';
import { useEffect } from 'react';
import { Search, RefreshCw, User, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ProductDetailsPage() {
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
        const closeQuickView = () => {
            document.getElementById('quickViewModal').classList.remove('active');
            document.body.style.overflow = 'auto';
        };

        // Option Selection
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                this.parentElement.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Thumbnail Gallery
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.addEventListener('click', function() {
                document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Close modal on overlay click
        const modal = document.getElementById('quickViewModal');
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeQuickView();
            }
        });

        // Wishlist Toggle
        document.querySelectorAll('.btn-wishlist').forEach(btn => {
            btn.addEventListener('click', function() {
                this.textContent = this.textContent === '♡' ? '♥' : '♡';
                this.style.color = this.textContent === '♥' ? '#D4AF37' : '';
            });
        });

        // ESC key to close modal
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeQuickView();
            }
        });
    
  }, []);

    const addToCart = () => {
        toast.success('Product added to cart!');
    };

    // Tab Switching
    const openTab = (tabName, event) => {
        const tabs = document.querySelectorAll('.tab-content');
        const btns = document.querySelectorAll('.tab-btn');

        tabs.forEach(tab => tab.classList.remove('active'));
        btns.forEach(btn => btn.classList.remove('active'));

        document.getElementById(tabName)?.classList.add('active');
        event?.target.classList.add('active');
    };

    // Quick View Modal
    const openQuickView = (productName, productPrice) => {
        document.getElementById('modalProductName').textContent = productName;
        document.getElementById('modalProductPrice').textContent = productPrice;
        document.getElementById('quickViewModal').classList.add('active');
        document.body.style.overflow = 'hidden';
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

        /* Breadcrumb */
        .breadcrumb {
            margin-top: 110px;
            padding: 20px 80px;
            background: white;
            font-size: 13px;
            color: #666;
        }

        .breadcrumb a {
            color: #666;
            text-decoration: none;
            transition: color 0.3s ease;
        }

        .breadcrumb a:hover {
            color: var(--primary-gold);
        }

        /* Product Section */
        .product-section {
            display: flex;
            gap: 60px;
            padding: 60px 80px;
            max-width: 1600px;
            margin: 0 auto;
            background: white;
        }

        /* Product Gallery */
        .product-gallery {
            flex: 1;
            max-width: 700px;
        }

        .main-image {
            width: 100%;
            height: 700px;
            background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
            border-radius: 12px;
            margin-bottom: 20px;
            position: relative;
            overflow: hidden;
        }

        .main-image::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(212,175,55,0.2), transparent);
            animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
            50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.8; }
        }

        .product-badge {
            position: absolute;
            top: 20px;
            left: 20px;
            padding: 10px 25px;
            background: var(--primary-gold);
            color: var(--dark-bg);
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
            border-radius: 25px;
        }

        .image-controls {
            position: absolute;
            bottom: 20px;
            right: 20px;
            display: flex;
            gap: 10px;
        }

        .control-btn {
            width: 45px;
            height: 45px;
            background: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.1);
        }

        .control-btn:hover {
            background: var(--primary-gold);
            color: white;
            transform: scale(1.1);
        }

        .thumbnail-gallery {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
        }

        .thumbnail {
            height: 150px;
            background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
            border-radius: 8px;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.3s ease;
        }

        .thumbnail:hover,
        .thumbnail.active {
            border-color: var(--primary-gold);
            transform: scale(1.05);
        }

        /* Product Info */
        .product-info {
            flex: 1;
            max-width: 600px;
        }

        .product-header {
            margin-bottom: 30px;
            padding-bottom: 30px;
            border-bottom: 1px solid var(--border-light);
        }

        .product-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 48px;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 15px;
            line-height: 1.2;
        }

        .product-sku {
            font-size: 13px;
            color: #666;
            margin-bottom: 20px;
        }

        .product-rating {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
        }

        .stars {
            color: var(--primary-gold);
            font-size: 18px;
        }

        .rating-text {
            font-size: 14px;
            color: #666;
        }

        .product-price {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 20px;
        }

        .current-price {
            font-size: 42px;
            font-weight: 700;
            color: var(--primary-gold);
        }

        .original-price {
            font-size: 28px;
            color: #999;
            text-decoration: line-through;
        }

        .discount-badge {
            padding: 5px 15px;
            background: rgba(76,175,80,0.1);
            color: #4CAF50;
            font-size: 14px;
            font-weight: 700;
            border-radius: 20px;
        }

        .product-description {
            font-size: 15px;
            color: #666;
            line-height: 1.8;
            margin-bottom: 30px;
        }

        /* Customization Options */
        .customization-section {
            margin-bottom: 30px;
        }

        .option-label {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 15px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .metal-options,
        .size-options {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 25px;
        }

        .option-btn {
            padding: 12px 25px;
            background: white;
            border: 2px solid var(--border-light);
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
            font-weight: 500;
            color: var(--text-dark);
        }

        .option-btn:hover,
        .option-btn.active {
            border-color: var(--primary-gold);
            background: rgba(212,175,55,0.05);
            color: var(--primary-gold);
        }

        /* Action Buttons */
        .action-buttons {
            display: flex;
            gap: 15px;
            margin-bottom: 30px;
        }

        .btn {
            flex: 1;
            padding: 18px 30px;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-primary {
            background: var(--primary-gold);
            color: var(--dark-bg);
        }

        .btn-primary:hover {
            background: var(--accent-rose);
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(212,175,55,0.3);
        }

        .btn-secondary {
            background: var(--dark-bg);
            color: white;
        }

        .btn-secondary:hover {
            background: #2c2c2c;
            transform: translateY(-2px);
        }

        .btn-wishlist {
            width: 60px;
            padding: 18px;
            background: white;
            border: 2px solid var(--border-light);
            color: var(--text-dark);
            font-size: 20px;
        }

        .btn-wishlist:hover {
            border-color: var(--primary-gold);
            color: var(--primary-gold);
        }

        /* Product Features */
        .product-features {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            padding: 30px;
            background: #f9f9f9;
            border-radius: 8px;
            margin-bottom: 30px;
        }

        .feature-item {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .feature-icon {
            width: 40px;
            height: 40px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
        }

        .feature-text {
            font-size: 13px;
            color: #666;
            line-height: 1.5;
        }

        /* Specifications */
        .specifications {
            margin-top: 40px;
            padding-top: 40px;
            border-top: 1px solid var(--border-light);
        }

        .spec-title {
            font-size: 20px;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 25px;
        }

        .spec-row {
            display: flex;
            justify-content: space-between;
            padding: 15px 0;
            border-bottom: 1px solid var(--border-light);
        }

        .spec-label {
            font-size: 14px;
            color: #666;
            font-weight: 500;
        }

        .spec-value {
            font-size: 14px;
            color: var(--text-dark);
            font-weight: 600;
        }

        /* Tabs Section */
        .tabs-section {
            padding: 60px 80px;
            max-width: 1600px;
            margin: 0 auto;
            background: white;
        }

        .tabs-header {
            display: flex;
            gap: 50px;
            border-bottom: 2px solid var(--border-light);
            margin-bottom: 40px;
        }

        .tab-btn {
            padding: 15px 0;
            background: transparent;
            border: none;
            font-size: 16px;
            font-weight: 600;
            color: #666;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
        }

        .tab-btn.active {
            color: var(--primary-gold);
        }

        .tab-btn.active::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            right: 0;
            height: 2px;
            background: var(--primary-gold);
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
            animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .tab-text {
            font-size: 15px;
            color: #666;
            line-height: 1.9;
        }

        /* Reviews */
        .review-card {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 20px;
        }

        .review-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .reviewer-name {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-dark);
        }

        .review-date {
            font-size: 13px;
            color: #999;
        }

        .review-text {
            font-size: 14px;
            color: #666;
            line-height: 1.7;
        }

        /* Related Products */
        .related-section {
            padding: 80px 80px;
            background: #f9f9f9;
        }

        .section-header {
            text-align: center;
            margin-bottom: 50px;
        }

        .section-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 42px;
            font-weight: 400;
            color: var(--text-dark);
        }

        .related-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 30px;
            max-width: 1600px;
            margin: 0 auto;
        }

        .related-card {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 5px 25px rgba(0,0,0,0.06);
            transition: all 0.4s ease;
            cursor: pointer;
        }

        .related-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 45px rgba(0,0,0,0.12);
        }

        .related-image {
            width: 100%;
            height: 280px;
            background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
        }

        .related-info {
            padding: 25px;
        }

        .related-name {
            font-family: 'Cormorant Garamond', serif;
            font-size: 20px;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 10px;
        }

        .related-price {
            font-size: 22px;
            font-weight: 700;
            color: var(--primary-gold);
        }

        /* Quick View Modal */
        .modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            z-index: 10000;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        }

        .modal-overlay.active {
            display: flex;
        }

        .modal-content {
            background: white;
            width: 90%;
            max-width: 1200px;
            max-height: 90vh;
            overflow-y: auto;
            border-radius: 12px;
            position: relative;
            animation: slideUp 0.4s ease;
        }

        @keyframes slideUp {
            from { opacity: 0; transform: translateY(50px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .modal-close {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 45px;
            height: 45px;
            background: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            font-size: 24px;
            color: var(--text-dark);
            transition: all 0.3s ease;
            box-shadow: 0 2px 15px rgba(0,0,0,0.1);
            z-index: 10;
        }

        .modal-close:hover {
            background: var(--primary-gold);
            color: white;
            transform: rotate(90deg);
        }

        .modal-body {
            display: flex;
            gap: 50px;
            padding: 50px;
        }

        .modal-gallery {
            flex: 1;
        }

        .modal-main-image {
            width: 100%;
            height: 500px;
            background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
            border-radius: 12px;
            position: relative;
            overflow: hidden;
        }

        .modal-main-image::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 250px;
            height: 250px;
            background: radial-gradient(circle, rgba(212,175,55,0.2), transparent);
            animation: pulse 3s ease-in-out infinite;
        }

        .modal-info {
            flex: 1;
        }

        .modal-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 36px;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 15px;
        }

        .modal-price {
            font-size: 32px;
            font-weight: 700;
            color: var(--primary-gold);
            margin-bottom: 25px;
        }

        .modal-description {
            font-size: 15px;
            color: #666;
            line-height: 1.8;
            margin-bottom: 30px;
        }

        .view-full-details {
            display: inline-block;
            padding: 15px 35px;
            background: var(--dark-bg);
            color: white;
            text-decoration: none;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            border-radius: 4px;
            transition: all 0.3s ease;
        }

        .view-full-details:hover {
            background: var(--primary-gold);
            color: var(--dark-bg);
            transform: translateY(-2px);
        }

        @media (max-width: 1200px) {
            .product-section {
                flex-direction: column;
            }
            .related-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (max-width: 768px) {
            nav {
                padding: 20px 30px;
            }
            .breadcrumb,
            .product-section,
            .tabs-section,
            .related-section {
                padding: 40px 30px;
            }
            .product-title {
                font-size: 32px;
            }
            .modal-body {
                flex-direction: column;
                padding: 30px;
            }
            .related-grid {
                grid-template-columns: 1fr;
            }
        }
    
      `}} />
      
    {/* Navigation */}
    <nav>
        <div className="logo" onClick={() => window.location.href = '/Pages'}>Zulu Jewellers</div>
        <ul className="nav-menu">
            <li><a href="/Pages/engagement">Engagement</a></li>
            <li><a href="/Pages/wedding">Wedding</a></li>
            <li><a href="/Pages/custom">Custom</a></li>
            <li><a href="/Pages/About">About</a></li>
            <li><a href="/Pages/contact">Contact</a></li>
        </ul>
        <div className="nav-icons">
            {/* <Link href="/Pages/search" className="icon-btn" aria-label="Search">
                <Search size={18} strokeWidth={1.5} />
            </Link> */}
            <div className="icon-btn" aria-label="User Profile" onClick={() => requireAuth(() => router.push('/Pages/Profile'))}>
                <User size={18} strokeWidth={1.5} />
            </div>
            <div className="icon-btn" aria-label="Shopping Cart" onClick={() => requireAuth(() => router.push('/Pages/cart'))}>
                <ShoppingCart size={18} strokeWidth={1.5} />
            </div>
        </div>
    </nav>

    {/* Breadcrumb */}
    <div className="breadcrumb">
        <a href="/Pages">Home</a> / <a href="/engagement">Engagement Rings</a> / The Serenity
    </div>

    {/* Product Section */}
    <section className="product-section">
        {/* Product Gallery */}
        <div className="product-gallery">
            <div className="main-image">
                <span className="product-badge">30% OFF</span>
                <div className="image-controls">
                    <button className="control-btn" title="360° View"><RefreshCw size={18} /></button>
                    <button className="control-btn" title="Zoom"><Search size={18} /></button>
                </div>
            </div>
            <div className="thumbnail-gallery">
                <div className="thumbnail active"></div>
                <div className="thumbnail"></div>
                <div className="thumbnail"></div>
                <div className="thumbnail"></div>
            </div>
        </div>

        {/* Product Info */}
        <div className="product-info">
            <div className="product-header">
                <h1 className="product-title">The Serenity</h1>
                <div className="product-sku">SKU: ZUL-SER-001</div>
                <div className="product-rating">
                    <span className="stars">★★★★★</span>
                    <span className="rating-text">(127 reviews)</span>
                </div>
                <div className="product-price">
                    <span className="current-price">$1,332</span>
                    <span className="original-price">$1,904</span>
                    <span className="discount-badge">Save 30%</span>
                </div>
            </div>

            <p className="product-description">
                Experience timeless elegance with The Serenity engagement ring. This stunning solitaire design features a brilliant round-cut lab-grown diamond set in lustrous 14K white gold. The classic four-prong setting allows maximum light to enter the diamond, creating extraordinary brilliance and fire. Perfect for those who appreciate understated luxury.
            </p>

            {/* Customization Options */}
            <div className="customization-section">
                <div className="option-label">Select Metal Type</div>
                <div className="metal-options">
                    <button className="option-btn active">14K White Gold</button>
                    <button className="option-btn">14K Yellow Gold</button>
                    <button className="option-btn">14K Rose Gold</button>
                    <button className="option-btn">Platinum 950</button>
                </div>

                <div className="option-label">Select Ring Size</div>
                <div className="size-options">
                    <button className="option-btn">4</button>
                    <button className="option-btn">4.5</button>
                    <button className="option-btn">5</button>
                    <button className="option-btn">5.5</button>
                    <button className="option-btn active">6</button>
                    <button className="option-btn">6.5</button>
                    <button className="option-btn">7</button>
                    <button className="option-btn">7.5</button>
                    <button className="option-btn">8</button>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
                <button className="btn btn-primary" onClick={() => requireAuth(addToCart)}>Add to Cart</button>
                <button className="btn btn-secondary" onClick={() => requireAuth(() => router.push('/Pages/cart'))}>Buy Now</button>
                <button className="btn btn-wishlist" onClick={() => requireAuth()}>♡</button>
            </div>

            {/* Product Features */}
            <div className="product-features">
                <div className="feature-item">
                    <div className="feature-icon">💎</div>
                    <div className="feature-text">GIA Certified<br />Lab-Grown Diamond</div>
                </div>
                <div className="feature-item">
                    <div className="feature-icon">🔒</div>
                    <div className="feature-text">Lifetime Warranty<br />& Free Resizing</div>
                </div>
                <div className="feature-item">
                    <div className="feature-icon">📦</div>
                    <div className="feature-text">Free Insured<br />Shipping</div>
                </div>
                <div className="feature-item">
                    <div className="feature-icon">↩️</div>
                    <div className="feature-text">30-Day Free<br />Returns</div>
                </div>
            </div>

            {/* Specifications */}
            <div className="specifications">
                <h3 className="spec-title">Product Specifications</h3>
                <div className="spec-row">
                    <span className="spec-label">Metal</span>
                    <span className="spec-value">14K White Gold</span>
                </div>
                <div className="spec-row">
                    <span className="spec-label">Diamond Shape</span>
                    <span className="spec-value">Round Brilliant</span>
                </div>
                <div className="spec-row">
                    <span className="spec-label">Carat Weight</span>
                    <span className="spec-value">1.0 CT</span>
                </div>
                <div className="spec-row">
                    <span className="spec-label">Color Grade</span>
                    <span className="spec-value">E (Colorless)</span>
                </div>
                <div className="spec-row">
                    <span className="spec-label">Clarity</span>
                    <span className="spec-value">VS1</span>
                </div>
                <div className="spec-row">
                    <span className="spec-label">Cut Grade</span>
                    <span className="spec-value">Excellent</span>
                </div>
                <div className="spec-row">
                    <span className="spec-label">Setting Style</span>
                    <span className="spec-value">Solitaire, 4-Prong</span>
                </div>
                <div className="spec-row">
                    <span className="spec-label">Band Width</span>
                    <span className="spec-value">2.0mm</span>
                </div>
            </div>
        </div>
    </section>

    {/* Tabs Section */}
    <section className="tabs-section">
        <div className="tabs-header">
            <button className="tab-btn active" onClick={(e) => openTab('description', e)}>Description</button>
            <button className="tab-btn" onClick={() => openTab('details')}>Details & Care</button>
            <button className="tab-btn" onClick={() => openTab('reviews')}>Customer Reviews</button>
        </div>

        <div id="description" className="tab-content active">
            <p className="tab-text">
                The Serenity engagement ring embodies classic elegance with its timeless solitaire design. This exquisite piece features a stunning 1.0-carat round brilliant lab-grown diamond, carefully selected for its exceptional quality and brilliance. The diamond is ethically sourced, eco-friendly, and chemically identical to natural diamonds.

            </p>
            <p className="tab-text" style={{marginTop: '20px'}}>
                Set in premium 14K white gold, the four-prong setting securely holds the diamond while allowing maximum light to pass through, creating breathtaking sparkle from every angle. The delicate 2.0mm band provides a comfortable fit while maintaining a refined, sophisticated appearance. Each ring is handcrafted by our master jewelers in our New York City atelier, ensuring impeccable quality and attention to detail.
            </p>
        </div>

        <div id="details" className="tab-content">
            <p className="tab-text">
                <strong>Care Instructions:</strong><br />
                Clean your ring regularly with warm water and mild soap using a soft brush. Avoid harsh chemicals and remove during physical activities. Store in a soft cloth pouch when not wearing.
            </p>
            <p className="tab-text" style={{marginTop: '20px'}}>
                <strong>Warranty & Services:</strong><br />
                Your ring includes a lifetime warranty covering manufacturing defects. We offer complimentary resizing (one time), professional cleaning, and prong tightening for life. All lab-grown diamonds come with GIA certification.
            </p>
        </div>

        <div id="reviews" className="tab-content">
            <div className="review-card">
                <div className="review-header">
                    <div>
                        <div className="reviewer-name">Sarah Mitchell</div>
                        <div className="stars" style={{fontSize: '14px', marginTop: '5px'}}>★★★★★</div>
                    </div>
                    <div className="review-date">December 15, 2024</div>
                </div>
                <p className="review-text">
                    Absolutely stunning! The diamond sparkles beautifully and the quality is exceptional. My fiancée loves it and gets compliments everywhere we go. The customer service was outstanding throughout the entire process.
                </p>
            </div>

            <div className="review-card">
                <div className="review-header">
                    <div>
                        <div className="reviewer-name">James Rodriguez</div>
                        <div className="stars" style={{fontSize: '14px', marginTop: '5px'}}>★★★★★</div>
                    </div>
                    <div className="review-date">November 28, 2024</div>
                </div>
                <p className="review-text">
                    Perfect engagement ring! The solitaire design is timeless and elegant. I appreciated the detailed certification and the ethical sourcing. Shipping was fast and the packaging was beautiful. Highly recommend Zulu Jewellers!
                </p>
            </div>
        </div>
    </section>

    {/* Related Products */}
    <section className="related-section">
        <div className="section-header">
            <h2 className="section-title">You May Also Like</h2>
        </div>
        <div className="related-grid">
            <div className="related-card" onClick={() => openQuickView('The Luminaire', '$1,866')}>
                <div className="related-image"></div>
                <div className="related-info">
                    <h3 className="related-name">The Luminaire</h3>
                    <div className="related-price">$1,866</div>
                </div>
            </div>

            <div className="related-card" onClick={() => openQuickView('The Celestial', '$2,100')}>
                <div className="related-image"></div>
                <div className="related-info">
                    <h3 className="related-name">The Celestial</h3>
                    <div className="related-price">$2,100</div>
                </div>
            </div>

            <div className="related-card" onClick={() => openQuickView('The Elegance', '$1,470')}>
                <div className="related-image"></div>
                <div className="related-info">
                    <h3 className="related-name">The Elegance</h3>
                    <div className="related-price">$1,470</div>
                </div>
            </div>

            <div className="related-card" onClick={() => openQuickView('The Radiance', '$1,645')}>
                <div className="related-image"></div>
                <div className="related-info">
                    <h3 className="related-name">The Radiance</h3>
                    <div className="related-price">$1,645</div>
                </div>
            </div>
        </div>
    </section>

    {/* Quick View Modal */}
    <div className="modal-overlay" id="quickViewModal">
        <div className="modal-content">
            <button className="modal-close" onClick={() => closeQuickView()}>×</button>
            <div className="modal-body">
                <div className="modal-gallery">
                    <div className="modal-main-image"></div>
                </div>
                <div className="modal-info">
                    <h2 className="modal-title" id="modalProductName">The Luminaire</h2>
                    <div className="product-rating">
                        <span className="stars">★★★★★</span>
                        <span className="rating-text">(89 reviews)</span>
                    </div>
                    <div className="modal-price" id="modalProductPrice">$1,866</div>
                    <p className="modal-description">
                        A stunning oval-cut lab-grown diamond set in lustrous 18K yellow gold. This elegant halo design features brilliant pavé diamonds surrounding the center stone, creating exceptional sparkle and vintage-inspired beauty. Perfect for those who love classic glamour with a modern twist.
                    </p>
                    
                    <div className="customization-section">
                        <div className="option-label">Metal Type</div>
                        <div className="metal-options">
                            <button className="option-btn">14K White Gold</button>
                            <button className="option-btn active">18K Yellow Gold</button>
                            <button className="option-btn">14K Rose Gold</button>
                        </div>

                        <div className="option-label">Ring Size</div>
                        <div className="size-options">
                            <button className="option-btn">5</button>
                            <button className="option-btn">5.5</button>
                            <button className="option-btn active">6</button>
                            <button className="option-btn">6.5</button>
                            <button className="option-btn">7</button>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button className="btn btn-primary" onClick={() => requireAuth(addToCart)}>Add to Cart</button>
                        <button className="btn btn-wishlist">♡</button>
                    </div>

                    <a href="#" className="view-full-details">View Full Details</a>
                </div>
            </div>
        </div>
    </div>

    </>
  );
}