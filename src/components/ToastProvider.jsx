'use client';
import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '14px',
          borderRadius: '8px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          padding: '14px 18px',
        },
        success: {
          iconTheme: { primary: '#D4AF37', secondary: '#fff' },
          style: {
            background: '#fff',
            color: '#2c2c2c',
            borderLeft: '4px solid #D4AF37',
          },
        },
        error: {
          iconTheme: { primary: '#e74c3c', secondary: '#fff' },
          style: {
            background: '#fff',
            color: '#2c2c2c',
            borderLeft: '4px solid #e74c3c',
          },
        },
      }}
    />
  );
}
