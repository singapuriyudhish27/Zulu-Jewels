'use client';

import React, { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Unhandled runtime boundary error:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Montserrat, sans-serif',
      background: '#FAFAF8',
      color: '#2C2C2C',
      padding: '24px',
      textAlign: 'center',
    }}>
      <h2 style={{ fontSize: '32px', fontWeight: 300, margin: 0, color: '#B05050', letterSpacing: '1px' }}>Something went wrong</h2>
      <p style={{ fontSize: '14px', marginTop: '12px', color: '#9B8B6E', maxWidth: '400px', lineHeight: '1.6' }}>
        An unexpected error occurred. Please try resetting the component or reloading the page.
      </p>
      <button
        onClick={() => reset()}
        style={{
          marginTop: '24px',
          padding: '12px 24px',
          background: '#C9A84C',
          color: '#FFFFFF',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 600,
          fontFamily: 'Montserrat, sans-serif',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          fontSize: '11px',
          borderRadius: '2px',
          boxShadow: '0 4px 10px rgba(201, 168, 76, 0.15)',
        }}
      >
        Try Again
      </button>
    </div>
  );
}
