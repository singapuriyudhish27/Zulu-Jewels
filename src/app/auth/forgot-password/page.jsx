'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EyeOff, Eye } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

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
        setError("This functionality is under maintenance. Please try again later.");
      } else {
        setSuccess(true);
        setEmail('');
        // Optional: redirect to login after success
        // setTimeout(() => router.push("/auth/login"), 3000);
      }
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
          --text-dark: #000000;
          --text-grey: #666666;
          --border-light: #f0f0f0;
          --input-bg: #f7f7f7;
        }

        body {
            font-family: 'Inter', 'Montserrat', sans-serif;
            background: #ffffff;
            color: var(--text-dark);
        }

        /* Breadcrumb */
        .breadcrumb {
            padding: 20px 80px;
            font-size: 14px;
            color: #888;
            margin-bottom: 20px;
            border-bottom: 1px dashed #ddd;
            border-top: 1px dashed #ddd;
            margin-top: 92px; /* Adjusted for fixed navbar (72px) */
        }

        .breadcrumb a {
            color: #888;
            text-decoration: none;
        }

        .breadcrumb span {
            margin: 0 10px;
        }

        /* Auth Container */
        .auth-container {
            min-height: 50vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
        }

        .auth-wrapper {
            max-width: 450px;
            width: 100%;
            text-align: center;
        }

        .form-header {
            margin-bottom: 40px;
        }

        .form-title {
            font-size: 42px;
            font-weight: 500;
            color: var(--text-dark);
            margin-bottom: 10px;
            letter-spacing: 1px;
        }

        .form-subtitle {
            font-size: 14px;
            color: #333;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 40px;
        }

        .auth-form {
            display: flex;
            flex-direction: column;
            gap: 25px;
            text-align: left;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .form-label {
            font-size: 12px;
            font-weight: 600;
            color: #333;
            letter-spacing: 0.5px;
        }

        .form-input {
            padding: 18px 20px;
            border: none;
            border-radius: 4px;
            font-size: 15px;
            background: var(--input-bg);
            transition: all 0.3s ease;
        }

        .form-input:focus {
            outline: none;
            background: #f0f0f0;
        }

        .submit-btn {
            padding: 20px;
            background: #000000;
            color: #ffffff;
            border: none;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.3s ease;
            width: 100%;
            margin-top: 10px;
        }

        .submit-btn:hover {
            opacity: 0.9;
        }

        .submit-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .form-footer {
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin-top: 30px;
            text-align: center;
        }

        .form-footer a {
            color: #666;
            text-decoration: none;
            font-size: 14px;
            transition: color 0.3s ease;
        }

        .form-footer a:hover {
            color: #000;
            text-decoration: underline;
        }

        .message {
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 25px;
            font-size: 14px;
            text-align: center;
        }

        .success-message {
            background: #f0fff4;
            color: #2f855a;
            border: 1px solid #c6f6d5;
        }

        .error-message {
            background: #fff5f5;
            color: #c53030;
            border: 1px solid #feb2b2;
        }

        @media (max-width: 768px) {
            .breadcrumb {
                padding: 20px 30px;
            }
        }
      `}} />

      <Navbar />

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <a href="/Pages">Home</a>
        <span>›</span>
        Forgot Password
      </div>

      {/* Forgot Password Page */}
      <div className="auth-container">
        <div className="auth-wrapper">
          <div className="form-header">
            <h1 className="form-title">Reset Password</h1>
            <p className="form-subtitle">Welcome to ZULU JEWELLERS</p>
          </div>

          {success && (
            <div className="message success-message">
              <strong>Email sent!</strong> Please check your inbox for reset instructions.
            </div>
          )}

          {error && (
            <div className="message error-message">
              {error}
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
            <a href="/auth/login">Back to Sign In</a>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}