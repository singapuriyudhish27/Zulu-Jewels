'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { 
  Award, 
  ShieldCheck, 
  Heart, 
  Truck, 
  Sparkles, 
  Compass, 
  Eye, 
  PenTool, 
  Layers, 
  CheckCircle, 
  ArrowRight, 
  Gem, 
  Mail, 
  MapPin
} from 'lucide-react';

export default function AboutPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('ab-visible');
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.ab-animate').forEach(el => {
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@200;300;400;500;600;700&display=swap');

        /* Theme Styles */
        .ab-page {
          font-family: 'Montserrat', sans-serif;
          background: #ffffff;
          padding-top: 0px;
          color: #1a1a1a;
        }

        .ab-serif {
          font-family: 'Cormorant Garamond', serif;
        }

        .ab-gold-text {
          color: #CEA268;
        }

        /* Hero Section */
        .ab-hero {
          position: relative;
          min-height: 85vh;
          background: #000000 url('/About Page/Header/Frame 37391.png') no-repeat center center;
          background-size: cover;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .ab-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.7) 100%);
        }

        .ab-hero-content {
          position: relative;
          z-index: 10;
          padding: 40px 24px;
          max-width: 900px;
          margin-bottom: 60px;
        }

        .ab-hero-eyebrow {
          font-size: 11px;
          letter-spacing: 0.3em;
          color: #CEA268;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 24px;
          display: block;
        }

        .ab-hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(38px, 6vw, 68px);
          color: #ffffff;
          font-weight: 300;
          line-height: 1.15;
          margin-bottom: 28px;
        }

        .ab-hero-subtitle {
          font-size: 16px;
          color: rgba(255,255,255,0.8);
          line-height: 1.8;
          font-weight: 300;
          max-width: 680px;
          margin: 0 auto;
        }

        /* Hero Trust Badges */
        .ab-hero-badges-wrapper {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(17, 17, 17, 0.85);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 12;
        }

        .ab-hero-badges {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          padding: 24px 16px;
          gap: 20px;
        }

        .ab-hero-badge-item {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #ffffff;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }

        .ab-hero-badge-item:last-child {
          border-right: none;
        }

        .ab-hero-badge-icon {
          color: #CEA268;
          flex-shrink: 0;
        }

        .ab-hero-badge-text {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* Section Commons */
        .ab-sec-padding {
          padding: 100px 24px;
        }

        .ab-bg-neutral {
          background-color: #FAF8F6;
        }

        .ab-sec-header {
          text-align: center;
          max-width: 700px;
          margin: 0 auto 64px;
        }

        .ab-sec-eyebrow {
          font-size: 10px;
          letter-spacing: 0.25em;
          color: #CEA268;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 16px;
          display: block;
        }

        .ab-sec-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(32px, 4vw, 46px);
          color: #111111;
          font-weight: 400;
          line-height: 1.25;
        }

        .ab-sec-subtitle {
          font-size: 14px;
          color: #666666;
          line-height: 1.75;
          margin-top: 16px;
        }

        /* Founder Story */
        .ab-founder-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 80px;
          align-items: center;
        }

        .ab-founder-content {
          display: flex;
          flex-direction: column;
        }

        .ab-founder-story-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 40px;
          color: #111111;
          font-weight: 400;
          margin-bottom: 24px;
          line-height: 1.2;
        }

        .ab-founder-text {
          font-size: 15px;
          color: #444444;
          line-height: 1.9;
          margin-bottom: 24px;
          font-weight: 300;
        }

        .ab-founder-quote {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-style: italic;
          color: #CEA268;
          border-left: 2px solid #CEA268;
          padding-left: 20px;
          margin: 28px 0;
          line-height: 1.5;
        }

        .ab-founder-signature {
          margin-top: 16px;
        }

        .ab-founder-name {
          font-size: 14px;
          font-weight: 700;
          color: #111111;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .ab-founder-title {
          font-size: 12px;
          color: #777777;
          margin-top: 4px;
        }

        .ab-founder-image-wrapper {
          position: relative;
          padding: 16px;
          border: 1px solid rgba(206, 162, 104, 0.3);
        }

        .ab-founder-image {
          width: 100%;
          height: auto;
          aspect-ratio: 4/5;
          object-fit: cover;
          display: block;
        }

        /* Timeline Journey */
        .ab-timeline-container {
          max-width: 1000px;
          margin: 0 auto;
          position: relative;
        }

        .ab-timeline-container::before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 1px;
          background: rgba(206, 162, 104, 0.3);
          transform: translateX(-50%);
        }

        .ab-timeline-item {
          display: flex;
          justify-content: flex-end;
          padding-left: 30px;
          margin-bottom: 60px;
          position: relative;
          width: 50%;
        }

        .ab-timeline-item:nth-child(even) {
          align-self: flex-end;
          justify-content: flex-start;
          padding-left: 0;
          padding-right: 30px;
          margin-left: 50%;
        }

        .ab-timeline-dot {
          position: absolute;
          top: 10px;
          right: -6px;
          width: 12px;
          height: 12px;
          background: #ffffff;
          border: 2px solid #CEA268;
          border-radius: 50%;
          z-index: 10;
        }

        .ab-timeline-item:nth-child(even) .ab-timeline-dot {
          left: -6px;
          right: auto;
        }

        .ab-timeline-content {
          background: #ffffff;
          padding: 32px;
          border-radius: 0px;
          border: 1px solid rgba(238, 237, 233, 0.8);
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          max-width: 420px;
          transition: transform 0.3s ease, border-color 0.3s ease;
        }

        .ab-timeline-content:hover {
          transform: translateY(-5px);
          border-color: rgba(206, 162, 104, 0.4);
        }

        .ab-timeline-year {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          color: #CEA268;
          font-weight: 600;
          margin-bottom: 12px;
          display: block;
        }

        .ab-timeline-title {
          font-size: 13px;
          font-weight: 700;
          color: #111111;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 12px;
        }

        .ab-timeline-desc {
          font-size: 13px;
          color: #666666;
          line-height: 1.7;
          font-weight: 300;
        }

        /* Craftsmanship Process */
        .ab-craft-grid {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px 24px;
        }

        .ab-craft-card {
          background: #ffffff;
          padding: 32px 24px;
          border: 1px solid rgba(238, 237, 233, 0.8);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          transition: all 0.3s ease;
        }

        .ab-craft-card:hover {
          border-color: rgba(206, 162, 104, 0.4);
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          transform: translateY(-3px);
        }

        .ab-craft-step-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 38px;
          font-weight: 300;
          color: rgba(206, 162, 104, 0.3);
          line-height: 1;
          margin-bottom: 20px;
        }

        .ab-craft-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #FAF8F6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #CEA268;
          margin-bottom: 24px;
        }

        .ab-craft-card-title {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #111111;
          margin-bottom: 12px;
        }

        .ab-craft-card-desc {
          font-size: 13px;
          color: #666666;
          line-height: 1.65;
          font-weight: 300;
        }

        /* Explore Collections Grid */
        .ab-col-grid {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }

        .ab-col-card {
          position: relative;
          aspect-ratio: 4/5;
          overflow: hidden;
          background: #000;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 40px;
        }

        .ab-col-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.75;
          transition: transform 0.8s ease, opacity 0.8s ease;
        }

        .ab-col-card:hover .ab-col-img {
          transform: scale(1.05);
          opacity: 0.65;
        }

        .ab-col-overlay {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .ab-col-card-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px;
          color: #ffffff;
          font-weight: 400;
          margin-bottom: 16px;
        }

        .ab-col-link {
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

        .ab-col-link:hover {
          color: #CEA268;
          border-color: #CEA268;
        }

        /* Certified Luxury Cards */
        .ab-cert-grid {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
        }

        .ab-cert-card {
          background: #ffffff;
          border: 1px solid rgba(238, 237, 233, 0.9);
          padding: 36px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: all 0.3s ease;
        }

        .ab-cert-card:hover {
          border-color: rgba(206, 162, 104, 0.4);
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
        }

        .ab-cert-badge-icon {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: #FAF8F6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #CEA268;
          margin-bottom: 24px;
          font-size: 18px;
          font-weight: 700;
          border: 1px dashed rgba(206, 162, 104, 0.4);
        }

        .ab-cert-title {
          font-size: 13px;
          font-weight: 700;
          color: #111111;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .ab-cert-desc {
          font-size: 11px;
          color: #777777;
          line-height: 1.6;
          font-weight: 300;
        }

        /* Brand Statistics */
        .ab-stats-bar {
          background: #111111;
          color: #ffffff;
          padding: 72px 24px;
          border-top: 1px solid rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .ab-stats-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 40px;
          text-align: center;
        }

        .ab-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .ab-stat-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(38px, 5vw, 54px);
          font-weight: 300;
          color: #CEA268;
          line-height: 1;
          margin-bottom: 12px;
        }

        .ab-stat-label {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.7);
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        /* Custom Jewelry Experience */
        .ab-custom-row {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        .ab-custom-img-wrapper {
          border: 1px solid rgba(206, 162, 104, 0.2);
          padding: 16px;
        }

        .ab-custom-img {
          width: 100%;
          height: auto;
          aspect-ratio: 4/3;
          object-fit: cover;
          display: block;
        }

        .ab-custom-timeline {
          margin-top: 36px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .ab-custom-step {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .ab-custom-step-bullet {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #FAF8F6;
          border: 1px solid #CEA268;
          color: #CEA268;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .ab-custom-step-info {
          display: flex;
          flex-direction: column;
        }

        .ab-custom-step-title {
          font-size: 13px;
          font-weight: 700;
          color: #111111;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
        }

        .ab-custom-step-desc {
          font-size: 13px;
          color: #666666;
          line-height: 1.5;
        }

        .ab-gold-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #CEA268;
          color: #ffffff;
          border: 1px solid #CEA268;
          padding: 16px 36px;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          z-index: 1;
          transition: color 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s, transform 0.3s, box-shadow 0.3s;
          margin-top: 36px;
          align-self: flex-start;
        }
        .ab-gold-btn::before {
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
        .ab-gold-btn:hover {
          color: #CEA268;
          border-color: #CEA268;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(206, 162, 104, 0.15);
        }
        .ab-gold-btn:hover::before {
          transform: scaleX(1);
          transform-origin: left;
        }

        /* Customer Stories Case Studies */
        .ab-stories-grid {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }

        .ab-story-card {
          background: #FAF8F6;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border: 1px solid rgba(238, 237, 233, 0.8);
          position: relative;
        }

        .ab-story-quotes-icon {
          position: absolute;
          top: 30px;
          right: 40px;
          font-size: 60px;
          color: rgba(206, 162, 104, 0.12);
          font-family: 'Cormorant Garamond', serif;
          line-height: 1;
        }

        .ab-story-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 10px;
          font-weight: 600;
          color: #CEA268;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 20px;
        }

        .ab-story-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-style: italic;
          color: #222222;
          line-height: 1.6;
          margin-bottom: 32px;
          position: relative;
          z-index: 2;
        }

        .ab-story-author {
          border-top: 1px solid rgba(238,237,233,1);
          padding-top: 20px;
        }

        .ab-story-author-name {
          font-size: 12px;
          font-weight: 700;
          color: #111111;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .ab-story-location {
          font-size: 11px;
          color: #777777;
          margin-top: 4px;
        }

        /* Final Luxury CTA */
        .ab-final-cta {
          background: #111111;
          color: #ffffff;
          padding: 120px 24px;
          text-align: center;
          position: relative;
        }

        .ab-final-cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, rgba(206, 162, 104, 0.05) 0%, rgba(0,0,0,0) 80%);
        }

        .ab-final-cta-content {
          position: relative;
          z-index: 5;
          max-width: 800px;
          margin: 0 auto;
        }

        .ab-final-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(38px, 5vw, 54px);
          color: #ffffff;
          font-weight: 300;
          margin-bottom: 24px;
          line-height: 1.2;
        }

        .ab-final-desc {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.8;
          margin-bottom: 48px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          font-weight: 300;
        }

        .ab-final-buttons {
          display: flex;
          justify-content: center;
          gap: 20px;
        }

        .ab-btn-filled {
          background: #CEA268;
          color: #ffffff;
          border: 1px solid #CEA268;
          padding: 16px 40px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          z-index: 1;
          transition: color 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s, transform 0.3s;
        }
        .ab-btn-filled::before {
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
        .ab-btn-filled:hover {
          color: #CEA268;
          border-color: #CEA268;
          transform: translateY(-2px);
        }
        .ab-btn-filled:hover::before {
          transform: scaleX(1);
          transform-origin: left;
        }

        .ab-btn-outline {
          background: transparent;
          color: #ffffff;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 16px 40px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          z-index: 1;
          transition: color 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s, transform 0.3s;
        }
        .ab-btn-outline::before {
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
        .ab-btn-outline:hover {
          color: #111111;
          border-color: #ffffff;
          transform: translateY(-2px);
        }
        .ab-btn-outline:hover::before {
          transform: scaleX(1);
          transform-origin: left;
        }

        /* Responsiveness adjustments */
        @media (max-width: 1024px) {
          .ab-craft-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .ab-col-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .ab-cert-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 900px) {
          .ab-founder-grid {
            grid-template-columns: 1fr;
            gap: 48px;
          }
          .ab-founder-image-wrapper {
            max-width: 500px;
            margin: 0 auto;
            width: 100%;
          }
          .ab-custom-row {
            grid-template-columns: 1fr;
            gap: 48px;
          }
          .ab-hero-badges {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px 0;
          }
          .ab-hero-badge-item {
            border-right: none;
          }
          .ab-hero-badge-item:nth-child(odd) {
            border-right: 1px solid rgba(255, 255, 255, 0.1);
          }
        }

        @media (max-width: 768px) {
          .ab-timeline-container::before {
            left: 20px;
          }
          .ab-timeline-item {
            width: 100%;
            padding-left: 50px;
            padding-right: 0 !important;
            margin-left: 0 !important;
          }
          .ab-timeline-dot {
            left: 14px !important;
            right: auto !important;
          }
          .ab-timeline-content {
            max-width: 100%;
          }
          .ab-col-grid {
            grid-template-columns: 1fr;
          }
          .ab-cert-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .ab-stats-inner {
            grid-template-columns: repeat(2, 1fr);
            gap: 32px;
          }
          .ab-stories-grid {
            grid-template-columns: 1fr;
          }
          .ab-sec-padding {
            padding: 72px 16px;
          }
        }

        @media (max-width: 480px) {
          .ab-hero-badges {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .ab-hero-badge-item {
            border-right: none !important;
            justify-content: flex-start;
            padding-left: 20px;
          }
          .ab-cert-grid {
            grid-template-columns: 1fr;
          }
          .ab-stats-inner {
            grid-template-columns: 1fr;
          }
          .ab-final-buttons {
            flex-direction: column;
            gap: 12px;
          }
        }

        /* Cinematic Video Section */
        .ab-video-section {
          position: relative;
          padding: 0;
          overflow: hidden;
          background: #000000;
        }
        .ab-video-container {
          position: relative;
          width: 100%;
          min-height: 75vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 120px 24px;
        }
        .ab-video-bg-wrap {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }
        .ab-video-element {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .ab-video-overlay-tint {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.75) 100%);
          z-index: 2;
        }
        .ab-video-content-wrap {
          position: relative;
          z-index: 5;
          max-width: 800px;
          text-align: center;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .ab-video-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          padding: 8px 16px;
          font-family: 'Montserrat', sans-serif;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #CEA268;
          margin-bottom: 24px;
        }
        .ab-video-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 5vw, 54px);
          font-weight: 300;
          color: #ffffff;
          line-height: 1.25;
          margin-bottom: 24px;
        }
        .ab-video-desc {
          font-size: 15px;
          color: rgba(255,255,255,0.85);
          line-height: 1.85;
          max-width: 640px;
          margin: 0;
          font-weight: 300;
        }

        /* Scroll Reveal & Image Parallax */
        .ab-animate {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, opacity;
        }
        .ab-animate.ab-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .ab-animate-img {
          transition: transform 1.8s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .ab-animate:not(.ab-visible) .ab-animate-img {
          transform: scale(1.1) !important;
        }

        /* Hero Text Animations on Mount */
        .ab-hero-eyebrow {
          opacity: 0;
          transform: translateY(20px);
          animation: ab-hero-fade-in 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.2s;
        }
        .ab-hero-title {
          opacity: 0;
          transform: translateY(30px);
          animation: ab-hero-title-in 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.4s;
        }
        .ab-hero-subtitle {
          opacity: 0;
          transform: translateY(30px);
          animation: ab-hero-fade-in 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.6s;
        }
        .ab-hero-badge-item {
          opacity: 0;
          transform: translateY(20px);
          animation: ab-hero-fade-in 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .ab-hero-badge-item:nth-child(1) { animation-delay: 0.8s; }
        .ab-hero-badge-item:nth-child(2) { animation-delay: 0.9s; }
        .ab-hero-badge-item:nth-child(3) { animation-delay: 1.0s; }
        .ab-hero-badge-item:nth-child(4) { animation-delay: 1.1s; }

        @keyframes ab-hero-fade-in {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes ab-hero-title-in {
          from {
            opacity: 0;
            transform: translateY(30px);
            letter-spacing: 0.05em;
          }
          to {
            opacity: 1;
            transform: translateY(0);
            letter-spacing: 0em;
          }
        }
      ` }} />

      <Navbar />

      <main className="ab-page">
        {/* SECTION 1: Hero Banner */}
        <section className="ab-hero">
          <div className="ab-hero-content">
            <span className="ab-hero-eyebrow">Zulu Jewellers</span>
            <h1 className="ab-hero-title">Where Heritage Meets Modern Brilliance</h1>
            <p className="ab-hero-subtitle">
              Crafting fine jewellery that honors the richness of traditional Indian artistry while speaking the clean, architectural language of global design.
            </p>
          </div>
          <div className="ab-hero-badges-wrapper">
            <div className="ab-hero-badges">
              <div className="ab-hero-badge-item">
                <Award size={18} className="ab-hero-badge-icon" />
                <span className="ab-hero-badge-text">Certified Diamonds</span>
              </div>
              <div className="ab-hero-badge-item">
                <ShieldCheck size={18} className="ab-hero-badge-icon" />
                <span className="ab-hero-badge-text">BIS Hallmarked Gold</span>
              </div>
              <div className="ab-hero-badge-item">
                <Compass size={18} className="ab-hero-badge-icon" />
                <span className="ab-hero-badge-text">Bespoke Design</span>
              </div>
              <div className="ab-hero-badge-item">
                <Truck size={18} className="ab-hero-badge-icon" />
                <span className="ab-hero-badge-text">Worldwide Shipping</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Founder Story */}
        <section className="ab-sec-padding">
          <div className="ab-founder-grid">
            <div className="ab-founder-content ab-animate">
              <span className="ab-sec-eyebrow">Origins & Vision</span>
              <h2 className="ab-founder-story-title">Why ZULU Exists</h2>
              <p className="ab-founder-text">
                For generations, diamonds and fine jewelry were viewed either as rigid heirlooms locked away in vaults or as mass-produced commodities lacking soul. ZULU was born from a desire to break this mold.
              </p>
              <p className="ab-founder-text">
                Our vision is to bridge the exceptional weight of Indian artisanal heritage with the refined, minimalist styling required by modern global collectors. We curate natural stones and set them into pieces meant to be lived in, loved, and passed forward.
              </p>
              <div className="ab-founder-quote">
                &ldquo;Jewelry is the most intimate form of art we can wear. It should not merely reflect your status—it should tell your story.&rdquo;
              </div>
              <div className="ab-founder-signature">
                <div className="ab-founder-name">Yudhish Zulu</div>
                <div className="ab-founder-title">Founder & Lead Curator</div>
              </div>
            </div>
            <div className="ab-founder-image-wrapper ab-animate">
              <img 
                src="/About Page/founder_portrait.png" 
                alt="Yudhish Zulu - Founder of ZULU Jewellers" 
                className="ab-founder-image ab-animate-img" 
              />
            </div>
          </div>
        </section>

        {/* SECTION 3: Brand Journey Timeline */}
        <section className="ab-sec-padding ab-bg-neutral">
          <div className="ab-sec-header ab-animate">
            <span className="ab-sec-eyebrow">Our Milestones</span>
            <h2 className="ab-sec-title">The Journey of ZULU</h2>
            <p className="ab-sec-subtitle">
              A decade-long devotion to excellence, detail, and global trust.
            </p>
          </div>

          <div className="ab-timeline-container">
            <div className="ab-timeline-item ab-animate" style={{ transitionDelay: '0ms' }}>
              <div className="ab-timeline-dot"></div>
              <div className="ab-timeline-content">
                <span className="ab-timeline-year">2016</span>
                <h3 className="ab-timeline-title">The Genesis</h3>
                <p className="ab-timeline-desc">
                  Founded with a single design workbench in Surat, Gujarat, dedicating our early days to mastering setting techniques and diamond sorting.
                </p>
              </div>
            </div>

            <div className="ab-timeline-item ab-animate" style={{ transitionDelay: '100ms' }}>
              <div className="ab-timeline-dot"></div>
              <div className="ab-timeline-content">
                <span className="ab-timeline-year">2018</span>
                <h3 className="ab-timeline-title">The Solitaire Launch</h3>
                <p className="ab-timeline-desc">
                  Unveiled our signature solitaire bridal line, setting a new benchmark by sourcing exclusively conflict-free, GIA-certified diamonds.
                </p>
              </div>
            </div>

            <div className="ab-timeline-item ab-animate" style={{ transitionDelay: '200ms' }}>
              <div className="ab-timeline-dot"></div>
              <div className="ab-timeline-content">
                <span className="ab-timeline-year">2020</span>
                <h3 className="ab-timeline-title">Bespoke Digitization</h3>
                <p className="ab-timeline-desc">
                  Pioneered virtual design suites, integrating photorealistic CAD modeling and remote consultations for custom-built jewelry.
                </p>
              </div>
            </div>

            <div className="ab-timeline-item ab-animate" style={{ transitionDelay: '300ms' }}>
              <div className="ab-timeline-dot"></div>
              <div className="ab-timeline-content">
                <span className="ab-timeline-year">2022</span>
                <h3 className="ab-timeline-title">Global Expansion</h3>
                <p className="ab-timeline-desc">
                  Opened international distribution channels, shipping fully secured and insured pieces to collectors in New York, London, and Dubai.
                </p>
              </div>
            </div>

            <div className="ab-timeline-item ab-animate" style={{ transitionDelay: '400ms' }}>
              <div className="ab-timeline-dot"></div>
              <div className="ab-timeline-content">
                <span className="ab-timeline-year">2026 & Beyond</span>
                <h3 className="ab-timeline-title">Future Vision</h3>
                <p className="ab-timeline-desc">
                  Committing to fully circular precious metal sourcing and scaling our carbon-neutral artisan workshops to preserve traditional bench skills.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* NEW SECTION: The Art of Craftsmanship Cinematic Video */}
        <section className="ab-video-section zj-animate">
          <div className="ab-video-container">
            <div className="ab-video-bg-wrap">
              <video 
                className="ab-video-element"
                autoPlay 
                loop 
                muted 
                playsInline
                controls={false}
                poster="/About Page/Craftmentship Video.png"
              >
                <source src="/About Page/Craftmentship Video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </section>

        {/* SECTION 4: Craftsmanship Process */}
        <section className="ab-sec-padding">
          <div className="ab-sec-header ab-animate">
            <span className="ab-sec-eyebrow">Artistry in Motion</span>
            <h2 className="ab-sec-title">From Concept to Masterpiece</h2>
            <p className="ab-sec-subtitle">
              Every creation undergoes seven distinct stages of rigorous detail to justify heirloom-level pricing and structure.
            </p>
          </div>

          <div className="ab-craft-grid">
            <div className="ab-craft-card ab-animate" style={{ transitionDelay: '0ms' }}>
              <span className="ab-craft-step-num">01</span>
              <div className="ab-craft-icon-wrapper">
                <Compass size={20} />
              </div>
              <h3 className="ab-craft-card-title">Consultation</h3>
              <p className="ab-craft-card-desc">
                Establishing design goals, metal parameters, and initial diamond or gemstone criteria with our lead team.
              </p>
            </div>

            <div className="ab-craft-card ab-animate" style={{ transitionDelay: '100ms' }}>
              <span className="ab-craft-step-num">02</span>
              <div className="ab-craft-icon-wrapper">
                <PenTool size={20} />
              </div>
              <h3 className="ab-craft-card-title">Sketching</h3>
              <p className="ab-craft-card-desc">
                Artistic hand-rendered sketches drawn to align design proportions, visual weight, and stone orientations.
              </p>
            </div>

            <div className="ab-craft-card ab-animate" style={{ transitionDelay: '200ms' }}>
              <span className="ab-craft-step-num">03</span>
              <div className="ab-craft-icon-wrapper">
                <Layers size={20} />
              </div>
              <h3 className="ab-craft-card-title">CAD Sculpting</h3>
              <p className="ab-craft-card-desc">
                Building detailed 3D digital matrix wireframes to verify weight calculations and ensure structural balance.
              </p>
            </div>

            <div className="ab-craft-card ab-animate" style={{ transitionDelay: '300ms' }}>
              <span className="ab-craft-step-num">04</span>
              <div className="ab-craft-icon-wrapper">
                <Gem size={20} />
              </div>
              <h3 className="ab-craft-card-title">Stone Selection</h3>
              <p className="ab-craft-card-desc">
                Selecting high-brilliance solitaires, examining crown facets, angles, and light output under magnification.
              </p>
            </div>

            <div className="ab-craft-card ab-animate" style={{ transitionDelay: '400ms' }}>
              <span className="ab-craft-step-num">05</span>
              <div className="ab-craft-icon-wrapper">
                <Sparkles size={20} />
              </div>
              <h3 className="ab-craft-card-title">Handcrafting</h3>
              <p className="ab-craft-card-desc">
                Lost-wax casting, manual assembly, metal welding, and precision diamond micro-pave setting by bench artisans.
              </p>
            </div>

            <div className="ab-craft-card ab-animate" style={{ transitionDelay: '500ms' }}>
              <span className="ab-craft-step-num">06</span>
              <div className="ab-craft-icon-wrapper">
                <CheckCircle size={20} />
              </div>
              <h3 className="ab-craft-card-title">Inspection</h3>
              <p className="ab-craft-card-desc">
                Multi-point quality evaluations for prong stability, symmetry, surface polish, and gold hallmarking.
              </p>
            </div>

            <div className="ab-craft-card ab-animate" style={{ transitionDelay: '600ms' }}>
              <span className="ab-craft-step-num">07</span>
              <div className="ab-craft-icon-wrapper">
                <Truck size={20} />
              </div>
              <h3 className="ab-craft-card-title">Delivery</h3>
              <p className="ab-craft-card-desc">
                Insured white-glove courier dispatch, packaged inside premium lacquered velvet presentation boxes.
              </p>
            </div>

            <div className="ab-craft-card ab-animate" style={{ background: '#FAF8F6', borderColor: '#CEA268', transitionDelay: '700ms' }}>
              <span className="ab-craft-step-num" style={{ color: '#CEA268' }}>★</span>
              <div className="ab-craft-icon-wrapper" style={{ background: '#CEA268', color: '#fff' }}>
                <Award size={20} />
              </div>
              <h3 className="ab-craft-card-title">Guarantee</h3>
              <p className="ab-craft-card-desc">
                Every purchase includes certified certificates, valuation documents, and lifetime structural maintenance.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5: Explore Our Collections */}
        <section className="ab-sec-padding ab-bg-neutral">
          <div className="ab-sec-header ab-animate">
            <span className="ab-sec-eyebrow">The ZULU Curation</span>
            <h2 className="ab-sec-title">Explore Our Collections</h2>
            <p className="ab-sec-subtitle">
              Sleek contours, brilliant gemstones, and structural integrity made for life's celebrated milestones.
            </p>
          </div>

          <div className="ab-col-grid">
            <div className="ab-col-card ab-animate" style={{ transitionDelay: '0ms' }}>
              <img src="/Home Page/Most Loved Pieces/Frame 122.png" alt="Luxury Rings" className="ab-col-img ab-animate-img" />
              <div className="ab-col-overlay">
                <h3 className="ab-col-card-title">Rings</h3>
                <Link href="/Pages/Products?category=rings" className="ab-col-link">
                  Discover Rings <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            <div className="ab-col-card ab-animate" style={{ transitionDelay: '100ms' }}>
              <img src="/Home Page/Most Loved Pieces/Frame 123.png" alt="Elegant Earrings" className="ab-col-img ab-animate-img" />
              <div className="ab-col-overlay">
                <h3 className="ab-col-card-title">Earrings</h3>
                <Link href="/Pages/Products?category=earrings" className="ab-col-link">
                  Discover Earrings <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            <div className="ab-col-card ab-animate" style={{ transitionDelay: '200ms' }}>
              <img src="/Home Page/Most Loved Pieces/Frame 124.png" alt="Fine Pendants" className="ab-col-img ab-animate-img" />
              <div className="ab-col-overlay">
                <h3 className="ab-col-card-title">Pendants</h3>
                <Link href="/Pages/Products?category=pendants" className="ab-col-link">
                  Discover Pendants <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            <div className="ab-col-card ab-animate" style={{ transitionDelay: '300ms' }}>
              <img src="/Home Page/Most Loved Pieces/Frame 125.png" alt="Signature Bracelets" className="ab-col-img ab-animate-img" />
              <div className="ab-col-overlay">
                <h3 className="ab-col-card-title">Bracelets</h3>
                <Link href="/Pages/Products?category=bracelets" className="ab-col-link">
                  Discover Bracelets <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            <div className="ab-col-card ab-animate" style={{ transitionDelay: '400ms' }}>
              <img src="/Home Page/Gift Of The Season/Rectangle 37.png" alt="Ornate Bangles" className="ab-col-img ab-animate-img" />
              <div className="ab-col-overlay">
                <h3 className="ab-col-card-title">Bangles</h3>
                <Link href="/Pages/Products?category=bangles" className="ab-col-link">
                  Discover Bangles <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            <div className="ab-col-card ab-animate" style={{ transitionDelay: '500ms' }}>
              <img src="/About Page/Expert/Rectangle 37.png" alt="Wedding Collection" className="ab-col-img ab-animate-img" />
              <div className="ab-col-overlay">
                <h3 className="ab-col-card-title">Wedding Set</h3>
                <Link href="/Pages/Products?category=wedding" className="ab-col-link">
                  Discover Bridal <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: Certified Luxury */}
        <section className="ab-sec-padding">
          <div className="ab-sec-header ab-animate">
            <span className="ab-sec-eyebrow">Trust & Transparency</span>
            <h2 className="ab-sec-title">Certified Luxury You Can Trust</h2>
            <p className="ab-sec-subtitle">
              Every diamond, ounce of gold, and setting holds internationally recognized validations for quality and authenticity.
            </p>
          </div>

          <div className="ab-cert-grid">
            <div className="ab-cert-card ab-animate" style={{ transitionDelay: '0ms' }}>
              <div className="ab-cert-badge-icon">GIA</div>
              <h3 className="ab-cert-title">GIA Grading</h3>
              <p className="ab-cert-desc">
                Gemological Institute of America grading for color, cut, clarity, and carat weight.
              </p>
            </div>

            <div className="ab-cert-card ab-animate" style={{ transitionDelay: '100ms' }}>
              <div className="ab-cert-badge-icon">IGI</div>
              <h3 className="ab-cert-title">IGI Solitaire</h3>
              <p className="ab-cert-desc">
                International Gemological Institute evaluation ensuring natural diamonds and settings.
              </p>
            </div>

            <div className="ab-cert-card ab-animate" style={{ transitionDelay: '200ms' }}>
              <div className="ab-cert-badge-icon">BIS</div>
              <h3 className="ab-cert-title">BIS Hallmark</h3>
              <p className="ab-cert-desc">
                Bureau of Indian Standards gold hallmarking certifying 18k and 22k gold purity.
              </p>
            </div>

            <div className="ab-cert-card ab-animate" style={{ transitionDelay: '300ms' }}>
              <div className="ab-cert-badge-icon">SGL</div>
              <h3 className="ab-cert-title">SGL Verified</h3>
              <p className="ab-cert-desc">
                Solitaire Gemological Laboratories card validation for gemstone authenticity.
              </p>
            </div>

            <div className="ab-cert-card ab-animate" style={{ transitionDelay: '400ms' }}>
              <div className="ab-cert-badge-icon">ISO</div>
              <h3 className="ab-cert-title">ISO 9001</h3>
              <p className="ab-cert-desc">
                Certified quality management standards guaranteeing consistent craftsmanship standards.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 7: Brand Statistics */}
        <section className="ab-stats-bar">
          <div className="ab-stats-inner">
            <div className="ab-stat-item ab-animate" style={{ transitionDelay: '0ms' }}>
              <span className="ab-stat-num">500+</span>
              <span className="ab-stat-label">Bespoke Creations</span>
            </div>
            <div className="ab-stat-item ab-animate" style={{ transitionDelay: '100ms' }}>
              <span className="ab-stat-num">1000+</span>
              <span className="ab-stat-label">Certified Solitaires</span>
            </div>
            <div className="ab-stat-item ab-animate" style={{ transitionDelay: '200ms' }}>
              <span className="ab-stat-num">20+</span>
              <span className="ab-stat-label">Cities Serviced</span>
            </div>
            <div className="ab-stat-item ab-animate" style={{ transitionDelay: '300ms' }}>
              <span className="ab-stat-num">98%</span>
              <span className="ab-stat-label">Client Trust Score</span>
            </div>
          </div>
        </section>

        {/* SECTION 8: Custom Jewelry Experience */}
        <section className="ab-sec-padding">
          <div className="ab-custom-row">
            <div className="ab-custom-img-wrapper ab-animate">
              <img 
                src="/Home Page/Custom Design Template/Frame 91.png" 
                alt="Custom Jewelry Design Process" 
                className="ab-custom-img ab-animate-img" 
              />
            </div>
            <div className="ab-founder-content ab-animate">
              <span className="ab-sec-eyebrow">Bespoke Concierge</span>
              <h2 className="ab-founder-story-title">Design Jewelry as Unique as Your Story</h2>
              <p className="ab-founder-text">
                Why settle for standard designs when you can co-create a completely original jewelry legacy? Our master design team guides you step-by-step to realize your vision.
              </p>
              
              <div className="ab-custom-timeline">
                <div className="ab-custom-step ab-animate" style={{ transitionDelay: '100ms' }}>
                  <div className="ab-custom-step-bullet">1</div>
                  <div className="ab-custom-step-info">
                    <span className="ab-custom-step-title">Share Your Inspiration</span>
                    <span className="ab-custom-step-desc">Provide reference photos, rough sketches, or design ideas.</span>
                  </div>
                </div>

                <div className="ab-custom-step ab-animate" style={{ transitionDelay: '200ms' }}>
                  <div className="ab-custom-step-bullet">2</div>
                  <div className="ab-custom-step-info">
                    <span className="ab-custom-step-title">Concierge Consultation</span>
                    <span className="ab-custom-step-desc">Work 1-on-1 with our gemologists to select certified center stones.</span>
                  </div>
                </div>

                <div className="ab-custom-step ab-animate" style={{ transitionDelay: '300ms' }}>
                  <div className="ab-custom-step-bullet">3</div>
                  <div className="ab-custom-step-info">
                    <span className="ab-custom-step-title">Photorealistic 3D Review</span>
                    <span className="ab-custom-step-desc">Inspect exact 3D digital CAD renders of your design before setting.</span>
                  </div>
                </div>

                <div className="ab-custom-step ab-animate" style={{ transitionDelay: '400ms' }}>
                  <div className="ab-custom-step-bullet">4</div>
                  <div className="ab-custom-step-info">
                    <span className="ab-custom-step-title">Artisan Handcrafting</span>
                    <span className="ab-custom-step-desc">Our bench specialists cast, assemble, and set your diamond with lifetime care.</span>
                  </div>
                </div>
              </div>

              <Link href="/Pages/custom" className="ab-gold-btn">
                Start Your Custom Design
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 9: Customer Stories */}
        <section className="ab-sec-padding ab-bg-neutral">
          <div className="ab-sec-header ab-animate">
            <span className="ab-sec-eyebrow">Client Journals</span>
            <h2 className="ab-sec-title">Bespoke Stories</h2>
            <p className="ab-sec-subtitle">
              Heirlooms co-created with ZULU that capture life's most singular milestones.
            </p>
          </div>

          <div className="ab-stories-grid">
            <div className="ab-story-card ab-animate" style={{ transitionDelay: '0ms' }}>
              <span className="ab-story-quotes-icon">&ldquo;</span>
              <div>
                <div className="ab-story-meta">
                  <span>Engagement Ring</span>
                  <span>·</span>
                  <span>New York, NY</span>
                </div>
                <p className="ab-story-text">
                  &ldquo;Building a 2.5 carat emerald-cut diamond ring remotely felt daunting. The ZULU team set up three virtual CAD sessions and guided me on table ratios and brilliance. The result is structural perfection.&rdquo;
                </p>
              </div>
              <div className="ab-story-author">
                <div className="ab-story-author-name">David K.</div>
                <div className="ab-story-location">Investment Banker</div>
              </div>
            </div>

            <div className="ab-story-card ab-animate" style={{ transitionDelay: '100ms' }}>
              <span className="ab-story-quotes-icon">&ldquo;</span>
              <div>
                <div className="ab-story-meta">
                  <span>Bridal Set</span>
                  <span>·</span>
                  <span>London, UK</span>
                </div>
                <p className="ab-story-text">
                  &ldquo;For our wedding, we wanted platinum bands that referenced traditional filigree without feeling heavy. ZULU combined hand-drawn sketches with modern bezel settings. Our guests were mesmerized.&rdquo;
                </p>
              </div>
              <div className="ab-story-author">
                <div className="ab-story-author-name">Priya & Aarav</div>
                <div className="ab-story-location">Creative Directors</div>
              </div>
            </div>

            <div className="ab-story-card ab-animate" style={{ transitionDelay: '200ms' }}>
              <span className="ab-story-quotes-icon">&ldquo;</span>
              <div>
                <div className="ab-story-meta">
                  <span>Anniversary Pendant</span>
                  <span>·</span>
                  <span>Dubai, UAE</span>
                </div>
                <p className="ab-story-text">
                  &ldquo;Co-creating an anniversary piece was effortless. They sourced three certified natural pear-shaped diamonds of clean VS1 clarity. The setting is clean, floating, and beautifully reflects light.&rdquo;
                </p>
              </div>
              <div className="ab-story-author">
                <div className="ab-story-author-name">Yasmin M.</div>
                <div className="ab-story-location">Interior Designer</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 10: Final Luxury CTA */}
        <section className="ab-final-cta ab-animate">
          <div className="ab-final-cta-content">
            <span className="ab-sec-eyebrow">Begin Your Journey</span>
            <h2 className="ab-final-title">Your Story Deserves Exceptional Craftsmanship</h2>
            <p className="ab-final-desc">
              Explore our collection of hand-curated designs or connect directly with our gemologists to start co-creating your custom heirloom.
            </p>
            <div className="ab-final-buttons">
              <Link href="/Pages/Products" className="ab-btn-filled">
                Explore Collections
              </Link>
              <Link href="/Pages/custom" className="ab-btn-outline">
                Start Custom Design
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}