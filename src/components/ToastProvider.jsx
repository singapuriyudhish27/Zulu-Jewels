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
        let bg = '#0A1118';
        let border = '1px solid #3b82f6';
        let color = '#93C5FD';
        let iconColor = '#3b82f6';
        let closeColor = '#3b82f6';
        let closeHoverColor = '#60a5fa';
        let icon = null;

        const hasCustomEmoji = typeof t.icon === 'string';

        if (t.type === 'success') {
          bg = '#0B130E';
          border = '1px solid #10b981';
          color = '#A7F3D0';
          iconColor = '#10b981';
          closeColor = '#10b981';
          closeHoverColor = '#34d399';
          icon = <CheckCircle2 size={18} strokeWidth={2} style={{ color: iconColor, flexShrink: 0 }} />;
        } else if (t.type === 'error') {
          bg = '#160B0C';
          border = '1px solid #ef4444';
          color = '#FCA5A5';
          iconColor = '#ef4444';
          closeColor = '#ef4444';
          closeHoverColor = '#f87171';
          icon = <AlertCircle size={18} strokeWidth={2} style={{ color: iconColor, flexShrink: 0 }} />;
        } else if (t.icon === 'ℹ️' || t.icon === 'ℹ') {
          bg = '#0A1118';
          border = '1px solid #3b82f6';
          color = '#93C5FD';
          iconColor = '#3b82f6';
          closeColor = '#3b82f6';
          closeHoverColor = '#60a5fa';
          icon = <Info size={18} strokeWidth={2} style={{ color: iconColor, flexShrink: 0 }} />;
        } else if (t.icon === '⚠️' || t.icon === '⚠') {
          bg = '#141108';
          border = '1px solid #eab308';
          color = '#FDE047';
          iconColor = '#eab308';
          closeColor = '#eab308';
          closeHoverColor = '#facc15';
          icon = <AlertTriangle size={18} strokeWidth={2} style={{ color: iconColor, flexShrink: 0 }} />;
        } else {
          if (hasCustomEmoji) {
            bg = '#0D0C09';
            border = '1px solid rgba(206, 162, 104, 0.3)';
            color = '#F5EFE3';
            iconColor = '#CEA268';
            closeColor = '#7A6A55';
            closeHoverColor = '#CEA268';
            icon = <span style={{ fontSize: '16px', flexShrink: 0 }}>{t.icon}</span>;
          } else {
            bg = '#0A1118';
            border = '1px solid #3b82f6';
            color = '#93C5FD';
            iconColor = '#3b82f6';
            closeColor = '#3b82f6';
            closeHoverColor = '#60a5fa';
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
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
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

