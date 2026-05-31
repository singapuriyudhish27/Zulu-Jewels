'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!token || !email) {
      setError('Invalid reset link. Please request a new password reset link.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, token, newPassword: password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="form-header">
        <h1 className="form-title">New Password</h1>
        <p className="form-subtitle">Choose a secure password</p>
      </div>

      {success && (
        <div className="message success-message">
          <strong>Success!</strong> Your password has been updated. Redirecting to login...
        </div>
      )}

      {error && (
        <div className="message error-message">
          {error}
        </div>
      )}

      {!success && (!token || !email) && (
        <div className="message error-message">
          Invalid or expired link. Please go back to <a href="/auth/forgot-password" style={{ color: '#c9a84c', textDecoration: 'underline' }}>Forgot Password</a> page.
        </div>
      )}

      {!success && token && email && (
        <form className="auth-form" onSubmit={handleResetPassword}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Enter new password (min 8 chars)" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Confirm new password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}

      <div className="form-footer">
        <a href="/auth/login">Back to Sign In</a>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
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

        .breadcrumb {
            padding: 20px 80px;
            font-size: 14px;
            color: #888;
            margin-bottom: 20px;
            border-bottom: 1px dashed #ddd;
            border-top: 1px dashed #ddd;
            margin-top: 92px;
        }

        .breadcrumb a {
            color: #888;
            text-decoration: none;
        }

        .breadcrumb span {
            margin: 0 10px;
        }

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

      <div className="breadcrumb">
        <a href="/Pages">Home</a>
        <span>›</span>
        Reset Password
      </div>

      <div className="auth-container">
        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>

      <Footer />
    </>
  );
}
