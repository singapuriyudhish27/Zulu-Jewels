'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import TrustBadge from '@/components/home/trustBadge';
import Footer from '@/components/layout/Footer';
import toast from 'react-hot-toast';

const MOST_LOVED = [
  { id: 101, img: "/Home Page/Most Loved Pieces/Frame 122.png" },
  { id: 102, img: "/Home Page/Most Loved Pieces/Frame 123.png" },
  { id: 103, img: "/Home Page/Most Loved Pieces/Frame 124.png" },
  { id: 104, img: "/Home Page/Most Loved Pieces/Frame 125.png" },
];

const TESTIMONIALS = [
  { name: "Sarah M.", text: "The ring is absolutely stunning. I get compliments every single day. The craftsmanship is beyond expectations!", rating: 5 },
  { name: "Priya K.", text: "Zulu Jewellers exceeded my expectations. The quality is exceptional and delivery was on time.", rating: 5 },
  { name: "Anjali D.", text: "I bought a custom necklace for my wedding and it turned out perfect. Will definitely come back!", rating: 5 },
  { name: "Riya S.", text: "Absolutely loved the design and finish. It feels premium and looks even better in person.", rating: 5 },
  { name: "Meera P.", text: "The attention to detail is incredible. You can really tell the craftsmanship is top-notch.", rating: 5 },
  { name: "Kavya R.", text: "Beautiful jewellery and amazing service. I received my order earlier than expected!", rating: 5 },
  { name: "Neha T.", text: "I gifted a bracelet to my sister and she couldn't stop admiring it. Highly recommended!", rating: 5 },
  { name: "Aisha F.", text: "The quality and elegance of the piece are unmatched. Definitely worth every penny.", rating: 5 },
  { name: "Pooja V.", text: "Customer support was very helpful and the product turned out exactly as shown online.", rating: 5 },
  { name: "Sneha L.", text: "Elegant, classy, and beautifully crafted. This is my new favorite jewellery brand!", rating: 5 }
];

const BLOGS = [
  { 
    title: "Understanding color theory: the color wheel and finding complementary colors", 
    date: "July 2, 2021", 
    tag: "UI DESIGN", 
    image: "/Home Page/Product Education/Rectangle 4.png",
    summary: "Nulla Lorem mollit cupidatat irure. Laborum magna nulla duis ullamco cillum dolor. Voluptate exercitation incididunt aliquip deserunt reprehenderit elit laborum."
  },
  { 
    title: "How to design a product that can grow itself 10x in year", 
    date: "June 29, 2021", 
    tag: "INTERNET", 
    image: "/Home Page/Product Education/thumbnail-2.png",
    summary: "Auctor Perla. Augue vitae diam mauris faucibus blandit elit per, feugiat leo dui orci. Etiam vestibulum. Nostra metus per conubia dolor."
  },
  { 
    title: "The More Important the Work, the More Important the Rest", 
    date: "June 22, 2021", 
    tag: "9 TO 5", 
    image: "/Home Page/Product Education/thumbnail-3.png",
    summary: "Suitable Quality is determined by product users, clients or customers, not by society in general. For example, a low priced product may be viewed as having high."
  },
  { 
    title: "Email Love - Email Inspiration, Templates and Discovery", 
    date: "June 18, 2021", 
    tag: "INSPIRATIONS", 
    image: "/Home Page/Product Education/thumbnail-4.png",
    summary: "Consider that for a moment: everything we see around us is assumed to have had a cause and is contingent upon something else."
  }
];



