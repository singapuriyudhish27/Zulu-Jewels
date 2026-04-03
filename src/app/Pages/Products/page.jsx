'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SlidersHorizontal, ChevronDown, Heart } from 'lucide-react';


function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeCategory, setActiveCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('default');
  const [genderFilter, setGenderFilter] = useState('all');
  const [wishlist, setWishlist] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const categoryId = searchParams.get('category');

  useEffect(() => {
    // Fetch products from the API with category filter
    setLoading(true);
    const apiUrl = categoryId 
      ? `/api/Pages/Products?category=${categoryId}`
      : '/api/Pages/Products';

    fetch(apiUrl)
      .then(res => res.json())
      .then(res => {
        if (res.success && res.categories) {
          // Flatten the category-nested products for display
          const allProducts = res.categories.flatMap(cat => cat.products || []);
          setProducts(allProducts);
          // Set active category if categoryId is provided
          if (categoryId) {
            const cat = res.categories.find(c => String(c.id) === categoryId);
            setActiveCategory(cat);
          } else {
            setActiveCategory(null);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, [categoryId]);

  const toggleWishlist = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtering implementation
  let filtered = [...products];
  
  // 1. Filter by Gender from dropdown
  if (genderFilter !== 'all') {
    filtered = filtered.filter(p => 
      p.gender?.toLowerCase() === genderFilter.toLowerCase() || 
      p.gender?.toLowerCase() === 'unisex'
    );
  }

  // 3. Sorting
  if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price);
  if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price);
  if (sortBy === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (sortBy === 'newest') filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  if (loading) return <div style={{ padding: '80px', textAlign: 'center', color: '#888' }}>Loading products...</div>;

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <style>{`
        .pr-page { font-family: 'Montserrat', sans-serif; background: #ffffff; padding-top: 72px; }

        /* General Variables */
        :root {
          --zj-black: #000000;
          --zj-white: #ffffff;
          --zj-gold: #EAB308;
          --zj-bg: #F9F9F9;
        }

        /* Hero */
        .pr-hero {
          position: relative;
          min-height: 320px;
          background: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
        }
        .pr-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.3) 100%);
        }
        .pr-hero-content { position: relative; z-index: 1; padding: 0 24px; }
        .pr-hero-eyebrow {
          font-size: 11px;
          letter-spacing: 0.24em;
          color: #EAB308;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .pr-hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 6vw, 56px);
          color: #ffffff;
          font-weight: 500;
          line-height: 1.1;
          margin-bottom: 16px;
        }
        .pr-hero-sub { font-size: 14px; color: rgba(255,255,255,0.7); max-width: 500px; margin: 0 auto; line-height: 1.6; }

        /* Toolbar */
        .pr-toolbar {
          max-width: 1280px;
          margin: 0 auto;
          padding: 32px 24px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .pr-count { font-size: 13px; color: #666666; }
        .pr-count span { color: #000000; font-weight: 600; }
        .pr-controls { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
        .pr-select-wrap { position: relative; }
        .pr-select {
          appearance: none;
          padding: 12px 40px 12px 16px;
          border: 1px solid #EFEFEF;
          background: #ffffff;
          font-size: 12px;
          font-weight: 500;
          font-family: 'Montserrat', sans-serif;
          color: #000000;
          cursor: pointer;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          border-radius: 2px;
        }
        .pr-select:focus { border-color: #000000; }
        .pr-select-arrow {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #888888;
        }

        /* Product Grid */
        .pr-grid-section { max-width: 1280px; margin: 0 auto; padding: 40px 24px 64px; }
        .pr-product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
        }
        .pr-product-card { cursor: pointer; }
        .pr-product-img-wrap {
          position: relative;
          background: #F9F9F9;
          aspect-ratio: 1;
          overflow: hidden;
          margin-bottom: 16px;
          transition: box-shadow 0.3s ease;
        }
        .pr-product-card:hover .pr-product-img-wrap { box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
        .pr-product-img {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 80px;
          transition: transform 0.4s ease;
        }
        .pr-product-card:hover .pr-product-img { transform: scale(1.05); }
        .pr-wishlist-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #ffffff;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          transition: transform 0.2s ease, color 0.2s ease;
          color: #cccccc;
        }
        .pr-wishlist-btn.active { color: #EAB308; }
        .pr-wishlist-btn:hover { transform: scale(1.1); color: #000000; }
        .pr-product-name { font-size: 14px; font-weight: 600; color: #000000; margin-bottom: 6px; letter-spacing: 0.02em; }
        .pr-product-price { font-size: 13px; color: #666666; margin-bottom: 12px; }
        .pr-swatches { display: flex; gap: 6px; flex-wrap: wrap; }
        .pr-swatch {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.1);
          cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .pr-swatch:hover { transform: scale(1.25); border-color: rgba(0,0,0,0.3); }

        /* Pagination */
        .pr-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 40px 0 64px;
        }
        .pr-page-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #EFEFEF;
          background: #F9F9F9;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          color: #555555;
          transition: all 0.2s ease;
          font-family: 'Montserrat', sans-serif;
          border-radius: 4px;
        }
        .pr-page-btn:hover { background: #EFEFEF; color: #000000; border-color: #dddddd; }
        .pr-page-btn.active { background: #000000; color: #ffffff; border-color: #000000; }
        .pr-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .pr-page-text {
          padding: 0 16px;
          height: 40px;
          display: flex;
          align-items: center;
          font-size: 13px;
          color: #888888;
        }

        @media (max-width: 1024px) { .pr-product-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px) { .pr-product-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; } }
        @media (max-width: 480px) { .pr-product-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; } }
      `}</style>

      {/* Hero */}
      <section className="pr-hero" style={activeCategory?.image ? {
        backgroundImage: `url(${activeCategory.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : {}}>
        <div className="pr-hero-content">
          <p className="pr-hero-eyebrow">Our Collections</p>
          <h1 className="pr-hero-title">{activeCategory ? `${activeCategory.name} Collection` : "All Collections"}</h1>
          <p className="pr-hero-sub">{activeCategory ? `Discover our exquisite ${activeCategory.name.toLowerCase()} pieces, crafted with elegance and precision.` : "Discover timeless jewelry crafted with elegance and precision."}</p>
        </div>
      </section>

      {/* Toolbar */}
      <div className="pr-toolbar">
        <p className="pr-count">Showing <span>{(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span>{filtered.length}</span> products</p>
        <div className="pr-controls">
          <div className="pr-select-wrap">
            <select className="pr-select" value={genderFilter} onChange={e => { setGenderFilter(e.target.value); setCurrentPage(1); }}>
              <option value="all">All</option>
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="couple">Couple</option>
              <option value="unisex">Unisex</option>
            </select>
            <ChevronDown size={14} className="pr-select-arrow" />
          </div>
          <div className="pr-select-wrap">
            <select className="pr-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="default">Sort By</option>
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A–Z</option>
            </select>
            <ChevronDown size={14} className="pr-select-arrow" />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="pr-grid-section">
        <div className="pr-product-grid">
          {paginated.map(p => (
            <div key={p.id} className="pr-product-card">
              <Link href={`/Pages/Products/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="pr-product-img-wrap">
                  {p.images && p.images.length > 0 ? (
                    <img 
                      src={p.images.find(img => img.is_primary)?.image_url || p.images[0].image_url} 
                      alt={p.name} 
                      className="pr-product-img"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="pr-product-img">💍</div>
                  )}
                  <button
                    className={`pr-wishlist-btn ${wishlist[p.id] ? 'active' : ''}`}
                    onClick={e => toggleWishlist(p.id, e)}
                    aria-label="Toggle wishlist"
                  >
                    <Heart size={16} fill={wishlist[p.id] ? '#EAB308' : 'none'} />
                  </button>
                </div>
                <p className="pr-product-name">{p.name}</p>
                <p className="pr-product-price">₹{Number(p.price).toLocaleString()}</p>
                <div className="pr-swatches">
                  {(p.swatches || []).map((s, i) => (
                    <span key={i} className="pr-swatch" style={{ background: s }} />
                  ))}
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pr-pagination">
            <button className="pr-page-btn" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>←</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`pr-page-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            {totalPages > 5 && <span className="pr-page-text">...</span>}
            {totalPages > 5 && (
              <button className={`pr-page-btn ${currentPage === totalPages ? 'active' : ''}`} onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>
            )}
            <button className="pr-page-btn" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>→</button>
          </div>
        )}
      </div>
    </>
  );
}

export default function EngagementPage() {
  return (
    <>
      <Navbar />
      <main style={{ fontFamily: 'Montserrat, sans-serif', background: '#fff', paddingTop: '72px' }}>
        <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center', color: '#888' }}>Loading...</div>}>
          <ProductsContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}