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

        let cardBg = '#f0f9ff';
        let cardBorder = '1px solid #bae6fd';
        let textColor = '#0369a1';
        let iconBg = 'rgba(2, 132, 199, 0.1)';
        let actionBtnBg = '#0284c7';
        let actionBtnColor = '#ffffff';

        if (type === 'danger') {
            cardBg = '#fef2f2';
            cardBorder = '1px solid #fecaca';
            textColor = '#b91c1c';
            iconBg = 'rgba(220, 38, 38, 0.1)';
            actionBtnBg = '#dc2626';
            actionBtnColor = '#ffffff';
        } else if (type === 'warning') {
            cardBg = '#fffbeb';
            cardBorder = '1px solid #fef3c7';
            textColor = '#b45309';
            iconBg = 'rgba(217, 119, 6, 0.1)';
            actionBtnBg = '#d97706';
            actionBtnColor = '#ffffff';
        }

        let displayIcon = icon;
        if (!displayIcon) {
            if (type === 'danger') {
                displayIcon = <Trash2 size={16} color="#dc2626" />;
            } else if (type === 'warning') {
                displayIcon = <AlertTriangle size={16} color="#d97706" />;
            } else {
                displayIcon = <Info size={16} color="#0284c7" />;
            }
        } else {
            if (React.isValidElement(displayIcon)) {
                displayIcon = React.cloneElement(displayIcon, { size: 16 });
            }
        }

        const toastId = toast.custom((t) => (
            <div style={{
                background: cardBg,
                border: cardBorder,
                color: textColor,
                padding: '16px 18px',
                borderRadius: '10px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03), 0 0 1px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                width: '340px',
                fontFamily: "'Montserrat', sans-serif",
                opacity: t.visible ? 1 : 0,
                transform: t.visible ? 'translateY(0)' : 'translateY(12px)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                        background: iconBg,
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        {displayIcon}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: textColor, marginBottom: '4px', letterSpacing: '0.01em', lineHeight: '1.4' }}>
                            {title}
                        </div>
                        <div style={{ fontSize: '11.5px', color: textColor, opacity: 0.85, letterSpacing: '0.01em', lineHeight: '1.5' }}>
                            {message}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center', marginTop: '4px' }}>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            onClose();
                        }}
                        style={{
                            background: 'transparent',
                            color: textColor,
                            opacity: 0.75,
                            border: 'none',
                            fontSize: '11px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'opacity 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '0.75';
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
                            padding: '6px 14px',
                            background: actionBtnBg,
                            color: actionBtnColor,
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            letterSpacing: '0.02em',
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
            position: 'bottom-center',
        });

        return () => {
            toast.dismiss(toastId);
        };
    }, [isOpen, title, message, confirmText, cancelText, type, icon, onConfirm, onClose]);

    return null;
};

export default ConfirmModal;
