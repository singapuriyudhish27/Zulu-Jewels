'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import TrustBadge from '@/components/home/trustBadge';
import Footer from '@/components/layout/Footer';

const PRODUCTS = [
  { id: 1, name: "Men's Ring", price: "₹1,332 – ₹1,866", swatches: ["#D4AF37","#F5C85A","#E8D5A3","#C0C0C0","#E8E8E8","#B8860B","#8B7355"] },
  { id: 2, name: "Solitaire Ring", price: "₹2,450 – ₹3,200", swatches: ["#D4AF37","#F5C85A","#E8D5A3","#C0C0C0","#E8E8E8","#B8860B","#8B7355"] },
  { id: 3, name: "Pavé Band", price: "₹1,800 – ₹2,400", swatches: ["#D4AF37","#F5C85A","#E8D5A3","#C0C0C0","#E8E8E8","#B8860B","#8B7355"] },
  { id: 4, name: "Diamond Halo Ring", price: "₹3,100 – ₹4,500", swatches: ["#D4AF37","#F5C85A","#E8D5A3","#C0C0C0","#E8E8E8","#B8860B","#8B7355"] },
];

const SECTIONS = [
  { title: "Timeless Rings", products: PRODUCTS },
  { title: "Statement Earrings", products: PRODUCTS },
  { title: "Timeless Neckline Elegance", products: PRODUCTS },
  { title: "Minimal & Statement Bracelets", products: PRODUCTS },
  { title: "Wedding Jewels for Your Big Day", products: PRODUCTS },
];

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

  const requireAuth = (action) => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('zulu_jewels='))
      ?.split('=')[1];
    if (!token) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    if (action) action();
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });

    document.querySelectorAll('.zj-animate').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = 'all 0.65s ease';
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .zj-page { font-family: 'Montserrat', sans-serif; background: #fff; padding-top: 72px; }

        /* General Colors:
           Black: #000000
           White: #FFFFFF
           Gold/Accent: #EAB308
           Light Gray Bg: #F9F9F9
           Text: #333333 / #666666
        */

        /* Hero */
        .zj-hero {
          position: relative;
          height: 88vh;
          min-height: 560px;
          background: #000000;
          overflow: hidden;
          display: flex;
          align-items: flex-end;
          padding-bottom: 120px;
        }
        .zj-hero-bg {
          position: absolute;
          inset: 0;
          background-image: url('/Home Page/Header/Frame 151.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
        .zj-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 100%);
        }
        .zj-hero-content {
          position: relative;
          z-index: 2;
          max-width: 1280px;
          margin: 0;
          padding: 0 48px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .zj-hero-eyebrow {
          font-size: 11px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: #EAB308;
          font-weight: 600;
        }
        .zj-hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(42px, 7vw, 84px);
          font-weight: 500;
          color: #fff;
          line-height: 1.05;
          max-width: 640px;
        }
        .zj-hero-subtitle {
          font-size: 15px;
          color: rgba(255,255,255,0.7);
          max-width: 480px;
          line-height: 1.7;
          font-weight: 300;
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
          padding: 15px 36px;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 16px;
          width: fit-content;
          font-family: 'Montserrat', sans-serif;
        }
        .zj-hero-btn:hover {
          background: #ffffff;
          color: #000000;
        }

        .zj-hero-btn:hover {
          background: #ffffff;
          color: #000000;
        }

        /* Section Headings */
        .zj-section { max-width: 1280px; margin: 0 auto; padding: 80px 24px; }
        .zj-section-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        .zj-section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px;
          font-weight: 500;
          color: #000000;
          letter-spacing: 0.01em;
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

        /* Most Loved Pieces Special Section */
        .zj-most-loved {
          text-align: center;
          padding: 80px 24px 40px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .zj-most-loved-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 34px;
          font-weight: 500;
          color: #000000;
          margin-bottom: 48px;
        }
        .zj-most-loved-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .zj-most-loved-item {
          aspect-ratio: 0.75;
          background: #F9F9F9;
          overflow: hidden;
          position: relative;
        }
        .zj-most-loved-item-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 1s cubic-bezier(0.19, 1, 0.22, 1);
        }
        .zj-most-loved-item:hover .zj-most-loved-item-img {
          transform: scale(1.1);
        }

        /* Product Grid */
        .zj-product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .zj-product-card {
          cursor: pointer;
          transition: transform 0.3s;
        }
        .zj-product-card:hover { transform: translateY(-4px); }
        .zj-product-img-wrap {
          position: relative;
          background: #F9F9F9;
          aspect-ratio: 1;
          overflow: hidden;
          margin-bottom: 16px;
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
          background: #fff;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transition: transform 0.2s, color 0.2s;
          color: #ccc;
        }
        .zj-product-wishlist:hover { transform: scale(1.1); color: #EAB308; }
        .zj-product-name {
          font-size: 13px;
          font-weight: 600;
          color: #000000;
          margin-bottom: 6px;
          letter-spacing: 0.02em;
        }
        .zj-product-price {
          font-size: 13px;
          color: #666;
          margin-bottom: 12px;
        }
        .zj-product-swatches {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .zj-swatch {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.08);
          cursor: pointer;
          transition: transform 0.2s;
        }
        .zj-swatch:hover { transform: scale(1.25); border-color: rgba(0,0,0,0.2); }

        /* Section divider */
        .zj-divider { border: none; border-top: 1px solid #EFEFEF; margin: 0; }

        /* Custom Design CTA */
        .zj-cta-banner-wrap { 
          max-width: 1580px; 
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
          min-height: 520px;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          background-image: url('/Home Page/Custom Design Template/Frame 91.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          text-align: right;
          padding: 60px;
          overflow: hidden;
          border-radius: 20px;
        }
        .zj-cta-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top right, rgba(0,0,0,0.1), rgba(0,0,0,0.2));
          z-index: 0;
        }
        .zj-cta-content { 
          position: relative; 
          z-index: 1; 
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          max-width: 600px;
        }
        .zj-cta-eyebrow {
          font-size: 10px;
          letter-spacing: 0.24em;
          color: #EAB308;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .zj-cta-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 48px;
          color: #ffffff;
          font-weight: 500;
          margin-bottom: 12px;
          line-height: 1;
        }
        .zj-cta-subtitle {
          font-size: 15px;
          color: #ffffff;
          max-width: 520px;
          margin: 0 0 32px auto;
          line-height: 1.6;
        }
        .zj-cta-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #EAB308;
          color: #ffffff;
          border: none;
          padding: 14px 32px;
          font-size: 12px;
          letter-spacing: 0.05em;
          text-transform: none;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s;
          font-family: 'Montserrat', sans-serif;
          border-radius: 4px;
        }
        .zj-cta-btn-primary:hover {
          background: #ca9a07;
          transform: translateY(-2px);
        }

        /* Gifts Section */
        .zj-gifts-outer { background: #F9F5F2; overflow: hidden; }
        .zj-gifts-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          height: 450px;
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
          font-family: 'Montserrat', sans-serif;
          font-size: 38px;
          color: #000000;
          font-weight: 600;
          margin-bottom: 32px;
          line-height: 1.2;
          text-transform: capitalize;
        }
        .zj-gifts-text {
          font-size: 15px;
          color: #333;
          line-height: 1.8;
          margin-bottom: 40px;
          max-width: 480px;
        }
        .zj-gifts-btn {
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
        .zj-gifts-btn:hover {
          background: #000000;
          color: #ffffff;
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
          transition: transform 0.8s ease;
        }
        .zj-gifts-image:hover .zj-gifts-img {
          transform: scale(1.05);
        }

        /* Testimonials */
        .zj-testimonials-section { 
          position: relative;
          background: #F7F7F7; 
          padding: 40px 0;
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
          padding: 20px 0;
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
          width: 100px;
          height: 100%;
          z-index: 2;
          pointer-events: none;
        }
        .zj-testimonials-carousel::before {
          left: 0;
          background: linear-gradient(to right, #F7F7F7 20%, transparent);
        }
        .zj-testimonials-carousel::after {
          right: 0;
          background: linear-gradient(to left, #F7F7F7 20%, transparent);
        }
        .zj-testimonials-track::-webkit-scrollbar { 
          display: none; 
        }
        .zj-testimonial-card {
          background: #ffffff;
          padding: 28px;
          border: 1px solid #EAEAEA;
          border-radius: 18px;
          min-width: 320px;
          max-width: 360px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
          scroll-snap-align: start;
        }
        .zj-testimonial-stars { color: #FFBB33; font-size: 18px; letter-spacing: 2px; }
        .zj-testimonial-header { display: flex; align-items: center; gap: 8px; }
        .zj-testimonial-name { font-size: 16px; font-weight: 700; color: #000000; letter-spacing: 0.02em; }
        .zj-testimonial-verified-badge {
          width: 20px;
          height: 20px;
          background: #01AD51;
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
        }
        .zj-testimonial-text { font-size: 14px; color: rgba(0,0,0,0.6); line-height: 1.6; }

        /* Blog */
        .zj-blog-section { 
          max-width: 1280px; 
          margin: 0 auto; 
          padding: 40px 24px; 
        }
        .zj-blog-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; margin-top: 40px; }
        .zj-blog-right { display: grid; gap: 16px; }
        .zj-blog-card-featured {
          background: #000000;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          min-height: 360px;
          cursor: pointer;
          transition: transform 0.3s;
          position: relative;
          overflow: hidden;
        }
        .zj-blog-card-featured:hover { transform: scale(1.01); }
        .zj-blog-tag-featured {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #EAB308;
          font-weight: 700;
          margin-bottom: 12px;
          position: relative;
        }
        .zj-blog-title-featured {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          color: #ffffff;
          font-weight: 500;
          line-height: 1.3;
          position: relative;
        }
        .zj-blog-featured {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 40px;
          margin-bottom: 60px;
          align-items: center;
        }
        .zj-blog-featured-image {
          width: 100%;
          aspect-ratio: 1.6;
          overflow: hidden;
          border-radius: 4px;
        }
        .zj-blog-featured-img { width: 100%; height: 100%; object-fit: cover; }
        .zj-blog-meta { font-size: 11px; color: #888; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; }
        .zj-blog-featured-title { font-size: 28px; font-weight: 700; line-height: 1.3; color: #000; margin-bottom: 20px; }
        .zj-blog-summary { font-size: 14px; color: #666; line-height: 1.8; }

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
          border-radius: 8px;
          background: #f5f5f5;
        }
        .zj-blog-card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
        .zj-blog-card-sm:hover .zj-blog-card-img { transform: scale(1.05); }
        .zj-blog-card-title { font-size: 18px; font-weight: 700; line-height: 1.4; color: #000; margin-bottom: 12px; }
        .zj-blog-card-summary { font-size: 13px; color: #777; line-height: 1.6; }

        @media (max-width: 1024px) {
          .zj-product-grid { grid-template-columns: repeat(3, 1fr); }
          .zj-testimonials-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .zj-product-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .zj-gifts-section { grid-template-columns: 1fr; gap: 48px; }
          .zj-testimonials-grid { grid-template-columns: 1fr; }
          .zj-blog-grid { grid-template-columns: 1fr; }
          .zj-hero-decorations { display: none; }
          .zj-hero-content { padding: 0 24px; }
        }
        @media (max-width: 480px) {
          .zj-product-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
        }
      `}</style>

      <Navbar />

      <main className="zj-page">
        {/* Hero */}
        <section className="zj-hero">
          <div className="zj-hero-bg" />
          <div className="zj-hero-overlay" />
          <div className="zj-hero-content">
            <h1 className="zj-hero-title">The Autumn Equinox</h1>
            <p className="zj-hero-subtitle">Fall has arrived. Shop for our new releases starting today and find the piece that speaks to your essence.</p>
            <Link href="/Pages/Products" className="zj-hero-btn">
              Shop Now →
            </Link>
          </div>
        </section>

        {/* Most Loved Pieces Section */}
        <section className="zj-most-loved zj-animate">
          <h2 className="zj-most-loved-title">Most Loved Pieces</h2>
          <div className="zj-most-loved-grid">
            {MOST_LOVED.map((item, i) => (
              <div key={item.id} className="zj-most-loved-item" style={{ transitionDelay: `${i * 100}ms` }}>
                <img src={item.img} alt="Most Loved" className="zj-most-loved-item-img" />
              </div>
            ))}
          </div>
        </section>

        <hr className="zj-divider" />

        {/* Product Sections */}
        {SECTIONS.map((section, si) => (
          <div key={si}>
            <section className="zj-section">
              <div className="zj-section-header zj-animate">
                <h2 className="zj-section-title">{section.title}</h2>
                <Link href="/Pages/Products" className="zj-view-all">View All</Link>
              </div>
              <div className="zj-product-grid">
                {section.products.map((p, pi) => (
                  <div key={pi} className="zj-product-card zj-animate" style={{ transitionDelay: `${pi * 80}ms` }}>
                    <Link href={`/Pages/Products/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="zj-product-img-wrap">
                        <div className="zj-product-img-placeholder">💍</div>
                        <button className="zj-product-wishlist" onClick={e => { e.preventDefault(); e.stopPropagation(); }}>♡</button>
                      </div>
                      <div className="zj-product-name">{p.name}</div>
                      <div className="zj-product-price">{p.price}</div>
                      <div className="zj-product-swatches">
                        {p.swatches.map((s, i) => (
                          <span key={i} className="zj-swatch" style={{ background: s }} />
                        ))}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
            {si < SECTIONS.length - 1 && <hr className="zj-divider" />}
          </div>
        ))}

        {/* Custom Design CTA */}
        <div className="zj-cta-banner-wrap">
          <div className="zj-cta-banner">
            <div className="zj-cta-content zj-animate">
              <h2 className="zj-cta-title">Design Your Own Masterpiece</h2>
              <p className="zj-cta-subtitle">Bring your dream jewelry to life with our expert craftsmanship.</p>
              <Link href="/Pages/custom" className="zj-cta-btn-primary">Start Custom Design</Link>
            </div>
          </div>
        </div>

        {/* Gifts Section */}
        <div className="zj-gifts-outer">
          <section className="zj-gifts-section">
            <div className="zj-gifts-content zj-animate">
              <h2 className="zj-gifts-title">Gifts of the season</h2>
              <p className="zj-gifts-text">
                Discover our carefully curated selection of gifts perfect for every occasion. From delicate everyday pieces to statement jewellery for special moments, find the ideal gift for that someone special.
              </p>
              <Link href="/Pages/Products" className="zj-gifts-btn">Shop Gifts</Link>
            </div>
            <div className="zj-gifts-image zj-animate">
              <img src="/Home Page/Gift Of The Season/Rectangle 37.png" alt="Gifts" className="zj-gifts-img" />
            </div>
          </section>
        </div>

        {/* Testimonials */}
        <section className="zj-testimonials-section">
          <div className="zj-testimonials-inner">
            <div className="zj-section-header zj-animate" style={{ justifyContent: 'center' }}>
              <h2 className="zj-section-title" style={{ 
                fontSize: '38px', 
                fontWeight: '800', 
                textTransform: 'uppercase',
                textAlign: 'center',
                width: '100%'
              }}>
                Loved by Our Customers
              </h2>
            </div>
            <div className="zj-testimonials-carousel">
              <div className="zj-testimonials-track">
                {TESTIMONIALS.map((t, i) => (
                  <div key={i} className="zj-testimonial-card zj-animate" style={{ transitionDelay: `${i * 100}ms` }}>
                    <div className="zj-testimonial-stars">{'★'.repeat(t.rating)}</div>
                    <div className="zj-testimonial-header">
                      <span className="zj-testimonial-name">{t.name}</span>
                      <span className="zj-testimonial-verified-badge">✓</span>
                    </div>
                    <p className="zj-testimonial-text">"{t.text}"</p>
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
              <img src={BLOGS[0].image} alt={BLOGS[0].title} className="zj-blog-featured-img" />
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
                  <img src={b.image} alt={b.title} className="zj-blog-card-img" />
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