export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [sections, setSections] = useState([]);
  const [collections, setCollections] = useState([]);
  const [wishlist, setWishlist] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [bestSellerTab, setBestSellerTab] = useState(null);
  const productSectionRef = useRef(null);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const response = await fetch('/api/Pages');
        const result = await response.json();
        if (result.success) {
          const mapping = {
            "Rings": "Timeless Rings",
            "Earrings": "Statement Earrings",
            "Necklaces": "Timeless Neckline Elegance",
            "Bracelets": "Minimal & Statement Bracelets",
            "Pendants": "Pendants",
            "Watches": "Watches",
            "Anklets": "Anklets"
          };

          const formattedSections = result.data.map(category => ({
            id: category.id,
            title: mapping[category.name] || category.name,
            name: category.name,
            products: category.products
          })).filter(section => section.products.length > 0);

          setSections(formattedSections);

          const dbCollections = result.data.map(category => ({
            id: category.id,
            name: category.name,
            img: category.image || "/Home Page/Most Loved Pieces/Frame 122.png"
          }));
          setCollections(dbCollections);

          if (dbCollections.length > 0) {
            setBestSellerTab(dbCollections[0].id);
          }
        }

        // Fetch wishlist if logged in (handles 401/errors silently)
        const wishlistRes = await fetch('/api/Pages/Wishlist');
        if (wishlistRes.ok) {
          const wishlistResult = await wishlistRes.json();
          if (wishlistResult.success && wishlistResult.data) {
            const likedIds = {};
            wishlistResult.data.forEach(item => {
              likedIds[item.product_id.toString()] = true;
            });
            setWishlist(likedIds);
          }
        }
      } catch (error) {
        console.error("Error fetching page data or wishlist:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPageData();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('zj-visible');
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.zj-animate').forEach(el => {
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections, activeCategory, bestSellerTab]);

  useEffect(() => {
    if (activeCategory !== null && productSectionRef.current) {
      productSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeCategory]);

  const handleCollectionImageClick = (col) => {
    setActiveCategory(col.id);
  };

  const handleViewMoreClick = (e, col) => {
    e.stopPropagation();
    if (col.name === "Custom Jewelry") {
      router.push('/Pages/custom');
      return;
    }
    if (col.name === "Wedding Sets") {
      router.push('/Pages/Products?category=wedding');
      return;
    }
    router.push(`/Pages/Products?category=${col.id}`);
  };

  const getBestSellers = (categoryId) => {
    if (!categoryId) return [];
    const section = sections.find(s => String(s.id) === String(categoryId));
    if (section && section.products) {
      return section.products.slice(0, 4);
    }
    return [];
  };

  const activeSection = sections.find(s => s.id === activeCategory);

  const toggleWishlist = async (productId) => {
    try {
      const res = await fetch(`/api/Pages/Products/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, action: 'wishlist' })
      });

      if (res.status === 401) {
        router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        const isAdded = data.status === "added";
        setWishlist(prev => ({
          ...prev,
          [productId]: isAdded
        }));
        toast.success(data.message || (isAdded ? 'Added to wishlist!' : 'Removed from wishlist'));
      } else {
        toast.error(data.message || 'Failed to update wishlist');
      }
    } catch (error) {
      console.error("Wishlist toggle error:", error);
      toast.error(error.message || "An error occurred");
    }
  };

  return (
    <>
      <style>{`
        html {
          scroll-behavior: smooth;
        }
        .zj-page { 
          font-family: 'Montserrat', sans-serif; 
          background: #fff; 
          padding-top: 0px; /* Overrides default to let transparent navbar float over hero */
        }

        /* Hero Looped Video Layout */
        .zj-hero {
          position: relative;
          height: 100vh;
          min-height: 600px;
          background: #000000;
          overflow: hidden;
          display: flex;
          align-items: flex-end;
          padding-bottom: 140px;
        }
        .zj-hero-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 0;
        }
        .zj-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.2) 100%);
          z-index: 1;
        }
        .zj-hero-content {
          position: relative;
          z-index: 2;
          max-width: 900px;
          margin: 0 auto;
          padding: 0 48px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }
        .zj-hero-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: #EAB308;
        }
        .zj-hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 4.5vw, 64px);
          font-weight: 400;
          color: #fff;
          line-height: 1.1;
          max-width: 700px;
          letter-spacing: 0.01em;
        }
        .zj-hero-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          color: rgba(255,255,255,0.8);
          max-width: 520px;
          line-height: 1.8;
          font-weight: 500;
          margin-top: 8px;
        }
        .zj-hero-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 1px solid #ffffff;
          color: #ffffff;
          background: transparent;
          padding: 16px 40px;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          z-index: 1;
          transition: color 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s;
          margin-top: 16px;
          width: fit-content;
          font-family: 'Montserrat', sans-serif;
          opacity: 0;
          transform: translateY(20px);
          animation: zj-hero-fade-in 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.8s;
        }
        .zj-hero-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #ffffff;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: -1;
        }
        .zj-hero-btn:hover {
          color: #000000;
        }
        .zj-hero-btn:hover::before {
          transform: scaleX(1);
          transform-origin: left;
        }

        /* Section Headings */
        .zj-section { 
          max-width: 1280px; 
          margin: 0 auto; 
        }
        .zj-section-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        .zj-section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 36px;
          font-weight: 400;
          color: #000000;
          letter-spacing: 0.02em;
        }
        .zj-view-all {
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #EAB308;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }
        .zj-view-all:hover { color: #000000; }

        /* Curated Masterpieces */
        .zj-most-loved {
          text-align: center;
          padding: 60px 24px 60px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .zj-most-loved-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 44px;
          font-weight: 400;
          color: #000000;
          margin-bottom: 20px;
          letter-spacing: 0.02em;
        }
        .zj-curated-intro {
          font-family: 'Montserrat', sans-serif;
          font-size: 14px;
          font-weight: 300;
          color: #666666;
          max-width: 720px;
          margin: 0 auto 56px;
          line-height: 1.8;
          letter-spacing: 0.01em;
        }
        .zj-most-loved-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .zj-most-loved-item {
          aspect-ratio: 0.75;
          background: #FAF8F6;
          overflow: hidden;
          position: relative;
        }
        .zj-most-loved-item-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .zj-most-loved-item:hover .zj-most-loved-item-img {
          transform: scale(1.04);
        }

        /* Explore Our Collections Grid */
        .zj-collections-section {
          padding: 60px 24px;
          max-width: 1400px;
          margin: 0 auto;
          background: #ffffff;
        }
        .zj-collections-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 40px;
          font-weight: 400;
          text-align: center;
          color: #000000;
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .zj-collections-subtitle {
          font-family: 'Montserrat', sans-serif;
          font-size: 14px;
          font-weight: 300;
          color: #666666;
          text-align: center;
          margin-bottom: 56px;
          letter-spacing: 0.02em;
        }
        .zj-col-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }
        .zj-col-card {
          position: relative;
          aspect-ratio: 4/5;
          overflow: hidden;
          background: #000000;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 40px;
          cursor: pointer;
        }
        .zj-col-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.75;
          transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease;
        }
        .zj-col-card:hover .zj-col-img {
          transform: scale(1.05);
          opacity: 0.6;
        }
        .zj-col-overlay {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .zj-col-card-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px;
          color: #ffffff;
          font-weight: 400;
          margin-bottom: 16px;
          letter-spacing: 0.02em;
        }
        .zj-col-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #ffffff;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,0.4);
          padding-bottom: 4px;
          transition: border-color 0.3s, color 0.3s;
        }
        .zj-col-card:hover .zj-col-link {
          color: #EAB308;
          border-color: #EAB308;
        }

        /* This Month's Best Sellers */
        .zj-best-sellers-section {
          padding: 60px 24px;
          background: #FAF8F6; /* Luxury warm neutral contrast background */
          border-top: 1px solid rgba(232, 224, 216, 0.4);
          border-bottom: 1px solid rgba(232, 224, 216, 0.4);
        }
        .zj-best-sellers-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 40px;
          font-weight: 400;
          text-align: center;
          color: #000000;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .zj-best-sellers-subtitle {
          font-family: 'Montserrat', sans-serif;
          font-size: 14px;
          font-weight: 300;
          color: #666666;
          text-align: center;
          margin-bottom: 48px;
          letter-spacing: 0.02em;
        }
        .zj-best-sellers-tabs {
          display: flex;
          justify-content: center;
          gap: 32px;
          margin-bottom: 56px;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          padding-bottom: 16px;
        }
        .zj-best-seller-tab-btn {
          background: none;
          border: none;
          font-family: 'Montserrat', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #999999;
          cursor: pointer;
          position: relative;
          padding: 8px 0;
          transition: color 0.3s;
        }
        .zj-best-seller-tab-btn.active {
          color: #EAB308;
        }
        .zj-best-seller-tab-btn::after {
          content: '';
          position: absolute;
          bottom: -17px;
          left: 0;
          width: 100%;
          height: 2px;
          background: #EAB308;
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }
        .zj-best-seller-tab-btn.active::after {
          transform: scaleX(1);
        }

        /* Product Grid & Cards */
        .zj-product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
        }
        .zj-product-card {
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          background: #ffffff;
          padding: 16px;
          border-radius: 4px; /* Slightly sharper luxury border radius */
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          border: 1px solid rgba(232, 224, 216, 0.3);
          display: flex;
          flex-direction: column;
        }
        .zj-product-card:hover { 
          transform: translateY(-6px);
          box-shadow: 0 16px 36px rgba(0,0,0,0.06);
          border-color: rgba(234, 179, 8, 0.3);
        }
        .zj-product-img-wrap {
          position: relative;
          background: #FAF8F6;
          aspect-ratio: 1;
          overflow: hidden;
          margin-bottom: 20px;
          border-radius: 2px;
        }
        .zj-product-img-wrap img {
          transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .zj-product-card:hover .zj-product-img-wrap img {
          transform: scale(1.04);
        }
        .zj-product-img-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 64px;
        }
        .zj-product-wishlist {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(0,0,0,0.05);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          transition: all 0.3s;
          color: #bbbbbb;
        }
        .zj-product-wishlist:hover { 
          transform: scale(1.1); 
          color: #EAB308; 
          background: #ffffff;
        }
        .zj-product-name {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 8px;
          letter-spacing: 0.03em;
        }
        .zj-product-price {
          font-size: 13px;
          color: #666666;
          margin-bottom: 12px;
          font-weight: 500;
        }
        .zj-product-swatches {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: auto;
        }
        .zj-swatch {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.08);
          cursor: pointer;
          transition: transform 0.2s;
        }
        .zj-swatch:hover { transform: scale(1.3); border-color: rgba(0,0,0,0.2); }

        /* Dynamic Product Section below */
        #product-sections {
          background: #ffffff; 
          padding: 60px 0;
          border-top: 1px solid rgba(232, 224, 216, 0.4);
        }

        /* Section divider */
        .zj-divider { 
          border: none; 
          border-top: 1px solid rgba(232, 224, 216, 0.3); 
          margin: 0; 
        }

        /* Custom Design CTA */
        .zj-cta-banner-wrap { 
          max-width: 1400px; 
          margin: 0 auto; 
          padding: 60px 24px; 
          display: flex; 
          flex-direction: column;
          align-items: center;
          justify-content: center; 
        }
        .zj-cta-banner {
          width: 100%;
          position: relative;
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          background: #000000;
          text-align: right;
          padding: 60px 80px;
          overflow: hidden;
          border-radius: 0px; /* Sharp luxury edges */
          border: 1px solid rgba(234, 179, 8, 0.15);
        }
        .zj-cta-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 0;
        }
        .zj-cta-content { 
          position: relative; 
          z-index: 2; 
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          max-width: 520px;
        }
        .zj-cta-eyebrow {
          font-size: 10px;
          letter-spacing: 0.24em;
          color: #EAB308;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 20px;
        }
        .zj-cta-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 44px;
          color: #ffffff;
          font-weight: 400;
          margin-bottom: 16px;
          line-height: 1.2;
          letter-spacing: 0.01em;
        }
        .zj-cta-subtitle {
          font-size: 14px;
          color: rgba(255,255,255,0.9);
          max-width: 460px;
          margin: 0 0 32px auto;
          line-height: 1.7;
          font-weight: 300;
        }
        .zj-cta-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: #EAB308;
          color: #ffffff;
          border: 1px solid #EAB308;
          padding: 16px 36px;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          z-index: 1;
          transition: color 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s;
          font-family: 'Montserrat', sans-serif;
          border-radius: 0px;
        }
        .zj-cta-btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #ffffff;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: -1;
        }
        .zj-cta-btn-primary:hover {
          color: #000000;
          border-color: #ffffff;
        }
        .zj-cta-btn-primary:hover::before {
          transform: scaleX(1);
          transform-origin: left;
        }

        /* Gifts Section */
        .zj-gifts-outer { background: #FAF8F6; overflow: hidden; border-top: 1px solid rgba(232, 224, 216, 0.4); }
        .zj-gifts-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          height: 480px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .zj-gifts-content {
          padding: 20px 10% 20px 12%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
        }
        .zj-gifts-eyebrow {
          font-size: 10px;
          letter-spacing: 0.22em;
          color: #EAB308;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 24px;
        }
        .zj-gifts-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 40px;
          color: #000000;
          font-weight: 400;
          margin-bottom: 24px;
          line-height: 1.2;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .zj-gifts-text {
          font-size: 14px;
          color: #555555;
          line-height: 1.8;
          margin-bottom: 36px;
          max-width: 480px;
          font-weight: 300;
        }
        .zj-gifts-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #000000;
          color: #000000;
          background: transparent;
          padding: 14px 32px;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          z-index: 1;
          transition: color 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s;
          font-family: 'Montserrat', sans-serif;
        }
        .zj-gifts-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #000000;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: -1;
        }
        .zj-gifts-btn:hover {
          color: #ffffff;
        }
        .zj-gifts-btn:hover::before {
          transform: scaleX(1);
          transform-origin: left;
        }
        .zj-gifts-image {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
        }
        .zj-gifts-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .zj-gifts-image:hover .zj-gifts-img {
          transform: scale(1.03);
        }

        /* Testimonials */
        .zj-testimonials-section { 
          position: relative;
          background: #FAF8F6; 
          padding: 60px 0;
          border-top: 1px solid rgba(232, 224, 216, 0.4);
          border-bottom: 1px solid rgba(232, 224, 216, 0.4);
        }
        .zj-testimonials-inner { 
          max-width: 1400px; 
          margin: 0 auto; 
          padding: 0 40px; 
        }
        .zj-testimonials-track {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          padding: 10px 40px 30px;
          scroll-behavior: smooth;
          scrollbar-width: none;
          scroll-snap-type: x mandatory;
        }
        .zj-testimonials-carousel {
          position: relative;
          overflow: hidden;
        }
        .zj-testimonials-carousel::before,
        .zj-testimonials-carousel::after {
          content: "";
          position: absolute;
          top: 0;
          width: 120px;
          height: 100%;
          z-index: 2;
          pointer-events: none;
        }
        .zj-testimonials-carousel::before {
          left: 0;
          background: linear-gradient(to right, #FAF8F6 20%, transparent);
        }
        .zj-testimonials-carousel::after {
          right: 0;
          background: linear-gradient(to left, #FAF8F6 20%, transparent);
        }
        .zj-testimonials-track::-webkit-scrollbar { 
          display: none; 
        }
        .zj-testimonial-card {
          background: #ffffff;
          padding: 36px;
          border: 1px solid rgba(232, 224, 216, 0.3);
          border-radius: 2px;
          min-width: 340px;
          max-width: 380px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.01);
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
          scroll-snap-align: start;
        }
        .zj-testimonial-stars { color: #EAB308; font-size: 15px; letter-spacing: 3px; }
        .zj-testimonial-header { display: flex; align-items: center; gap: 8px; }
        .zj-testimonial-name { font-size: 13px; font-weight: 600; color: #1a1a1a; letter-spacing: 0.05em; text-transform: uppercase; }
        .zj-testimonial-verified-badge {
          width: 16px;
          height: 16px;
          background: #01AD51;
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          font-weight: bold;
        }
        .zj-testimonial-text { font-size: 13px; color: #555555; line-height: 1.8; font-weight: 300; font-style: italic; }

        /* Blog */
        .zj-blog-section { 
          max-width: 1280px; 
          margin: 0 auto; 
          padding: 60px 24px; 
        }
        .zj-blog-featured {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 60px;
          margin-bottom: 80px;
          align-items: center;
        }
        .zj-blog-featured-image {
          width: 100%;
          aspect-ratio: 1.6;
          overflow: hidden;
          border-radius: 2px;
          border: 1px solid rgba(232, 224, 216, 0.3);
        }
        .zj-blog-featured-img { width: 100%; height: 100%; object-fit: cover; transition: transform 1.2s ease; }
        .zj-blog-featured:hover .zj-blog-featured-img { transform: scale(1.03); }
        .zj-blog-meta { font-size: 10px; color: #EAB308; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 16px; font-weight: 600; }
        .zj-blog-featured-title { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 400; line-height: 1.3; color: #000; margin-bottom: 20px; letter-spacing: 0.01em; }
        .zj-blog-summary { font-size: 13px; color: #666666; line-height: 1.8; font-weight: 300; }

        .zj-blog-grid-bottom {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }
        .zj-blog-card-sm { display: flex; flex-direction: column; gap: 20px; }
        .zj-blog-card-image {
          width: 100%;
          aspect-ratio: 1.6;
          overflow: hidden;
          border-radius: 2px;
          background: #FAF8F6;
          border: 1px solid rgba(232, 224, 216, 0.2);
        }
        .zj-blog-card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s ease; }
        .zj-blog-card-sm:hover .zj-blog-card-img { transform: scale(1.04); }
        .zj-blog-card-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400; line-height: 1.4; color: #000; margin-bottom: 12px; }
        .zj-blog-card-summary { font-size: 12px; color: #666666; line-height: 1.7; font-weight: 300; }

        @media (max-width: 1024px) {
          .zj-product-grid { grid-template-columns: repeat(3, 1fr); }
          .zj-blog-grid-bottom { grid-template-columns: repeat(2, 1fr); gap: 24px; }
          .zj-col-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .zj-product-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
          .zj-most-loved-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .zj-most-loved-title { margin-bottom: 20px; font-size: 32px; }
          .zj-most-loved { padding: 80px 16px 40px; }
          .zj-blog-featured { grid-template-columns: 1fr; gap: 30px; margin-bottom: 40px; }
          .zj-blog-featured-title { font-size: 26px; }
          .zj-blog-featured-image { aspect-ratio: 1.5; }
          .zj-gifts-section { grid-template-columns: 1fr; gap: 0; height: auto; }
          .zj-gifts-content { padding: 60px 24px; align-items: center; text-align: center; }
          .zj-gifts-title { font-size: 32px; margin-bottom: 20px; }
          .zj-gifts-text { margin-bottom: 28px; }
          .zj-gifts-image { height: 320px; }
          .zj-cta-banner-wrap { padding: 40px 16px; }
          .zj-cta-banner { padding: 40px 30px; min-height: 380px; justify-content: center; text-align: center; }
          .zj-cta-content { align-items: center; }
          .zj-cta-title { font-size: 32px; }
          .zj-cta-subtitle { font-size: 13px; margin: 0 auto 24px; text-align: center; }
          .zj-blog-grid { grid-template-columns: 1fr; }
          .zj-hero-content { padding: 0 24px; }
          .zj-col-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .zj-product-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .zj-blog-grid-bottom { grid-template-columns: 1fr; gap: 20px; }
          .zj-hero { height: 80vh; min-height: 480px; padding-bottom: 80px; }
          .zj-hero-title { font-size: 36px; }
          .zj-hero-subtitle { font-size: 13px; }
          .zj-hero-btn { padding: 12px 28px; font-size: 10px; }
          .zj-section { padding: 60px 16px; }
          .zj-section-title { font-size: 26px; }
          .zj-section-header { margin-bottom: 24px; }
          .zj-best-sellers-tabs { gap: 16px; flex-wrap: wrap; }
        }

        /* Scroll Reveal & Image Parallax */
        .zj-animate {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, opacity;
        }
        .zj-animate.zj-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .zj-animate-img {
          transition: transform 1.8s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .zj-animate:not(.zj-visible) .zj-animate-img {
          transform: scale(1.1) !important;
        }

        /* Hero Text Animations on Mount */
        .zj-hero-eyebrow {
          opacity: 0;
          transform: translateY(20px);
          animation: zj-hero-fade-in 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.2s;
        }
        .zj-hero-title {
          opacity: 0;
          transform: translateY(30px);
          animation: zj-hero-title-in 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.4s;
        }
        .zj-hero-subtitle {
          opacity: 0;
          transform: translateY(30px);
          animation: zj-hero-fade-in 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.6s;
        }

        @keyframes zj-hero-fade-in {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes zj-hero-title-in {
          from {
            opacity: 0;
            transform: translateY(30px);
            letter-spacing: 0.08em;
          }
          to {
            opacity: 1;
            transform: translateY(0);
            letter-spacing: 0.01em;
          }
        }
      `}</style>

      <Navbar />

      <main className="zj-page">
        {/* Hero Section */}
        <section className="zj-hero">
          <video 
            src="/Home Page/Home Video.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="zj-hero-video"
          />
          <div className="zj-hero-overlay" />
          <div className="zj-hero-content">
            <span className="zj-hero-eyebrow">ZULU JEWELLERS</span>
            <h1 className="zj-hero-title">{"UP TO 40% OFF"}</h1>
            <p className="zj-hero-subtitle">
              {"Discover timeless jewellery designed with exceptional craftsmanship, refined elegance, and enduring beauty—created to celebrate life's most meaningful moments."}
            </p>
            <Link href="#collections" className="zj-hero-btn">
              {"Explore Collection →"}
            </Link>
          </div>
        </section>

        {/* Curated Masterpieces Section */}
        <section className="zj-most-loved">
          <h2 className="zj-most-loved-title zj-animate">{"Curated Masterpieces"}</h2>
          <p className="zj-curated-intro zj-animate">
            {"A handpicked selection of our most admired creations, showcasing exceptional craftsmanship, timeless elegance, and modern sophistication."}
          </p>
          <div className="zj-most-loved-grid">
            {MOST_LOVED.map((item, i) => (
              <div key={item.id} className="zj-most-loved-item zj-animate" style={{ transitionDelay: `${i * 100}ms` }}>
                <img src={item.img} alt="Curated Masterpiece" className="zj-most-loved-item-img zj-animate-img" />
              </div>
            ))}
          </div>
        </section>

        <hr className="zj-divider" />

        {/* Custom Design CTA */}
        <div className="zj-cta-banner-wrap">
          <div className="zj-cta-banner">
            <video 
              src="/About Page/Craftmentship Video.mp4" 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="zj-cta-video"
            />
            <div className="zj-cta-content zj-animate">
              <span className="zj-cta-eyebrow">{"BESPOKE DESIGN"}</span>
              <h2 className="zj-cta-title">{"Design Your Own Masterpiece"}</h2>
              <p className="zj-cta-subtitle">{"Bring your dream jewelry to life with our expert craftsmanship."}</p>
              <Link href="/Pages/custom" className="zj-cta-btn-primary">{"Start Custom Design"}</Link>
            </div>
          </div>
        </div>

        {/* Gifts Section */}
        <div className="zj-gifts-outer">
          <section className="zj-gifts-section">
            <div className="zj-gifts-content zj-animate">
              <span className="zj-gifts-eyebrow">{"THE GIFTING SUITE"}</span>
              <h2 className="zj-gifts-title">{"Gifts of the season"}</h2>
              <p className="zj-gifts-text">
                {"Discover our carefully curated selection of gifts perfect for every occasion. From delicate everyday pieces to statement jewellery for special moments, find the ideal gift for that someone special."}
              </p>
              <Link href="/Pages/Products" className="zj-gifts-btn">{"Shop Gifts"}</Link>
            </div>
            <div className="zj-gifts-image zj-animate">
              <img src="/Home Page/Gift Of The Season/Rectangle 37.png" alt="Gifts" className="zj-gifts-img zj-animate-img" />
            </div>
          </section>
        </div>

        {/* Explore Our Collections (New Section) */}
        <section id="collections" className="zj-collections-section">
          <h2 className="zj-collections-title zj-animate">{"Explore Our Collections"}</h2>
          <p className="zj-collections-subtitle zj-animate">{"Immerse yourself in our distinct ateliers, each home to heirloom-quality fine creations."}</p>
          <div className="zj-col-grid">
            {collections.map((col, idx) => (
              <div 
                key={col.id || idx} 
                className="zj-col-card zj-animate"
                style={{ transitionDelay: `${idx * 100}ms` }}
                onClick={() => handleCollectionImageClick(col)}
              >
                <img src={col.img} alt={col.name} className="zj-col-img zj-animate-img" />
                <div className="zj-col-overlay">
                  <h3 className="zj-col-card-title">{col.name}</h3>
                  <span className="zj-col-link" onClick={(e) => handleViewMoreClick(e, col)}>{"View More →"}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Product Sections (Moved lower down, now filtered dynamically) */}
        {activeCategory !== null && (
          <div id="product-sections" ref={productSectionRef}>
            <section className="zj-section">
              <div className="zj-section-header zj-animate" style={{ flexDirection: 'column', alignItems: 'center', gap: '24px', marginBottom: '56px' }}>
                <h2 className="zj-section-title" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {"Browse Atelier Collections"}
                </h2>
                
                {/* Local Navigation Tabs */}
                <div className="zj-best-sellers-tabs" style={{ width: '100%', justifyContent: 'center', marginBottom: '0px' }}>
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      className={`zj-best-seller-tab-btn ${activeCategory === section.id ? 'active' : ''}`}
                      onClick={() => setActiveCategory(section.id)}
                    >
                      {section.name}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '100px 0', fontSize: '16px', color: '#888', letterSpacing: '0.05em' }}>
                  {"Loading Atelier Collections..."}
                </div>
              ) : activeSection ? (
                <div className="zj-product-grid">
                  {activeSection.products.map((p, pi) => (
                    <div 
                      key={pi} 
                      className="zj-product-card zj-animate" 
                      onClick={() => router.push(`/Pages/Products/${p.id}`)}
                      style={{ transitionDelay: `${pi * 80}ms` }}
                    >
                      <div className="zj-product-img-wrap">
                        {p.images && p.images.length > 0 ? (
                          <img 
                            src={p.images.find(img => img.is_primary)?.image_url || p.images[0].image_url} 
                            alt={p.name} 
                            className="zj-animate-img"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="zj-product-img-placeholder">💍</div>
                        )}
                        <button 
                       className="zj-product-wishlist" 
                       onClick={e => { 
                         e.preventDefault(); 
                         e.stopPropagation(); 
                         toggleWishlist(p.id); 
                       }}
                       style={{ color: wishlist[p.id] ? '#EAB308' : '#bbbbbb' }}
                     >
                       {wishlist[p.id] ? '♥' : '♡'}
                     </button>
                      </div>
                      <div className="zj-product-name">{p.name}</div>
                      <div className="zj-product-price">
                        {p.price ? `₹${Number(p.price).toLocaleString()}` : "Price on Request"}
                      </div>
                      {p.swatches && p.swatches.length > 0 && (
                        <div className="zj-product-swatches">
                          {p.swatches.map((s, i) => (
                            <span key={i} className="zj-swatch" style={{ background: s }} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
                  {"No products found in this category."}
                </div>
              )}
              
              {activeSection && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '56px' }}>
                  <Link href={`/Pages/Products?category=${activeSection.id}`} className="zj-gifts-btn" style={{ padding: '16px 48px', letterSpacing: '0.12em', fontSize: '11px' }}>
                    {`View Full ${activeSection.title} Collection`}
                  </Link>
                </div>
              )}
            </section>
          </div>
        )}

        {/* This Month's Best Sellers (New Section) */}
        <section className="zj-best-sellers-section">
          <div className="zj-best-sellers-inner">
            <h2 className="zj-best-sellers-title zj-animate">{"This Month's Best Sellers"}</h2>
            <p className="zj-best-sellers-subtitle zj-animate">{"Our most coveted designs, curated for their exceptional beauty and demand."}</p>
            
            <div className="zj-best-sellers-tabs">
              {collections.map((col) => (
                <button
                  key={col.id}
                  className={`zj-best-seller-tab-btn ${bestSellerTab === col.id ? 'active' : ''}`}
                  onClick={() => setBestSellerTab(col.id)}
                >
                  {col.name}
                </button>
              ))}
            </div>

            <div className="zj-product-grid">
              {getBestSellers(bestSellerTab).map((p, pi) => (
                <div 
                  key={pi} 
                  className="zj-product-card zj-animate" 
                  onClick={() => router.push(`/Pages/Products/${p.id}`)}
                  style={{ transitionDelay: `${pi * 80}ms` }}
                >
                  <div className="zj-product-img-wrap">
                    {p.images && p.images.length > 0 ? (
                      <img 
                        src={p.images.find(img => img.is_primary)?.image_url || p.images[0].image_url} 
                        alt={p.name} 
                        className="zj-animate-img"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="zj-product-img-placeholder">💍</div>
                    )}
                    <button 
                      className="zj-product-wishlist" 
                      onClick={e => { 
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        toggleWishlist(p.id); 
                      }}
                      style={{ color: wishlist[p.id] ? '#EAB308' : '#bbbbbb' }}
                    >
                      {wishlist[p.id] ? '♥' : '♡'}
                    </button>
                  </div>
                  <div className="zj-product-name">{p.name}</div>
                  <div className="zj-product-price">
                    {p.price ? `₹${Number(p.price).toLocaleString()}` : "Price on Request"}
                  </div>
                  {p.swatches && p.swatches.length > 0 && (
                    <div className="zj-product-swatches">
                      {p.swatches.map((s, i) => (
                        <span key={i} className="zj-swatch" style={{ background: s }} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {getBestSellers(bestSellerTab).length === 0 && (
                <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '40px', color: '#888', fontSize: '13px' }}>
                  {"No top sellers available in this category."}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="zj-testimonials-section">
          <div className="zj-testimonials-inner">
            <div className="zj-section-header zj-animate" style={{ justifyContent: 'center', marginBottom: '56px' }}>
              <h2 className="zj-section-title" style={{ 
                fontSize: '36px', 
                textTransform: 'uppercase',
                textAlign: 'center',
                width: '100%',
                letterSpacing: '0.04em'
              }}>
                {"Loved by Our Customers"}
              </h2>
            </div>
            <div className="zj-testimonials-carousel">
              <div className="zj-testimonials-track">
                {TESTIMONIALS.map((t, i) => (
                  <div key={i} className="zj-testimonial-card zj-animate" style={{ transitionDelay: `${i * 80}ms` }}>
                    <div className="zj-testimonial-stars">{'★'.repeat(t.rating)}</div>
                    <div className="zj-testimonial-header">
                      <span className="zj-testimonial-name">{t.name}</span>
                      <span className="zj-testimonial-verified-badge">✓</span>
                    </div>
                    <p className="zj-testimonial-text">&ldquo;{t.text}&rdquo;</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Blog */}
        <section className="zj-blog-section">
          {/* Featured Post */}
          <div className="zj-blog-featured zj-animate">
            <div className="zj-blog-featured-image">
              <img src={BLOGS[0].image} alt={BLOGS[0].title} className="zj-blog-featured-img zj-animate-img" />
            </div>
            <div className="zj-blog-featured-content">
              <p className="zj-blog-meta">{BLOGS[0].tag} • {BLOGS[0].date}</p>
              <h3 className="zj-blog-featured-title">{BLOGS[0].title}</h3>
              <p className="zj-blog-summary">{BLOGS[0].summary}</p>
            </div>
          </div>

          {/* Grid Bottom */}
          <div className="zj-blog-grid-bottom">
            {BLOGS.slice(1).map((b, i) => (
              <div key={i} className="zj-blog-card-sm zj-animate" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="zj-blog-card-image">
                  <img src={b.image} alt={b.title} className="zj-blog-card-img zj-animate-img" />
                </div>
                <div className="zj-blog-card-content">
                  <p className="zj-blog-meta">{b.tag} • {b.date}</p>
                  <h4 className="zj-blog-card-title">{b.title}</h4>
                  <p className="zj-blog-card-summary">{b.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <TrustBadge />
      </main>

      <Footer />
    </>
  );
}