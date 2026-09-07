'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { 
  Sparkles, 
  Gem, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Award, 
  PenTool, 
  Layers, 
  Compass, 
  Clock, 
  Send,
  X
} from 'lucide-react';

const ConsultationDrawer = dynamic(() => import('@/components/consultation/ConsultationDrawer'), { ssr: false });

export default function BespokeJourneyPage() {
  const [activeStage, setActiveStage] = useState(1);
  const [openFaq, setOpenFaq] = useState(null);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  const stages = [
    {
      id: 1,
      number: "01",
      title: "The Consultation & Vision",
      subtitle: "I. The Art of Vision & Conception",
      image: "/Our Process/step_1.jpg",
      description: "Every heirloom begins with a private conversation. Whether sitting in our private lounge or connecting virtually across the globe, we listen to your narrative. Our principal designers translate your inspiration into initial hand-drawn charcoal sketches, capturing the emotional resonance of the piece.",
      highlights: ["Dedicated private client advisor", "Hand-drawn artistic drafts", "Stone selection consultations"]
    },
    {
      id: 2,
      number: "02",
      title: "Precision CAD Modeling",
      subtitle: "II. Virtual Sculpting & CAD Engineering",
      image: "/Our Process/step_2.jpg",
      description: "Once the design direction is chosen, our CAD masters translate the sketch into a micron-accurate three-dimensional digital model. This wireframe is shared with you as an interactive 360-degree render, allowing you to examine every angle, facet alignment, and structural dimension before raw metal is forged.",
      highlights: ["Micron-level architectural accuracy", "Interactive 360-degree digital renders", "Unlimited revisions during modeling"]
    },
    {
      id: 3,
      number: "03",
      title: "Goldsmithing & Forging",
      subtitle: "III. Metal Metallurgy & Goldsmithing",
      image: "/Our Process/step_3.jpg",
      description: "With your CAD approval, our master artisans begin the metallurgy process. We alloy high-purity recycled gold and platinum to match our custom champagne, warm rose, or brilliant white tones. The alloy is then cast and hand-pulled, hammered, and refined by senior goldsmiths who hold decades of experience.",
      highlights: ["Solid high-carat recycled metals", "Hand-hammered structural refinement", "Bespoke color alloy blending"]
    },
    {
      id: 4,
      number: "04",
      title: "Diamond Setting",
      subtitle: "IV. Diamond Curation & Micro-Pavé Setting",
      image: "/Our Process/step_4.jpg",
      description: "Every diamond set in a ZULU piece undergoes rigorous gemological screening. We source only GIA and IGI certified conflict-free solitaires. Our stone setters then perform microscopic claw setting, hand-sculpting the metal seats under 10x magnification to maximize light refraction and ensure absolute stability.",
      highlights: ["Certified conflict-free stones", "Claw-by-claw microscopic setting", "Maximized light scintillation alignment"]
    },
    {
      id: 5,
      number: "05",
      title: "Purity Certification",
      subtitle: "V. The Final Polish & Insured Handover",
      image: "/Our Process/step_5.jpg",
      description: "Before leaving the atelier, the finished piece is subjected to a triple-stage mirror polish and certified by third-party laboratories (BIS Hallmark, SGL, etc.). Your masterpiece is enveloped in our signature hand-stitched leather box and shipped worldwide via armored transit, fully insured until it touches your hands.",
      highlights: ["Triple-stage mirror finish", "Independent laboratory certifications", "Fully insured door-to-door armored transit"]
    }
  ];

  const atelierSteps = [
    {
      title: "The Sketch",
      category: "DESIGN",
      image: "/Our Process/step_6.jpg",
      desc: "Capturing the initial spark on high-grade archival drawing paper."
    },
    {
      title: "The Model",
      category: "PROTOTYPE",
      image: "/Our Process/step_7.jpg",
      desc: "Shaping precise wax wireframes to test proportions and weight."
    },
    {
      title: "The Setting",
      category: "GEMOLOGY",
      image: "/Our Process/step_8.jpg",
      desc: "Securing each brilliant cut diamond with custom-shaped prongs."
    },
    {
      title: "The Finish",
      category: "ARTISTRY",
      image: "/Our Process/step_9.jpg",
      desc: "Polishing every gold facet to achieve a flawless mirror shine."
    }
  ];

  const craftsmen = [
    {
      name: "Elena Rostova",
      role: "Head of Design / The Visionary",
      image: "/Our Process/step_10.jpg",
      story: "Trained in Paris and Milan, Elena blends classical European jewelry silhouettes with modern minimalist aesthetics. She oversees the conceptual phase of every commission."
    },
    {
      name: "Marcus Thorne",
      role: "Master Goldsmith / The Metal Sculptor",
      image: "/Our Process/step_11.jpg",
      story: "With over 35 years at the anvil, Marcus possesses an intuitive understanding of metal flow and tensile strength. He personally hand-forges the shanks of our masterworks."
    },
    {
      name: "Kenji Sato",
      role: "Atelier Setter / The Brilliance Expert",
      image: "/Our Process/step_12.jpg",
      story: "Kenji's expertise lies in micro-pavé setting. Working exclusively under high-power microscopes, he aligns hundreds of tiny diamonds to form seamless sheets of fire."
    },
    {
      name: "Devendra Nayak",
      role: "Chief Gemologist / The Purity Curator",
      image: "/about Page/founder_portrait.png",
      story: "Devendra travels to diamond cutting centers worldwide to hand-select solitaires. His strict criteria reject 98% of the stones he inspects, ensuring only the top 2% grace ZULU designs."
    }
  ];

  const timelineSteps = [
    { step: "01", label: "Consultation", desc: "Share your inspiration" },
    { step: "02", label: "Concept Sketch", desc: "Review initial artistry" },
    { step: "03", label: "3D CAD Approval", desc: "Inspect 360° renders" },
    { step: "04", label: "Atelier Crafting", desc: "Metallurgy & hand forging" },
    { step: "05", label: "GIA Certification", desc: "Authentic verification" },
    { step: "06", label: "Insured Delivery", desc: "Worldwide secure transit" }
  ];

  const certifications = [
    { name: "GIA", desc: "Gemological Institute of America - the gold standard in diamond grading reports.", icon: <Award size={28} /> },
    { name: "IGI", desc: "International Gemological Institute - global verification of gemstone clarity, color and cut.", icon: <ShieldCheck size={28} /> },
    { name: "BIS Hallmark", desc: "Government-approved gold purity certification stamping the official fineness mark.", icon: <Check size={28} /> },
    { name: "SGL", desc: "Solitaire Gemological Laboratories - precise independent grading for studded diamonds.", icon: <Layers size={28} /> },
    { name: "Ethical Origins", desc: "Guaranteed conflict-free stones sourced through strict adherence to the Kimberley Process.", icon: <Compass size={28} /> }
  ];

  const diaries = [
    {
      phase: "Phase 1: Conceptual Sketch",
      image: "/Our Process/creation_1.jpg",
      desc: "A hand-drawn charcoal draft focusing on an elongated oval diamond with custom side-stone proportions and a delicate gold gallery."
    },
    {
      phase: "Phase 2: Digital CAD Modeling",
      image: "/Our Process/creation_2.jpg",
      desc: "The precise 3-dimensional wireframe modeling that calculated metal weight (18k Yellow Gold) and micro-claw alignment for maximum safety."
    },
    {
      phase: "Phase 3: Finished Masterpiece",
      image: "/Our Process/creation_3.jpg",
      desc: "The final hand-polished ring, boasting a 3.02ct D-IF Oval diamond set on a hidden halo band, safely delivered to our client in London."
    }
  ];

  const faqs = [
    {
      q: "How long does a bespoke jewelry commission typically take?",
      a: "A standard bespoke jewelry commission takes approximately 3 to 5 weeks from the initial consultation to final delivery. This allows our craftsmen to carefully sketch, render, forge, set, polish, and certify your unique creation without rushing the delicate processes."
    },
    {
      q: "How do you handle international transit and insurance?",
      a: "We offer secure, fully-insured door-to-door shipping worldwide via specialized armored couriers such as Malca-Amit or Brinks. Every shipment is tracked from the moment it leaves our atelier until it is hand-delivered to your doorstep, ensuring zero risk to our clients."
    },
    {
      q: "Can I use my own family stones or heirloom gold?",
      a: "Yes. We honor requests to reset family heirloom gemstones into new modern designs. Our gemologists will inspect the stones to verify their structural integrity before crafting begins. For gold, we can melt down your heirloom metal to forge a new setting, carrying forward its sentimental value."
    },
    {
      q: "How are changes handled during the CAD design stage?",
      a: "We offer unlimited adjustments during the digital CAD modeling phase. We believe in absolute perfection, which is why we will not cast the physical metal until you are completely satisfied with the 3D renders and give your written approval."
    }
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleScrollToPhilosophy = (e) => {
    e.preventDefault();
    const element = document.getElementById('bp-philosophy');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToCTA = (e) => {
    e.preventDefault();
    const element = document.getElementById('bp-cta');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@200;300;400;500;600;700&display=swap');

        /* Theme Base */
        .bp-container {
          font-family: 'Montserrat', sans-serif;
          background: #ffffff;
          color: #111111;
          overflow-x: hidden;
          padding-top: 0px;
        }

        .bp-serif {
          font-family: 'Cormorant Garamond', serif;
        }

        .bp-gold {
          color: #CEA268;
        }

        /* Hero Section */
        .bp-hero {
          position: relative;
          height: 100vh;
          min-height: 700px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: #0d0d0d url('/Our Process/step_3.jpg') no-repeat center center;
          background-size: cover;
          background-attachment: scroll;
        }

        @media (min-width: 1024px) {
          .bp-hero {
            background-attachment: fixed;
          }
        }

        .bp-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(17, 17, 17, 0.6) 0%,
            rgba(17, 17, 17, 0.75) 50%,
            rgba(17, 17, 17, 0.95) 100%
          );
        }

        .bp-hero-content {
          position: relative;
          z-index: 10;
          max-width: 900px;
          padding: 0 24px;
          margin-top: 60px;
        }

        .bp-hero-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: #CEA268;
          margin-bottom: 24px;
          display: block;
        }

        .bp-hero-title {
          font-size: clamp(36px, 6vw, 64px);
          font-weight: 300;
          color: #ffffff;
          line-height: 1.15;
          margin-bottom: 28px;
        }

        .bp-hero-subtitle {
          font-size: clamp(14px, 2vw, 17px);
          font-weight: 300;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.8;
          max-width: 680px;
          margin: 0 auto 40px;
        }

        .bp-hero-ctas {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .bp-btn-primary {
          background: #CEA268;
          color: #ffffff;
          padding: 16px 36px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          border: 1px solid #CEA268;
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 0px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .bp-btn-primary:hover {
          background: transparent;
          color: #CEA268;
        }

        .bp-btn-secondary {
          background: transparent;
          color: #ffffff;
          padding: 16px 36px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          border: 1px solid rgba(255, 255, 255, 0.4);
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 0px;
        }

        .bp-btn-secondary:hover {
          border-color: #CEA268;
          color: #CEA268;
        }

        /* Philosophy Creed */
        .bp-section {
          padding: 120px 24px;
        }

        .bp-bg-neutral {
          background-color: #FAF8F6;
        }

        .bp-creed-box {
          max-width: 800px;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #e8e0d8;
          padding: 6px;
        }

        .bp-creed-inner {
          border: 1px solid #CEA268;
          padding: 60px 40px;
          text-align: center;
        }

        .bp-creed-icon {
          color: #CEA268;
          margin-bottom: 24px;
          display: inline-block;
        }

        .bp-creed-title {
          font-size: clamp(24px, 3.5vw, 36px);
          font-weight: 400;
          color: #111111;
          margin-bottom: 24px;
        }

        .bp-creed-text {
          font-size: clamp(14px, 1.8vw, 16px);
          line-height: 1.85;
          color: #444444;
          font-weight: 300;
        }

        /* Section Headers */
        .bp-sec-header {
          text-align: center;
          max-width: 800px;
          margin: 0 auto 70px;
        }

        .bp-sec-eyebrow {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.25em;
          color: #CEA268;
          text-transform: uppercase;
          margin-bottom: 16px;
          display: block;
        }

        .bp-sec-title {
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 400;
          color: #111111;
          line-height: 1.25;
        }

        .bp-sec-subtitle {
          font-size: 14px;
          color: #666666;
          line-height: 1.8;
          margin-top: 18px;
          font-weight: 300;
        }

        /* 5-Stage Interactive Section */
        .bp-stages-wrapper {
          max-width: 1200px;
          margin: 0 auto;
        }

        .bp-stages-tabs {
          display: flex;
          border-bottom: 1px solid #e8e0d8;
          margin-bottom: 50px;
          justify-content: space-between;
          overflow-x: auto;
          white-space: nowrap;
          scrollbar-width: none;
        }

        .bp-stages-tabs::-webkit-scrollbar {
          display: none;
        }

        .bp-tab-btn {
          background: none;
          border: none;
          padding: 20px 10px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #888888;
          cursor: pointer;
          position: relative;
          transition: color 0.3s;
          flex: 1;
          text-align: center;
        }

        .bp-tab-btn.active {
          color: #CEA268;
        }

        .bp-tab-btn::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: #CEA268;
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .bp-tab-btn.active::after {
          transform: scaleX(1);
        }

        .bp-tab-num {
          font-size: 9px;
          color: #CEA268;
          margin-right: 4px;
        }

        .bp-stage-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        @media (max-width: 900px) {
          .bp-stage-card {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }

        .bp-stage-content {
          padding-right: 20px;
        }

        @media (max-width: 900px) {
          .bp-stage-content {
            padding-right: 0;
          }
        }

        .bp-stage-step-num {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: #CEA268;
          margin-bottom: 16px;
          display: block;
        }

        .bp-stage-title {
          font-size: clamp(26px, 3vw, 38px);
          font-weight: 400;
          color: #111111;
          margin-bottom: 24px;
          line-height: 1.25;
        }

        .bp-stage-desc {
          font-size: 15px;
          line-height: 1.8;
          color: #555555;
          font-weight: 300;
          margin-bottom: 30px;
        }

        .bp-stage-highlights {
          list-style: none;
          padding: 0;
          margin: 0 0 30px;
        }

        .bp-stage-highlight-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          font-weight: 500;
          color: #222222;
          margin-bottom: 12px;
        }

        .bp-stage-highlight-dot {
          width: 6px;
          height: 6px;
          background: #CEA268;
          display: inline-block;
        }

        .bp-stage-image-container {
          position: relative;
          padding: 8px;
          border: 1px solid #e8e0d8;
        }

        .bp-stage-image-inner {
          border: 1px solid #CEA268;
          position: relative;
          aspect-ratio: 4/3;
          overflow: hidden;
        }

        .bp-stage-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.8s ease;
        }

        .bp-stage-image-container:hover .bp-stage-img {
          transform: scale(1.04);
        }

        /* Inside Atelier Grid */
        .bp-atelier-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (max-width: 1024px) {
          .bp-atelier-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .bp-atelier-grid {
            grid-template-columns: 1fr;
          }
        }

        .bp-atelier-card {
          border: 1px solid #e8e0d8;
          padding: 5px;
          background: #ffffff;
        }

        .bp-atelier-inner {
          border: 1px solid transparent;
          transition: border-color 0.3s;
          height: 100%;
        }

        .bp-atelier-card:hover .bp-atelier-inner {
          border-color: #CEA268;
        }

        .bp-atelier-img-box {
          position: relative;
          aspect-ratio: 1/1;
          overflow: hidden;
        }

        .bp-atelier-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .bp-atelier-card:hover .bp-atelier-img {
          transform: scale(1.06);
        }

        .bp-atelier-info {
          padding: 24px 16px;
        }

        .bp-atelier-tag {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #CEA268;
          text-transform: uppercase;
          margin-bottom: 8px;
          display: block;
        }

        .bp-atelier-title {
          font-size: 16px;
          font-weight: 500;
          color: #111111;
          margin-bottom: 8px;
        }

        .bp-atelier-desc {
          font-size: 12px;
          color: #666666;
          line-height: 1.6;
          font-weight: 300;
        }

        /* Meet the Craftsmen */
        .bp-craftsmen-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          max-width: 1100px;
          margin: 0 auto;
        }

        @media (max-width: 800px) {
          .bp-craftsmen-grid {
            grid-template-columns: 1fr;
          }
        }

        .bp-craftsman-card {
          display: flex;
          gap: 28px;
          align-items: center;
          border-bottom: 1px solid #e8e0d8;
          padding-bottom: 30px;
        }

        @media (max-width: 600px) {
          .bp-craftsman-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }
        }

        .bp-craftsman-img-container {
          width: 140px;
          height: 175px;
          flex-shrink: 0;
          border: 1px solid #e8e0d8;
          padding: 4px;
        }

        .bp-craftsman-img-inner {
          border: 1px solid #CEA268;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .bp-craftsman-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(100%);
          transition: filter 0.5s ease, transform 0.5s ease;
        }

        .bp-craftsman-card:hover .bp-craftsman-img {
          filter: grayscale(0%);
          transform: scale(1.03);
        }

        .bp-craftsman-name {
          font-size: 18px;
          font-weight: 500;
          color: #111111;
          margin-bottom: 6px;
        }

        .bp-craftsman-role {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: #CEA268;
          text-transform: uppercase;
          margin-bottom: 12px;
          display: block;
        }

        .bp-craftsman-bio {
          font-size: 12px;
          color: #555555;
          line-height: 1.7;
          font-weight: 300;
        }

        /* Timeline Flow */
        .bp-timeline-wrapper {
          max-width: 1200px;
          margin: 60px auto 0;
          position: relative;
        }

        .bp-timeline-line {
          position: absolute;
          top: 36px;
          left: 50px;
          right: 50px;
          height: 1px;
          background: #e8e0d8;
          z-index: 1;
        }

        .bp-timeline-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          position: relative;
          z-index: 2;
          gap: 20px;
        }

        @media (max-width: 900px) {
          .bp-timeline-line {
            display: none;
          }
          .bp-timeline-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
        }

        .bp-timeline-item {
          text-align: center;
        }

        @media (max-width: 900px) {
          .bp-timeline-item {
            text-align: left;
            display: flex;
            gap: 20px;
            align-items: center;
          }
        }

        .bp-timeline-node {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: #ffffff;
          border: 1px solid #CEA268;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 400;
          color: #CEA268;
          transition: all 0.3s ease;
        }

        @media (max-width: 900px) {
          .bp-timeline-node {
            margin: 0;
            flex-shrink: 0;
          }
        }

        .bp-timeline-item:hover .bp-timeline-node {
          background: #CEA268;
          color: #ffffff;
          box-shadow: 0 0 15px rgba(206, 162, 104, 0.4);
        }

        .bp-timeline-label {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 6px;
          color: #111111;
        }

        .bp-timeline-desc {
          font-size: 11px;
          color: #777777;
          line-height: 1.5;
          font-weight: 300;
          max-width: 160px;
          margin: 0 auto;
        }

        @media (max-width: 900px) {
          .bp-timeline-desc {
            margin: 0;
            max-width: none;
          }
        }

        /* Trust Certification Grid */
        .bp-trust-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (max-width: 1024px) {
          .bp-trust-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 700px) {
          .bp-trust-grid {
            grid-template-columns: 1fr;
          }
        }

        .bp-trust-card {
          border: 1px solid #e8e0d8;
          padding: 30px 20px;
          text-align: center;
          background: #ffffff;
          transition: all 0.3s ease;
        }

        .bp-trust-card:hover {
          border-color: #CEA268;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
        }

        .bp-trust-icon {
          color: #CEA268;
          margin-bottom: 20px;
          display: inline-block;
        }

        .bp-trust-name {
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #111111;
          margin-bottom: 12px;
        }

        .bp-trust-desc {
          font-size: 11px;
          color: #666666;
          line-height: 1.6;
          font-weight: 300;
        }

        /* Client Diaries */
        .bp-diaries-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (max-width: 900px) {
          .bp-diaries-grid {
            grid-template-columns: 1fr;
          }
        }

        .bp-diary-card {
          border: 1px solid #e8e0d8;
          padding: 6px;
        }

        .bp-diary-inner {
          border: 1px solid transparent;
          transition: border-color 0.3s;
          height: 100%;
        }

        .bp-diary-card:hover .bp-diary-inner {
          border-color: #CEA268;
        }

        .bp-diary-img-box {
          position: relative;
          aspect-ratio: 4/3;
          overflow: hidden;
        }

        .bp-diary-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .bp-diary-card:hover .bp-diary-img {
          transform: scale(1.05);
        }

        .bp-diary-info {
          padding: 24px 16px;
        }

        .bp-diary-phase {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: #CEA268;
          text-transform: uppercase;
          margin-bottom: 10px;
          display: block;
        }

        .bp-diary-desc {
          font-size: 13px;
          color: #444444;
          line-height: 1.75;
          font-weight: 300;
        }

        /* Luxury FAQ Accordion */
        .bp-faq-wrapper {
          max-width: 800px;
          margin: 0 auto;
        }

        .bp-faq-item {
          border-bottom: 1px solid #e8e0d8;
          padding: 24px 0;
        }

        .bp-faq-trigger {
          width: 100%;
          background: none;
          border: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-align: left;
          cursor: pointer;
          padding: 0;
        }

        .bp-faq-q {
          font-size: clamp(14px, 2vw, 17px);
          font-weight: 500;
          color: #111111;
          padding-right: 20px;
        }

        .bp-faq-icon {
          color: #CEA268;
          transition: transform 0.3s;
        }

        .bp-faq-item.open .bp-faq-icon {
          transform: rotate(180deg);
        }

        .bp-faq-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease, margin-top 0.3s ease;
          margin-top: 0;
        }

        .bp-faq-item.open .bp-faq-content {
          max-height: 200px;
          margin-top: 16px;
        }

        .bp-faq-a {
          font-size: 13px;
          color: #666666;
          line-height: 1.8;
          font-weight: 300;
        }

        /* Final CTA */
        .bp-cta-section {
          background: #111111;
          color: #ffffff;
          padding: 120px 24px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .bp-cta-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(206, 162, 104, 0.15) 0%, transparent 70%);
          z-index: 1;
        }

        .bp-cta-content {
          position: relative;
          z-index: 10;
          max-width: 700px;
          margin: 0 auto;
        }

        .bp-cta-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #CEA268;
          margin-bottom: 20px;
          display: block;
        }

        .bp-cta-title {
          font-size: clamp(30px, 5vw, 48px);
          font-weight: 300;
          line-height: 1.25;
          margin-bottom: 24px;
        }

        .bp-cta-desc {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.75);
          line-height: 1.8;
          margin-bottom: 40px;
          font-weight: 300;
        }

        /* Sliding Consultation Drawer */
        .bp-drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          z-index: 2000;
          opacity: 0;
          visibility: hidden;
          transition: all 0.4s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .bp-drawer-overlay.open {
          opacity: 1;
          visibility: visible;
        }

        .bp-drawer {
          position: relative;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          background: #ffffff;
          z-index: 2001;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          transform: scale(0.95) translateY(20px);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          border-radius: 8px;
        }

        .bp-drawer-overlay.open .bp-drawer {
          transform: scale(1) translateY(0);
        }

        .bp-drawer-header {
          padding: 24px;
          border-bottom: 1px solid #e8e0d8;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .bp-drawer-title {
          font-size: 18px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .bp-drawer-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #111111;
          padding: 4px;
        }

        .bp-drawer-close:hover {
          color: #CEA268;
        }

        .bp-drawer-body {
          padding: 32px 24px;
          overflow-y: auto;
          flex: 1;
          scrollbar-width: thin;
          scrollbar-color: rgba(206, 162, 104, 0.3) transparent;
        }

        .bp-drawer-body::-webkit-scrollbar {
          width: 5px;
        }

        .bp-drawer-body::-webkit-scrollbar-track {
          background: transparent;
        }

        .bp-drawer-body::-webkit-scrollbar-thumb {
          background: rgba(206, 162, 104, 0.3);
          border-radius: 10px;
        }

        .bp-drawer-body::-webkit-scrollbar-thumb:hover {
          background: rgba(206, 162, 104, 0.6);
        }

        .bp-form-group {
          margin-bottom: 24px;
        }

        .bp-form-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #555555;
          margin-bottom: 8px;
          display: block;
        }

        /* Custom react-phone-number-input styling */
        .PhoneInput {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        .PhoneInputCountry {
          display: flex;
          align-items: center;
          position: relative;
          border: 1px solid #CEA268;
          background: #fafafa;
          padding: 12px 10px;
          height: 46px;
          cursor: pointer;
        }

        .PhoneInputCountrySelect {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          opacity: 0;
          cursor: pointer;
          z-index: 10;
        }

        .PhoneInputCountryIcon--square,
        .PhoneInputCountryIcon {
          width: 24px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .PhoneInputCountryIcon img,
        .PhoneInputCountryIcon svg {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .PhoneInputInput {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #CEA268;
          background: #fafafa;
          font-family: inherit;
          font-size: 13px;
          outline: none;
          transition: all 0.3s;
          border-radius: 0px;
          height: 46px;
        }

        .PhoneInputInput:focus {
          background: #ffffff;
          box-shadow: 0 0 10px rgba(206, 162, 104, 0.15);
        }

        .bp-form-input, .bp-form-select, .bp-form-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #CEA268;
          background: #fafafa;
          font-family: inherit;
          font-size: 13px;
          outline: none;
          transition: all 0.3s;
          border-radius: 0px;
        }

        .bp-form-input:focus, .bp-form-select:focus, .bp-form-textarea:focus {
          background: #ffffff;
          box-shadow: 0 0 10px rgba(206, 162, 104, 0.15);
        }

        .bp-form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .bp-form-submit {
          width: 100%;
          background: #111111;
          color: #ffffff;
          border: 1px solid #111111;
          padding: 16px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s;
          border-radius: 0px;
        }

        .bp-form-submit:hover {
          background: #CEA268;
          border-color: #CEA268;
        }

        .bp-success-message {
          text-align: center;
          padding: 40px 20px;
        }

        .bp-success-icon {
          color: #CEA268;
          margin-bottom: 20px;
        }

        .bp-success-title {
          font-size: 20px;
          font-weight: 500;
          margin-bottom: 12px;
        }

        .bp-success-desc {
          font-size: 13px;
          color: #666666;
          line-height: 1.6;
        }
      `}} />

      <Navbar />

      <div className="bp-container">
        {/* Hero Section */}
        <section className="bp-hero">
          <div className="bp-hero-content">
            <span className="bp-hero-eyebrow">The Atelier Experience</span>
            <h1 className="bp-hero-title bp-serif">Where Vision Becomes Timeless Craftsmanship</h1>
            <p className="bp-hero-subtitle">
              Collaborate with our master artisans to sculpt a custom masterpiece, forged in solid high-carat gold and hand-set with certified conflict-free diamonds.
            </p>
            <div className="bp-hero-ctas">
              <button className="bp-btn-primary" onClick={() => setIsConsultationOpen(true)}>
                Begin Bespoke Commission <ArrowRight size={14} />
              </button>
              <a href="#bp-philosophy" className="bp-btn-secondary" onClick={handleScrollToPhilosophy}>
                Explore Our Creed
              </a>
            </div>
          </div>
        </section>

        {/* Philosophy Creed Section */}
        <section id="bp-philosophy" className="bp-section bp-bg-neutral">
          <div className="bp-creed-box">
            <div className="bp-creed-inner">
              <span className="bp-creed-icon">
                <Sparkles size={32} />
              </span>
              <h2 className="bp-creed-title bp-serif">The ZULU Creed</h2>
              <p className="bp-creed-text">
                Fine jewelry should never be mass-produced. We believe in the weight of solid gold, the security of hand-carved galleries, and the brilliance of hand-aligned diamonds. Every piece forged in our atelier is a unique collaborative journey between designer, goldsmith, and wearer—an authentic sculpture meant to endure for generations.
              </p>
            </div>
          </div>
        </section>

        {/* The 5-Stage Journey */}
        <section className="bp-section">
          <div className="bp-sec-header">
            <span className="bp-sec-eyebrow">The Evolution of Art</span>
            <h2 className="bp-sec-title bp-serif">The Five Pillars of Creation</h2>
            <p className="bp-sec-subtitle">
              Experience Option B: The Bespoke Journey. From the first charcoal sketch to the final micro-setting, discover how we build heirloom-level jewelry.
            </p>
          </div>

          <div className="bp-stages-wrapper">
            <div className="bp-stages-tabs">
              {stages.map((stage) => (
                <button
                  key={stage.id}
                  className={`bp-tab-btn ${activeStage === stage.id ? 'active' : ''}`}
                  onClick={() => setActiveStage(stage.id)}
                >
                  <span className="bp-tab-num">{stage.number}</span>
                  {stage.title}
                </button>
              ))}
            </div>

            {stages.map((stage) => {
              if (stage.id !== activeStage) return null;
              return (
                <div key={stage.id} className="bp-stage-card">
                  <div className="bp-stage-content">
                    <span className="bp-stage-step-num">STAGE {stage.number}</span>
                    <h3 className="bp-stage-title bp-serif">{stage.subtitle}</h3>
                    <p className="bp-stage-desc">{stage.description}</p>
                    <ul className="bp-stage-highlights">
                      {stage.highlights.map((h, i) => (
                        <li key={i} className="bp-stage-highlight-item">
                          <span className="bp-stage-highlight-dot"></span>
                          {h}
                        </li>
                      ))}
                    </ul>
                    <button className="bp-btn-primary" onClick={() => setIsConsultationOpen(true)}>
                      Request This Stage Consult
                    </button>
                  </div>
                  <div className="bp-stage-image-container">
                    <div className="bp-stage-image-inner">
                      <Image src={stage.image} alt={stage.title} fill sizes="(max-width: 900px) 100vw, 50vw" className="bp-stage-img" style={{ objectFit: 'cover' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Inside the Atelier Visual Showcase */}
        <section className="bp-section bp-bg-neutral">
          <div className="bp-sec-header">
            <span className="bp-sec-eyebrow">Behind Closed Doors</span>
            <h2 className="bp-sec-title bp-serif">Inside the ZULU Atelier</h2>
            <p className="bp-sec-subtitle">
              A sensory visual journey showing raw precious metals, diamond sorting arrays, and the precise instruments of our trade.
            </p>
          </div>

          <div className="bp-atelier-grid">
            {atelierSteps.map((step, i) => (
              <div key={i} className="bp-atelier-card">
                <div className="bp-atelier-inner">
                  <div className="bp-atelier-img-box">
                    <Image src={step.image} alt={step.title} fill sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 25vw" className="bp-atelier-img" style={{ objectFit: 'cover' }} />
                  </div>
                  <div className="bp-atelier-info">
                    <span className="bp-atelier-tag">{step.category}</span>
                    <h3 className="bp-atelier-title">{step.title}</h3>
                    <p className="bp-atelier-desc">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Meet the Craftsmen */}
        <section className="bp-section">
          <div className="bp-sec-header">
            <span className="bp-sec-eyebrow">Master Hands</span>
            <h2 className="bp-sec-title bp-serif">Meet the Craftsmen</h2>
            <p className="bp-sec-subtitle">
              The designers, metallurgy experts, and gemologists who breathe life into Zulu Jewellers commissions.
            </p>
          </div>

          <div className="bp-craftsmen-grid">
            {craftsmen.map((c, i) => (
              <div key={i} className="bp-craftsman-card">
                <div className="bp-craftsman-img-container">
                  <div className="bp-craftsman-img-inner" style={{ position: 'relative' }}>
                    <Image src={c.image} alt={c.name} fill sizes="140px" className="bp-craftsman-img" style={{ objectFit: 'cover' }} />
                  </div>
                </div>
                <div>
                  <h3 className="bp-craftsman-name bp-serif">{c.name}</h3>
                  <span className="bp-craftsman-role">{c.role}</span>
                  <p className="bp-craftsman-bio">{c.story}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Simplified Bespoke Timeline */}
        <section className="bp-section bp-bg-neutral">
          <div className="bp-sec-header">
            <span className="bp-sec-eyebrow">Your Involvement</span>
            <h2 className="bp-sec-title bp-serif">The Client Timeline</h2>
            <p className="bp-sec-subtitle">
              A structured roadmap detailing your touchpoints and control gates throughout the bespoke creation process.
            </p>
          </div>

          <div className="bp-timeline-wrapper">
            <div className="bp-timeline-line"></div>
            <div className="bp-timeline-grid">
              {timelineSteps.map((t, i) => (
                <div key={i} className="bp-timeline-item">
                  <div className="bp-timeline-node">{t.step}</div>
                  <div>
                    <h3 className="bp-timeline-label">{t.label}</h3>
                    <p className="bp-timeline-desc">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Materials & Certified Trust */}
        <section className="bp-section">
          <div className="bp-sec-header">
            <span className="bp-sec-eyebrow">International Auditing</span>
            <h2 className="bp-sec-title bp-serif">Certified Trust & Integrity</h2>
            <p className="bp-sec-subtitle">
              Every gemstone and gold alloy passes through strict third-party verification parameters.
            </p>
          </div>

          <div className="bp-trust-grid">
            {certifications.map((c, i) => (
              <div key={i} className="bp-trust-card">
                <div className="bp-trust-icon">{c.icon}</div>
                <h3 className="bp-trust-name">{c.name}</h3>
                <p className="bp-trust-desc">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Client Diaries (Case Study) */}
        <section className="bp-section bp-bg-neutral">
          <div className="bp-sec-header">
            <span className="bp-sec-eyebrow">From Concept to Reality</span>
            <h2 className="bp-sec-title bp-serif">The Aurelia Solitaire Ring</h2>
            <p className="bp-sec-subtitle">
              Follow the physical progression of a recent custom commission from the client&apos;s initial inspiration sketch to final setting.
            </p>
          </div>

          <div className="bp-diaries-grid">
            {diaries.map((diary, i) => (
              <div key={i} className="bp-diary-card">
                <div className="bp-diary-inner">
                  <div className="bp-diary-img-box">
                    <Image src={diary.image} alt={diary.phase} fill sizes="(max-width: 900px) 100vw, 33vw" className="bp-diary-img" style={{ objectFit: 'cover' }} />
                  </div>
                  <div className="bp-diary-info">
                    <span className="bp-diary-phase">{diary.phase}</span>
                    <p className="bp-diary-desc">{diary.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Luxury Atelier FAQs */}
        <section className="bp-section">
          <div className="bp-sec-header">
            <span className="bp-sec-eyebrow">Clear Intent</span>
            <h2 className="bp-sec-title bp-serif">Atelier Commission FAQs</h2>
            <p className="bp-sec-subtitle">
              Answering key questions on timelines, international insured logistics, and custom design approvals.
            </p>
          </div>

          <div className="bp-faq-wrapper">
            {faqs.map((faq, i) => (
              <div key={i} className={`bp-faq-item ${openFaq === i ? 'open' : ''}`}>
                <button className="bp-faq-trigger" onClick={() => toggleFaq(i)}>
                  <span className="bp-faq-q bp-serif">{faq.q}</span>
                  <span className="bp-faq-icon">
                    <ChevronDown size={18} />
                  </span>
                </button>
                <div className="bp-faq-content">
                  <p className="bp-faq-a">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final Atelier CTA */}
        <section id="bp-cta" className="bp-cta-section">
          <div className="bp-cta-content">
            <span className="bp-cta-eyebrow">Commission An Heirloom</span>
            <h2 className="bp-cta-title bp-serif">Let&apos;s Create Something Timeless Together</h2>
            <p className="bp-cta-desc">
              Request a private bespoke digital presentation. Connect with a dedicated client advisor to discuss sketches, diamonds, and structural gold compositions.
            </p>
            <button className="bp-btn-primary" onClick={() => setIsConsultationOpen(true)}>
              Request Bespoke Presentation <ArrowRight size={14} />
            </button>
          </div>
        </section>
      </div>

      {/* Sliding Consultation Drawer Overlay */}
      <ConsultationDrawer isOpen={isConsultationOpen} onClose={() => setIsConsultationOpen(false)} />

      <Footer />
    </>
  );
}
