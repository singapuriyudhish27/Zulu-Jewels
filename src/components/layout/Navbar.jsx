'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, User, Heart, ShoppingBag, X, Menu } from 'lucide-react';

// Final fix for Navbar dynamic categories

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isMobileShopOpen, setIsMobileShopOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname?.toLowerCase().startsWith('/auth');
  const isProductDetailsPage = pathname?.toLowerCase().startsWith('/pages/products/') && pathname?.toLowerCase() !== '/pages/products';
  const isTransparentNavbarPage = !isAuthPage && !isProductDetailsPage;
  const isLightBgPage = 
    pathname?.toLowerCase().includes('/pages/cart') || 
    pathname?.toLowerCase().includes('/pages/profile') || 
    pathname?.toLowerCase().includes('/pages/delivery-confirmation') ||
    pathname?.toLowerCase().includes('/pages/payment-success');

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const handleIconClick = async (type, targetPage) => {
    try {
      let apiRoute = '';
      if (type === 'profile') apiRoute = '/api/Pages/Profile';
      else if (type === 'wishlist') apiRoute = '/api/Pages/Profile';
      else if (type === 'cart') apiRoute = '/api/Pages/cart';

      if (!apiRoute) return;

      const response = await fetch(apiRoute);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Navbar Data: ", data);

      if (data.role === "Admin" || data.role === "admin") {
        const settingsRes = await fetch('/api/Admin/Settings', { credentials: 'include' });
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          router.replace(settings.adminPortal?.path || '/auth/login');
        } else {
          router.replace('/auth/login');
        }
      } else if (data.role === "User") {
        router.replace(targetPage);
      } else {
        // Handle unauthenticated or other roles
        router.replace('/auth/login'); // Or wherever a non-logged-in user should go
      }
    } catch (error) {
      console.error("Error checking auth/role:", error);
      // Fallback for errors: redirect to login
      router.replace('/auth/login');
    }
  };

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Fetch categories only on the client-side
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/layout/categories');
        const data = await res.json();
        if (data.success) setCategories(data.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    
    fetchCategories();
  }, []);

  return (
    <>
      <style>{`
        .zj-navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: #fff;
          border-bottom: 1px solid #e8e0d8;
          font-family: 'Montserrat', sans-serif;
          transition: background 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                      box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .zj-navbar.zj-nav-transparent {
          background: transparent;
          border-bottom: 1px solid transparent;
          box-shadow: none;
        }
        .zj-navbar.zj-nav-transparent .zj-nav-link {
          color: #ffffff;
        }
        .zj-navbar.zj-nav-transparent .zj-nav-icon-btn {
          color: #ffffff;
        }
        .zj-navbar.zj-nav-transparent .zj-nav-logo-text {
          filter: brightness(0) invert(1);
        }

        .zj-navbar.zj-nav-transparent .zj-nav-link:hover,
        .zj-navbar.zj-nav-transparent .zj-nav-icon-btn:hover {
          color: #CEA268;
        }
        .zj-navbar.zj-nav-transparent.zj-nav-transparent-light {
          border-bottom: 1px solid transparent;
        }
        .zj-navbar.zj-nav-transparent.zj-nav-transparent-light .zj-nav-link {
          color: #1a1a1a;
        }
        .zj-navbar.zj-nav-transparent.zj-nav-transparent-light .zj-nav-icon-btn {
          color: #1a1a1a;
        }
        .zj-navbar.zj-nav-transparent.zj-nav-transparent-light .zj-nav-logo-icon,
        .zj-navbar.zj-nav-transparent.zj-nav-transparent-light .zj-nav-logo-text {
          filter: none;
        }
        .zj-navbar.zj-nav-transparent.zj-nav-transparent-light .zj-nav-link:hover,
        .zj-navbar.zj-nav-transparent.zj-nav-transparent-light .zj-nav-icon-btn:hover {
          color: #CEA268;
        }
        .zj-navbar.zj-nav-solid {
          background: #ffffff;
          border-bottom: 1px solid rgba(232, 224, 216, 0.8);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03);
        }
        .zj-nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 80px;
          gap: 24px;
        }
        .zj-nav-links {
          display: flex;
          align-items: center;
          gap: 28px;
          flex: 1;
        }
        .zj-nav-links.right {
          justify-content: flex-end;
        }
        .zj-nav-link-item {
          position: relative;
          height: 100%;
          display: flex;
          align-items: center;
        }
        .zj-nav-link {
          font-size: 13px;
          font-weight: 500;
          color: #1a1a1a;
          text-decoration: none;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          transition: color 0.2s;
          white-space: nowrap;
          padding: 24px 0;
        }
        .zj-nav-link:hover {
          color: #CEA268;
        }
        
        /* Dropdown Styles */
        .zj-nav-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          background: #ffffff;
          min-width: 220px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          border-top: 2px solid #CEA268;
          padding: 16px 0;
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: all 0.3s ease;
          z-index: 1001;
        }
        .zj-nav-link-item:hover .zj-nav-dropdown,
        .zj-nav-dropdown.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        .zj-dropdown-link {
          display: block;
          padding: 12px 24px;
          font-size: 12px;
          color: #1a1a1a;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all 0.2s ease;
          font-weight: 500;
        }
        .zj-dropdown-link:hover {
          background: #f9f6f3;
          color: #CEA268;
          padding-left: 28px;
        }

        .zj-nav-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-decoration: none;
          min-width: fit-content;
        }
        .zj-nav-logo-wrapper {
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }
        .zj-nav-logo-icon {
          height: 44px;
          width: auto;
          margin-bottom: 2px;
          transition: transform 0.3s ease;
          display: block;
        }
        .zj-nav-logo-wrapper::after {
          content: "";
          position: absolute;
          top: 0;
          left: -150%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.6) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: skewX(-25deg);
        }
        .zj-nav-logo:hover .zj-nav-logo-wrapper::after {
          animation: zj-logo-shine 0.8s ease-in-out;
        }
        @keyframes zj-logo-shine {
          100% {
            left: 150%;
          }
        }
        .zj-nav-logo:hover .zj-nav-logo-icon {
          transform: scale(1.05);
        }
        .zj-nav-logo-text {
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: #1a1a1a;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .zj-nav-icons {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-left: 16px;
        }
        .zj-nav-icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
          position: relative;
          padding: 4px;
        }
        .zj-nav-icon-btn:hover {
          color: #CEA268;
        }
        .zj-cart-badge {
          position: absolute;
          top: -4px;
          right: -6px;
          background: #CEA268;
          color: #fff;
          font-size: 9px;
          font-weight: 700;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .zj-search-overlay {
          position: fixed;
          top: 72px;
          left: 0;
          right: 0;
          background: #fff;
          border-bottom: 1px solid #e8e0d8;
          padding: 16px 24px;
          z-index: 999;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .zj-search-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 16px;
          font-family: 'Montserrat', sans-serif;
          color: #1a1a1a;
          background: transparent;
        }
        .zj-search-input::placeholder {
          color: #999;
        }
        .zj-mobile-menu {
          display: none;
          position: fixed;
          top: 72px;
          left: 0;
          right: 0;
          bottom: 0;
          background: #fff;
          z-index: 998;
          padding: 24px;
          flex-direction: column;
          gap: 20px;
          overflow-y: auto;
        }
        .zj-mobile-menu.open {
          display: flex;
        }
        .zj-mobile-link {
          font-size: 15px;
          font-weight: 500;
          color: #1a1a1a;
          text-decoration: none;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 10px 0;
          border-bottom: 1px solid #f0ebe4;
          transition: color 0.2s;
        }
        .zj-mobile-link:hover {
          color: #CEA268;
        }
        .zj-hamburger {
          display: none;
        }
        @media (max-width: 900px) {
          .zj-nav-links:not(.right) {
            display: none;
          }
          .zj-nav-links.right {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 0;
            margin-left: 0;
            flex: none;
          }
          .zj-nav-links.right .zj-nav-link-item {
            display: none;
          }
          .zj-hamburger {
            display: flex;
            margin-left: 8px;
          }
        }
        @media (max-width: 768px) {
          .zj-nav-icons {
            gap: 10px;
            margin-left: 8px;
          }
          .zj-nav-inner {
            padding: 0 16px;
            gap: 12px;
          }
        }
        @media (max-width: 480px) {
          .zj-nav-logo-icon {
            height: 32px;
          }
          .zj-nav-logo-text {
            font-size: 11px;
            letter-spacing: 0.12em;
          }
          .zj-nav-icons {
            gap: 6px;
          }
        }
      `}</style>

      <nav className={`zj-navbar ${isTransparentNavbarPage ? 'zj-nav-home' : ''} ${isTransparentNavbarPage && !isScrolled && !isMenuOpen ? 'zj-nav-transparent' : 'zj-nav-solid'} ${isTransparentNavbarPage && !isScrolled && !isMenuOpen && isLightBgPage ? 'zj-nav-transparent-light' : ''}`}>
        <div className="zj-nav-inner">
          {/* Left nav links */}
          <div className="zj-nav-links">
            <div className="zj-nav-link-item">
              <Link href="/Pages" className="zj-nav-link">Home</Link>
            </div>
            <div 
              className="zj-nav-link-item"
              onMouseEnter={() => setIsShopOpen(true)}
              onMouseLeave={() => setIsShopOpen(false)}
            >
              <button 
                className="zj-nav-link"
                onClick={() => setIsShopOpen(!isShopOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  outline: 'none',
                  padding: '24px 0',
                }}
              >
                Shop
              </button>
              {categories.length > 0 && (
                <div className={`zj-nav-dropdown ${isShopOpen ? 'show' : ''}`}>
                  {categories.map(cat => (
                    <Link 
                      key={cat._id || cat.id} 
                      href={`/Pages/Products?category=${cat._id || cat.id}`} 
                      className="zj-dropdown-link"
                      onClick={() => setIsShopOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="zj-nav-link-item">
              <Link href="/Pages/ourProcess" className="zj-nav-link">Our Process</Link>
            </div>
            <div className="zj-nav-link-item">
              <Link href="/Pages/custom" className="zj-nav-link">Custom Jewelry</Link>
            </div>
          </div>

          {/* Centered Logo */}
          <Link href="/Pages" className="zj-nav-logo">
            <div className="zj-nav-logo-wrapper">
              <img src="/vector 1.png" alt="Logo" className="zj-nav-logo-icon" />
              <img src="/Frame 65.png" alt="Logo" className="zj-nav-logo-text" />
            </div>
          </Link>

          {/* Right nav links + icons */}
          <div className="zj-nav-links right">
            <div className="zj-nav-link-item">
              <Link href="/Pages/about" className="zj-nav-link">About Us</Link>
            </div>
            <div className="zj-nav-link-item">
              <Link href="/Pages/contact" className="zj-nav-link">Contact</Link>
            </div>

            <div className="zj-nav-icons">
              <button className="zj-nav-icon-btn" onClick={() => setShowSearch(!showSearch)} aria-label="Search">
                {showSearch ? <X size={20} /> : <Search size={20} />}
              </button>
              <button className="zj-nav-icon-btn" onClick={() => handleIconClick('profile', '/Pages/Profile?tab=profile')} aria-label="Profile">
                <User size={20} />
              </button>
              <button className="zj-nav-icon-btn" onClick={() => handleIconClick('wishlist', '/Pages/Profile?tab=wishlist')} aria-label="Wishlist">
                <Heart size={20} />
              </button>
              <button className="zj-nav-icon-btn" onClick={() => handleIconClick('cart', '/Pages/cart')} aria-label="Cart">
                <ShoppingBag size={20} />
                <span className="zj-cart-badge">0</span>
              </button>
            </div>
          </div>

          {/* Hamburger for mobile */}
          <button className="zj-nav-icon-btn zj-hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menu">
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Search overlay */}
        {showSearch && (
          <div className="zj-search-overlay">
            <Search size={20} color="#999" />
            <input
              className="zj-search-input"
              type="text"
              placeholder="Search for rings, necklaces, earrings..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  router.push(`/Pages/Products?search=${encodeURIComponent(searchQuery.trim())}`);
                  setShowSearch(false);
                }
                if (e.key === 'Escape') setShowSearch(false);
              }}
            />
            <button className="zj-nav-icon-btn" onClick={() => setShowSearch(false)}><X size={20} /></button>
          </div>
        )}
      </nav>

      {/* Mobile Menu */}
      <div className={`zj-mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        {/* Mobile Search Bar */}
        <div className="zj-mobile-search" style={{ borderBottom: '1px solid #f0ebe4', paddingBottom: '16px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#f9f6f3', borderRadius: '4px', padding: '10px 14px', gap: '10px' }}>
            <Search size={18} color="#888" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif',
                width: '100%',
                color: '#1a1a1a'
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  router.push(`/Pages/Products?search=${encodeURIComponent(searchQuery.trim())}`);
                  setIsMenuOpen(false);
                }
              }}
            />
          </div>
        </div>
        <Link href="/Pages" className="zj-mobile-link" onClick={() => setIsMenuOpen(false)}>Home</Link>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <button
            onClick={() => setIsMobileShopOpen(!isMobileShopOpen)}
            className="zj-mobile-link"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: '1px solid #f0ebe4',
              fontFamily: 'Montserrat, sans-serif',
              textTransform: 'uppercase',
              fontSize: '15px',
              fontWeight: 500,
              color: '#1a1a1a'
            }}
          >
            <span>Shop</span>
            <span style={{ 
              fontSize: '10px', 
              transform: isMobileShopOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
              transition: 'transform 0.2s',
              color: '#CEA268'
            }}>▼</span>
          </button>
          {isMobileShopOpen && categories.length > 0 && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              paddingLeft: '16px', 
              background: '#f9f6f3',
              borderRadius: '4px',
              marginTop: '4px',
              marginBottom: '8px'
            }}>
              {categories.map(cat => (
                <Link
                  key={cat._id || cat.id}
                  href={`/Pages/Products?category=${cat._id || cat.id}`}
                  className="zj-mobile-link"
                  style={{ borderBottom: 'none', fontSize: '13px', padding: '8px 0' }}
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsMobileShopOpen(false);
                  }}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
        <Link href="/Pages/Products?category=wedding" className="zj-mobile-link" onClick={() => setIsMenuOpen(false)}>Wedding Collection</Link>
        <Link href="/Pages/custom" className="zj-mobile-link" onClick={() => setIsMenuOpen(false)}>Custom Jewelry</Link>
        <Link href="/Pages/about" className="zj-mobile-link" onClick={() => setIsMenuOpen(false)}>About Us</Link>
        <Link href="/Pages/contact" className="zj-mobile-link" onClick={() => setIsMenuOpen(false)}>Contact</Link>
        
        {/* Mobile Account Utility Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0ebe4' }}>
          <button 
            onClick={() => { handleIconClick('profile', '/Pages/Profile?tab=profile'); setIsMenuOpen(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', textTransform: 'uppercase', fontSize: '13px', fontWeight: 500, color: '#1a1a1a', padding: '6px 0', textAlign: 'left' }}
          >
            <User size={18} /> Profile / Account
          </button>
          <button 
            onClick={() => { handleIconClick('wishlist', '/Pages/Profile?tab=wishlist'); setIsMenuOpen(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', textTransform: 'uppercase', fontSize: '13px', fontWeight: 500, color: '#1a1a1a', padding: '6px 0', textAlign: 'left' }}
          >
            <Heart size={18} /> Wishlist
          </button>
          <button 
            onClick={() => { handleIconClick('cart', '/Pages/cart'); setIsMenuOpen(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', textTransform: 'uppercase', fontSize: '13px', fontWeight: 500, color: '#1a1a1a', padding: '6px 0', textAlign: 'left' }}
          >
            <ShoppingBag size={18} /> Shopping Cart
          </button>
        </div>
      </div>
    </>
  );
}
