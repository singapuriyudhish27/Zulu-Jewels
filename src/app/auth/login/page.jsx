'use client';
import { useEffect, useState } from 'react';
import { EyeOff, Eye } from 'lucide-react';
import { useSearchParams, useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function LoginPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const callbackUrl = searchParams.get("callbackUrl");

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            
            const data = await response.json();

            if (response.ok) {
                toast.success("Welcome back to Zulu Jewellers!");

                if (data.user.role === "admin") {
                    router.push("/Pages/Admin");
                } else if (callbackUrl) {
                    console.log("CallBack:", callbackUrl);
                    router.push(callbackUrl);
                }else {
                    router.push("/Pages");
                }
            } else {
                toast.error(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error('An error occurred during login. Please try again.');
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
            min-height: 70vh;
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
            font-size: 48px;
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
            color: #999;
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
        Login
    </div>

    {/* Login Page */}
    <div className="auth-container">
        <div className="auth-wrapper">
            <div className="form-header">
                <h1 className="form-title">Login</h1>
                <p className="form-subtitle">Welcome to ZULU JEWELLERS</p>
            </div>

            <form className="auth-form" onSubmit={handleLogin}>
                <div className="form-group">
                    <label className="form-label">Email / Phone:</label>
                    <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>

                <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="password-input-wrapper">
                        <input type={showPassword ? 'text' : 'password'} className="form-input" value={password} onChange={e => setPassword(e.target.value)} required />
                        <button type='button' className='password-toggle' onClick={() => setShowPassword(prev => !prev)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </div>
                </div>

                <button type="submit" className="submit-btn">Login</button>
            </form>

            <div className="form-footer">
                <a href="/auth/forgot-password">Forgot Password?</a>
                <a href="/auth/register">Create account</a>
            </div>
        </div>
    </div>

    <Footer />
    </>
  );
}