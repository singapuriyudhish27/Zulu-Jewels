'use client';
import { useEffect, useState } from 'react';
import { EyeOff, Eye } from 'lucide-react';

export default function RegisterPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
            
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ firstName, lastName, contact_number: contactNumber, email, password }),
            })

            const data = await response.json();

            if (response.ok) {
                alert('Account created successfully! Welcome to Zulu Jewellers.');
                window.location.href = '/auth/login';
            } else {
                alert(data.message || 'Registration failed');
                return;
            }
        } catch (error) {
            console.error("Registeration Error:", error);
            alert('Internal Server Error');
        }
    }

    useEffect(() => {
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const provider = this.textContent.trim().split(' ')[1];
                alert(`${provider} authentication would be integrated here`);
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
        .auth-nav {
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

        .nav-link {
            color: #666;
            text-decoration: none;
            font-size: 14px;
            transition: color 0.3s ease;
        }

        .nav-link:hover {
            color: var(--primary-gold);
        }

        /* Auth Container */
        .auth-container {
            min-height: calc(100vh - 90px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
        }

        .auth-wrapper {
            display: flex;
            max-width: 1200px;
            width: 100%;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
        }

        /* Left Side - Brand */
        .auth-brand {
            flex: 1;
            background: linear-gradient(135deg, var(--dark-bg) 0%, #2c2c2c 100%);
            padding: 80px 60px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            color: white;
            position: relative;
            overflow: hidden;
        }

        .auth-brand::before {
            content: '';
            position: absolute;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(212,175,55,0.15), transparent);
            animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(30px, 30px) scale(1.1); }
        }

        .brand-content {
            position: relative;
            z-index: 1;
        }

        .brand-logo {
            font-family: 'Cormorant Garamond', serif;
            font-size: 48px;
            font-weight: 600;
            color: var(--primary-gold);
            letter-spacing: 3px;
            margin-bottom: 30px;
        }

        .brand-tagline {
            font-size: 18px;
            color: rgba(255,255,255,0.8);
            line-height: 1.7;
            margin-bottom: 40px;
        }

        .brand-features {
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-top: 40px;
        }

        .brand-feature {
            display: flex;
            align-items: center;
            gap: 15px;
            text-align: left;
        }

        .feature-icon {
            width: 45px;
            height: 45px;
            background: rgba(212,175,55,0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            flex-shrink: 0;
        }

        .feature-text {
            font-size: 14px;
            color: rgba(255,255,255,0.9);
        }

        /* Right Side - Form */
        .auth-form-container {
            flex: 1;
            padding: 80px 60px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .form-header {
            margin-bottom: 40px;
        }

        .form-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 42px;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 12px;
        }

        .form-subtitle {
            font-size: 15px;
            color: #666;
            line-height: 1.6;
        }

        .auth-form {
            display: flex;
            flex-direction: column;
            gap: 25px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .form-label {
            font-size: 13px;
            font-weight: 600;
            color: var(--text-dark);
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .form-input {
            padding: 15px 20px;
            border: 2px solid var(--border-light);
            border-radius: 8px;
            font-size: 15px;
            font-family: 'Montserrat', sans-serif;
            transition: all 0.3s ease;
            background: #fafafa;
        }

        .form-input:focus {
            outline: none;
            border-color: var(--primary-gold);
            background: white;
            box-shadow: 0 0 0 4px rgba(212,175,55,0.1);
        }

        .password-input-wrapper {
            position: relative;
        }

        .password-toggle {
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            font-size: 18px;
            color: #999;
            transition: color 0.3s ease;
        }

        .password-toggle:hover {
            color: var(--primary-gold);
        }

        .confirmPassword-toggle {
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            font-size: 18px;
            color: #999;
            transition: color 0.3s ease;
        }

        .confirmPassword-toggle:hover {
            color: var(--primary-gold);
        }

        .checkbox-group {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            margin-top: -10px;
        }

        .checkbox-group input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
            accent-color: var(--primary-gold);
            margin-top: 2px;
        }

        .checkbox-group label {
            font-size: 14px;
            color: #666;
            cursor: pointer;
            line-height: 1.5;
        }

        .checkbox-group label a {
            color: var(--primary-gold);
            text-decoration: none;
        }

        .checkbox-group label a:hover {
            text-decoration: underline;
        }

        .submit-btn {
            padding: 16px 30px;
            background: var(--primary-gold);
            color: var(--dark-bg);
            border: none;
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 8px;
            margin-top: 10px;
        }

        .submit-btn:hover {
            background: var(--accent-rose);
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(212,175,55,0.3);
        }

        .divider {
            display: flex;
            align-items: center;
            gap: 15px;
            margin: 30px 0;
        }

        .divider-line {
            flex: 1;
            height: 1px;
            background: var(--border-light);
        }

        .divider-text {
            font-size: 13px;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .social-login {
            display: flex;
            gap: 15px;
        }

        .social-btn {
            flex: 1;
            padding: 14px 20px;
            background: white;
            border: 2px solid var(--border-light);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-size: 14px;
            font-weight: 600;
            color: var(--text-dark);
        }

        .social-btn:hover {
            border-color: var(--primary-gold);
            background: rgba(212,175,55,0.05);
        }

        .form-footer {
            text-align: center;
            margin-top: 30px;
            font-size: 14px;
            color: #666;
        }

        .form-footer a {
            color: var(--primary-gold);
            text-decoration: none;
            font-weight: 600;
            transition: color 0.3s ease;
        }

        .form-footer a:hover {
            color: var(--accent-rose);
            text-decoration: underline;
        }

        @media (max-width: 968px) {
            .auth-brand {
                display: none;
            }
            .auth-form-container {
                padding: 60px 40px;
            }
        }

        @media (max-width: 480px) {
            .auth-nav {
                padding: 20px 30px;
            }
            .auth-form-container {
                padding: 40px 30px;
            }
            .form-title {
                font-size: 32px;
            }
            .social-login {
                flex-direction: column;
            }
        }
    
      `}} />
      
    {/* Navigation */}
    <nav className="auth-nav">
        <div className="logo" onClick={() => window.location.href = '/auth/login'}>Zulu Jewellers</div>
        <a href="/Pages" className="nav-link">← Back to Home</a>
    </nav>

    {/* Register Page */}
    <div className="auth-container">
        <div className="auth-wrapper">
            <div className="auth-brand">
                <div className="brand-content">
                    <div className="brand-logo">ZULU<br />JEWELLERS</div>
                    <p className="brand-tagline">
                        Join our exclusive community and enjoy premium benefits, personalized recommendations, and early access to new collections.
                    </p>
                    
                    <div className="brand-features">
                        <div className="brand-feature">
                            <div className="feature-icon">🎁</div>
                            <div className="feature-text">Exclusive Member Discounts & Offers</div>
                        </div>
                        <div className="brand-feature">
                            <div className="feature-icon">⭐</div>
                            <div className="feature-text">Priority Customer Support</div>
                        </div>
                        <div className="brand-feature">
                            <div className="feature-icon">📱</div>
                            <div className="feature-text">Track Orders & Wishlist Management</div>
                        </div>
                        <div className="brand-feature">
                            <div className="feature-icon">💝</div>
                            <div className="feature-text">Birthday Special Surprises</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="auth-form-container">
                <div className="form-header">
                    <h1 className="form-title">Create Account</h1>
                    <p className="form-subtitle">Start your journey with us and discover exquisite jewelry</p>
                </div>

                <form className="auth-form" onSubmit={handleRegister}>
                    <div className="form-group">
                        <label className="form-label">First Name</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            value={firstName} 
                            onChange={(e) => setFirstName(e.target.value)} 
                            placeholder="Enter your first name" 
                            required 
                        />
                        <label className='form-label'>Last Name</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            value={lastName} 
                            onChange={(e) => setLastName(e.target.value)} 
                            placeholder="Enter your last name" 
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input 
                            type="email" 
                            className="form-input" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="Enter your email" 
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input 
                            type="tel" 
                            className="form-input" 
                            value={contactNumber} 
                            onChange={(e) => setContactNumber(e.target.value)} 
                            placeholder="+1 (555) 000-0000" 
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="password-input-wrapper">
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                className="form-input" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                placeholder="Enter your password" 
                                required 
                            />
                            <button type='button' className='password-toggle' onClick={() => setShowPassword(prev => !prev)}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <div className="password-input-wrapper">
                            <input 
                                type={showConfirmPassword ? 'text' : 'password'} 
                                className="form-input" value={confirmPassword} 
                                onChange={e => setConfirmPassword(e.target.value)} 
                                placeholder="Enter your password" 
                                required 
                            />
                            <button type='button' className='confirmPassword-toggle' onClick={() => setShowConfirmPassword(prev => !prev)}>
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="checkbox-group">
                        <input type="checkbox" id="agreeTerms" required />
                        <label htmlFor="agreeTerms">I agree to the <a href="#">Terms & Conditions</a> and <a href="#">Privacy Policy</a></label>
                    </div>

                    <button type="submit" className="submit-btn">Create Account</button>
                </form>

                <div className="divider">
                    <div className="divider-line"></div>
                    <span className="divider-text">Or sign up with</span>
                    <div className="divider-line"></div>
                </div>

                <div className="social-login">
                    <button className="social-btn">
                        <span>G</span> Google
                    </button>
                    <button className="social-btn">
                        <span>f</span> Facebook
                    </button>
                </div>

                <div className="form-footer">
                    Already have an account? <a href="/auth/login">Sign In</a>
                </div>
            </div>
        </div>
    </div>

    </>
  );
}