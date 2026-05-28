"use client";

import React, { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { AlertTriangle, LogOut, Trash2, X, Info } from 'lucide-react';

/**
 * A premium confirmation modal using Toastify custom popup.
 */
const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Are you sure?", 
    message = "This action cannot be undone.", 
    confirmText = "Confirm", 
    cancelText = "Cancel",
    type = "danger",
    icon
}) => {
    useEffect(() => {
        if (!isOpen) return;

        // Determine icon based on type or custom icon prop
        let displayIcon = icon;
        let iconBg = 'rgba(239, 68, 68, 0.1)';
        let iconColor = '#ef4444';
        let actionBtnBg = '#ef4444';
        let actionBtnColor = '#ffffff';

        if (!displayIcon) {
            if (type === 'danger') {
                displayIcon = <Trash2 size={16} color="#ef4444" />;
                iconBg = 'rgba(239, 68, 68, 0.1)';
                iconColor = '#ef4444';
                actionBtnBg = '#ef4444';
                actionBtnColor = '#ffffff';
            } else if (type === 'warning') {
                displayIcon = <AlertTriangle size={16} color="#eab308" />;
                iconBg = 'rgba(234, 179, 8, 0.1)';
                iconColor = '#eab308';
                actionBtnBg = '#CEA268';
                actionBtnColor = '#1A1712';
            } else {
                displayIcon = <Info size={16} color="#3b82f6" />;
                iconBg = 'rgba(59, 130, 246, 0.1)';
                iconColor = '#3b82f6';
                actionBtnBg = '#3b82f6';
                actionBtnColor = '#ffffff';
            }
        } else {
            if (type === 'warning') {
                iconBg = 'rgba(234, 179, 8, 0.1)';
                actionBtnBg = '#CEA268';
                actionBtnColor = '#1A1712';
            } else if (type === 'danger') {
                iconBg = 'rgba(239, 68, 68, 0.1)';
                actionBtnBg = '#ef4444';
                actionBtnColor = '#ffffff';
            } else {
                iconBg = 'rgba(59, 130, 246, 0.1)';
                actionBtnBg = '#3b82f6';
                actionBtnColor = '#ffffff';
            }
            // Force size prop of custom icon element to be smaller if possible
            if (React.isValidElement(displayIcon)) {
                displayIcon = React.cloneElement(displayIcon, { size: 16 });
            }
        }

        const toastId = toast.custom((t) => (
            <div style={{
                background: '#1A1712',
                border: '1px solid rgba(206, 162, 104, 0.3)',
                color: '#F5EFE3',
                padding: '12px 14px',
                borderRadius: '6px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                width: '280px',
                fontFamily: "'Montserrat', sans-serif",
                opacity: t.visible ? 1 : 0,
                transform: t.visible ? 'translateY(0)' : 'translateY(-10px)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{
                        background: iconBg,
                        padding: '6px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        {displayIcon}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '12px', color: '#F5EFE3', marginBottom: '2px', letterSpacing: '0.02em', lineHeight: '1.3' }}>
                            {title}
                        </div>
                        <div style={{ fontSize: '10px', color: '#9E8E78', letterSpacing: '0.01em', lineHeight: '1.4' }}>
                            {message}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            onClose();
                        }}
                        style={{
                            padding: '6px 12px',
                            background: 'transparent',
                            color: '#CEA268',
                            border: '1px solid rgba(206, 162, 104, 0.25)',
                            borderRadius: '2px',
                            fontSize: '10px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(206, 162, 104, 0.05)';
                            e.currentTarget.style.borderColor = 'rgba(206, 162, 104, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'rgba(206, 162, 104, 0.25)';
                        }}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            onConfirm();
                            onClose();
                        }}
                        style={{
                            padding: '6px 12px',
                            background: actionBtnBg,
                            color: actionBtnColor,
                            border: 'none',
                            borderRadius: '2px',
                            fontSize: '10px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            transition: 'opacity 0.2s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        ), {
            id: 'global-confirm',
            duration: Infinity,
        });

        return () => {
            toast.dismiss(toastId);
        };
    }, [isOpen, title, message, confirmText, cancelText, type, icon, onConfirm, onClose]);

    return null;
};

export default ConfirmModal;
