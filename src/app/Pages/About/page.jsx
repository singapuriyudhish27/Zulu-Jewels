'use client';
import { User, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
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
            background: white;
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

        /* Hero Section */
        .hero-section {
            margin-top: 90px;
            height: 70vh;
            background: linear-gradient(135deg, rgba(26,26,26,0.95), rgba(44,44,44,0.9)),
                        linear-gradient(45deg, var(--primary-gold) 0%, var(--accent-rose) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: white;
            position: relative;
            overflow: hidden;
        }

        .hero-section::before {
            content: '';
            position: absolute;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(212,175,55,0.2), transparent);
            animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.5); opacity: 0.8; }
        }

        .hero-content {
            position: relative;
            z-index: 1;
            max-width: 900px;
            padding: 0 40px;
        }

        .hero-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 72px;
            font-weight: 400;
            margin-bottom: 25px;
        }

        .hero-subtitle {
            font-size: 20px;
            color: rgba(255,255,255,0.9);
            line-height: 1.7;
        }

        /* Story Section */
        .story-section {
            padding: 120px 80px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .story-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 80px;
            align-items: center;
        }

        .story-image {
            height: 500px;
            background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
            border-radius: 12px;
        }

        .story-content h2 {
            font-family: 'Cormorant Garamond', serif;
            font-size: 48px;
            font-weight: 400;
            color: var(--text-dark);
            margin-bottom: 30px;
        }

        .story-content p {
            font-size: 16px;
            color: #666;
            line-height: 1.9;
            margin-bottom: 20px;
        }

        /* Values Section */
        .values-section {
            padding: 100px 80px;
            background: #f9f9f9;
        }

        .section-header {
            text-align: center;
            margin-bottom: 70px;
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
            font-size: 52px;
            font-weight: 400;
            color: var(--text-dark);
        }

        .values-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 50px;
            max-width: 1400px;
            margin: 0 auto;
        }

        .value-card {
            background: white;
            padding: 50px 40px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.06);
            text-align: center;
            transition: all 0.4s ease;
        }

        .value-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 60px rgba(0,0,0,0.12);
        }

        .value-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 30px;
            background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(200,168,130,0.1));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
        }

        .value-title {
            font-size: 22px;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 15px;
        }

        .value-desc {
            font-size: 15px;
            color: #666;
            line-height: 1.7;
        }

        /* Team Section */
        .team-section {
            padding: 100px 80px;
            background: white;
        }

        .team-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 40px;
            max-width: 1400px;
            margin: 0 auto;
        }

        .team-member {
            text-align: center;
            transition: all 0.3s ease;
        }

        .team-member:hover {
            transform: translateY(-5px);
        }

        .member-photo {
            width: 100%;
            height: 320px;
            background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
            border-radius: 12px;
            margin-bottom: 25px;
        }

        .member-name {
            font-size: 20px;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 8px;
        }

        .member-role {
            font-size: 14px;
            color: var(--primary-gold);
            font-weight: 500;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        /* Stats Section */
        .stats-section {
            padding: 100px 80px;
            background: linear-gradient(135deg, var(--dark-bg), #2c2c2c);
            color: white;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 60px;
            max-width: 1400px;
            margin: 0 auto;
            text-align: center;
        }

        .stat-number {
            font-family: 'Cormorant Garamond', serif;
            font-size: 56px;
            font-weight: 700;
            color: var(--primary-gold);
            margin-bottom: 15px;
        }

        .stat-label {
            font-size: 16px;
            color: rgba(255,255,255,0.8);
            letter-spacing: 1px;
        }

        /* CTA Section */
        .cta-section {
            padding: 100px 80px;
            background: linear-gradient(135deg, var(--primary-gold), var(--accent-rose));
            text-align: center;
            color: white;
        }

        .cta-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 56px;
            font-weight: 400;
            margin-bottom: 25px;
        }

        .cta-desc {
            font-size: 18px;
            color: rgba(255,255,255,0.95);
            max-width: 700px;
            margin: 0 auto 40px;
            line-height: 1.7;
        }

        .cta-btn {
            padding: 18px 45px;
            background: white;
            color: var(--dark-bg);
            border: none;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 2px;
        }

        .cta-btn:hover {
            background: var(--dark-bg);
            color: white;
            transform: translateY(-3px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        @media (max-width: 1200px) {
            .values-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            .team-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (max-width: 768px) {
            nav {
                padding: 20px 30px;
            }
            .hero-title {
                font-size: 42px;
            }
            .story-section,
            .values-section,
            .team-section,
            .stats-section,
            .cta-section {
                padding: 60px 30px;
            }
            .story-grid {
                grid-template-columns: 1fr;
                gap: 40px;
            }
            .values-grid,
            .team-grid,
            .stats-grid {
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
            <li><a href="/Pages/About" className="active">About</a></li>
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

    {/* Hero Section */}
    <div className="hero-section">
        <div className="hero-content">
            <h1 className="hero-title">Our Story</h1>
            <p className="hero-subtitle">Founded in the heart of New York City, Zulu Jewellers was born from a passion for creating timeless jewelry that celebrates lifes most precious moments.</p>
        </div>
    </div>

    {/* Story Section */}
    <div className="story-section">
        <div className="story-grid">
            <div className="story-image"></div>
            <div className="story-content">
                <h2>Crafting Dreams Since 2015</h2>
                <p>At Zulu Jewellers, we believe that every piece of jewelry tells a story. Our journey began with a simple vision: to make exceptional, ethically-sourced diamonds accessible to everyone while maintaining the highest standards of craftsmanship.</p>
                <p>Today, we are proud to be at the forefront of the lab-grown diamond revolution, offering stunning pieces that are not only beautiful but also sustainable and conflict-free. Each ring, necklace, and earring we create is a testament to our commitment to quality, innovation, and customer satisfaction.</p>
                <p>Our New York City atelier combines traditional jewelry-making techniques with cutting-edge technology, ensuring that every piece we create meets our exacting standards of excellence.</p>
            </div>
        </div>
    </div>

    {/* Values Section */}
    <div className="values-section">
        <div className="section-header">
            <div className="section-label">What We Stand For</div>
            <h2 className="section-title">Our Core Values</h2>
        </div>

        <div className="values-grid">
            <div className="value-card">
                <div className="value-icon">💎</div>
                <h3 className="value-title">Exceptional Quality</h3>
                <p className="value-desc">We source only the finest lab-grown diamonds, certified by GIA and IGI, ensuring every stone meets our rigorous standards.</p>
            </div>

            <div className="value-card">
                <div className="value-icon">🌍</div>
                <h3 className="value-title">Sustainability</h3>
                <p className="value-desc">Our lab-grown diamonds have a minimal environmental footprint while delivering the same beauty and durability as mined diamonds.</p>
            </div>

            <div className="value-card">
                <div className="value-icon">🤝</div>
                <h3 className="value-title">Transparency</h3>
                <p className="value-desc">We believe in honest pricing and full transparency about our diamonds, craftsmanship, and sourcing practices.</p>
            </div>

            <div className="value-card">
                <div className="value-icon">✨</div>
                <h3 className="value-title">Craftsmanship</h3>
                <p className="value-desc">Every piece is handcrafted by master jewelers with decades of experience, ensuring perfection in every detail.</p>
            </div>

            <div className="value-card">
                <div className="value-icon">❤️</div>
                <h3 className="value-title">Customer First</h3>
                <p className="value-desc">Your satisfaction is our priority. We offer personalized service, lifetime warranties, and hassle-free returns.</p>
            </div>

            <div className="value-card">
                <div className="value-icon">🎨</div>
                <h3 className="value-title">Innovation</h3>
                <p className="value-desc">We embrace new technologies and design trends while honoring timeless jewelry-making traditions.</p>
            </div>
        </div>
    </div>

    {/* Team Section */}
    <div className="team-section">
        <div className="section-header">
            <div className="section-label">Meet The Team</div>
            <h2 className="section-title">The Artisans Behind Your Jewelry</h2>
        </div>

        <div className="team-grid">
            <div className="team-member">
                <div className="member-photo"></div>
                <h3 className="member-name">Sophie Laurent</h3>
                <p className="member-role">Founder & Creative Director</p>
            </div>

            <div className="team-member">
                <div className="member-photo"></div>
                <h3 className="member-name">Michael Chen</h3>
                <p className="member-role">Master Jeweler</p>
            </div>

            <div className="team-member">
                <div className="member-photo"></div>
                <h3 className="member-name">Isabella Romano</h3>
                <p className="member-role">Head of Design</p>
            </div>

            <div className="team-member">
                <div className="member-photo"></div>
                <h3 className="member-name">David Martinez</h3>
                <p className="member-role">Gemologist</p>
            </div>
        </div>
    </div>

    {/* Stats Section */}
    <div className="stats-section">
        <div className="stats-grid">
            <div className="stat-item">
                <div className="stat-number">15,000+</div>
                <div className="stat-label">Happy Customers</div>
            </div>
            <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">Unique Designs</div>
            </div>
            <div className="stat-item">
                <div className="stat-number">25+</div>
                <div className="stat-label">Master Craftsmen</div>
            </div>
            <div className="stat-item">
                <div className="stat-number">98%</div>
                <div className="stat-label">Satisfaction Rate</div>
            </div>
        </div>
    </div>

    {/* CTA Section */}
    <div className="cta-section">
        <h2 className="cta-title">Visit Our NYC Showroom</h2>
        <p className="cta-desc">Experience our collection in person and meet our team. Schedule a private consultation to discuss your dream piece or explore our ready-to-wear collection.</p>
        <button className="cta-btn">Book An Appointment</button>
    </div>

    </>
  );
}