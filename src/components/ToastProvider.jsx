'use client';
import { Toaster, toast } from 'react-hot-toast';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function ToastProvider() {
  return (
    <Toaster 
      position="top-center"
      toastOptions={{
        duration: 4000
      }}
    >
      {(t) => {
        let bg = '#f0f9ff';
        let border = '1px solid #bae6fd';
        let color = '#0369a1';
        let iconColor = '#0284c7';
        let closeColor = '#0284c7';
        let closeHoverColor = '#0369a1';
        let icon = null;

        const hasCustomEmoji = typeof t.icon === 'string';

        if (t.type === 'success') {
          bg = '#f0fdf4';
          border = '1px solid #bbf7d0';
          color = '#15803d';
          iconColor = '#16a34a';
          closeColor = '#16a34a';
          closeHoverColor = '#15803d';
          icon = <CheckCircle2 size={18} strokeWidth={2} style={{ color: iconColor, flexShrink: 0 }} />;
        } else if (t.type === 'error') {
          bg = '#fef2f2';
          border = '1px solid #fecaca';
          color = '#b91c1c';
          iconColor = '#dc2626';
          closeColor = '#dc2626';
          closeHoverColor = '#b91c1c';
          icon = <AlertCircle size={18} strokeWidth={2} style={{ color: iconColor, flexShrink: 0 }} />;
        } else if (t.icon === 'ℹ️' || t.icon === 'ℹ') {
          bg = '#f0f9ff';
          border = '1px solid #bae6fd';
          color = '#0369a1';
          iconColor = '#0284c7';
          closeColor = '#0284c7';
          closeHoverColor = '#0369a1';
          icon = <Info size={18} strokeWidth={2} style={{ color: iconColor, flexShrink: 0 }} />;
        } else if (t.icon === '⚠️' || t.icon === '⚠') {
          bg = '#fffbeb';
          border = '1px solid #fef3c7';
          color = '#b45309';
          iconColor = '#d97706';
          closeColor = '#d97706';
          closeHoverColor = '#b45309';
          icon = <AlertTriangle size={18} strokeWidth={2} style={{ color: iconColor, flexShrink: 0 }} />;
        } else {
          if (hasCustomEmoji) {
            bg = '#fafaf9';
            border = '1px solid #e7e5e4';
            color = '#44403c';
            iconColor = '#CEA268';
            closeColor = '#78716c';
            closeHoverColor = '#44403c';
            icon = <span style={{ fontSize: '16px', flexShrink: 0 }}>{t.icon}</span>;
          } else {
            bg = '#f0f9ff';
            border = '1px solid #bae6fd';
            color = '#0369a1';
            iconColor = '#0284c7';
            closeColor = '#0284c7';
            closeHoverColor = '#0369a1';
            icon = <Info size={18} strokeWidth={2} style={{ color: iconColor, flexShrink: 0 }} />;
          }
        }

        return (
          <div
            style={{
              ...t.style,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              background: bg,
              border: border,
              borderRadius: '8px',
              padding: '14px 18px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03), 0 0 1px rgba(0, 0, 0, 0.1)',
              minWidth: '320px',
              maxWidth: '480px',
              transition: 'all 0.2s ease',
              opacity: t.visible ? 1 : 0,
              transform: t.visible ? 'scale(1)' : 'scale(0.9)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
              {icon}
              <div style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '13px',
                fontWeight: '500',
                color: color,
                lineHeight: '1.4',
                wordBreak: 'break-word',
              }}>
                {typeof t.message === 'function' ? t.message(t) : t.message}
              </div>
            </div>
            {t.type !== 'loading' && (
              <button
                onClick={() => toast.dismiss(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: closeColor,
                  borderRadius: '4px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = closeHoverColor;
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = closeColor;
                  e.currentTarget.style.background = 'none';
                }}
                aria-label="Close notification"
              >
                <X size={15} strokeWidth={2} />
              </button>
            )}
          </div>
        );
      }}
    </Toaster>
  );
}

