'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({email}),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      if (data === "No User Found, Register First.") {
        router.push("/auth/register");
      } else if (data === "Internal Server Error In API Route") {
        <p>This functionality is under maintenance</p>
      } else {
        router.push("/auth/login");
      }

      setSuccess(true);
      setEmail('');
    } catch (error) {
      setError(error.message || "Something Went Wrong.");
    } finally {
      setLoading(false);
    }
  }

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

        .success-message {
          background: rgba(76,175,80,0.1);
          border: 2px solid #4CAF50;
          border-radius: 8px;
          padding: 15px 20px;
          margin-bottom: 25px;
          display: none;
          align-items: center;
          gap: 12px;
        }

        .success-message.show {
          display: flex;
        }

        .success-icon {
          font-size: 24px;
          color: #4CAF50;
        }

        .success-text {
          font-size: 14px;
          color: #2e7d32;
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

        .form-footer {
          text-align: center;
          margin-top: 40px;
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

        .support-info {
          text-align: center;
          font-size: 14px;
          color: #666;
        }

        .support-info a {
          color: var(--primary-gold);
          text-decoration: none;
          font-weight: 600;
        }

        .support-info a:hover {
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
        }
      `}} />

      {/* Navigation */}
      <nav className="auth-nav">
        <div className="logo" onClick={() => window.location.href='/'}>Zulu Jewellers</div>
        <a href="/Pages" className="nav-link">← Back to Home</a>
      </nav>

      {/* Forgot Password Page */}
      <div className="auth-container">
        <div className="auth-wrapper">
          <div className="auth-brand">
            <div className="brand-content">
              <div className="brand-logo">ZULU<br/>JEWELLERS</div>
              <p className="brand-tagline">Do not worry! It happens to the best of us. We will help you reset your password quickly and securely.</p>
              
              <div className="brand-features">
                <div className="brand-feature">
                  <div className="feature-icon">🔒</div>
                  <div className="feature-text">Secure Password Reset Process</div>
                </div>
                <div className="brand-feature">
                  <div className="feature-icon">✉️</div>
                  <div className="feature-text">Instant Email Verification</div>
                </div>
                <div className="brand-feature">
                  <div className="feature-icon">⚡</div>
                  <div className="feature-text">Quick & Easy Recovery</div>
                </div>
                <div className="brand-feature">
                  <div className="feature-icon">🛡️</div>
                  <div className="feature-text">Protected by Advanced Security</div>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-form-container">
            <div className="form-header">
              <h1 className="form-title">Reset Password</h1>
              <p className="form-subtitle">Enter your email address and we will send you a link to reset your password</p>
            </div>

            {success && (
              <div className="success-message">
                <span className="success-icon">✓</span>
                <div className="success-text">
                  <strong>Email sent successfully!</strong><br/>
                  Please check your inbox for password reset instructions.
                </div>
              </div>
            )}

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠</span>
                <div className="error-text">
                  <strong>Error:</strong> {error}
                </div>
              </div>
            )}

            <form className="auth-form" onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="Enter your registered email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="form-footer">
              Remember your password? <a href="/auth/login">Back to Sign In</a>
            </div>

            <div className="divider">
              <div className="divider-line"></div>
              <span className="divider-text">Need Help?</span>
              <div className="divider-line"></div>
            </div>

            <div className="support-info">
              Contact our support team at<br/>
              <a href="mailto:support@zulujewellers.com">support@zulujewellers.com</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}