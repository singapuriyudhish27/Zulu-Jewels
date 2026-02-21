"use client";

import React from 'react';
import { AlertTriangle, LogOut, Trash2, X } from 'lucide-react';
import './ConfirmModal.css';

/**
 * A premium confirmation modal for important actions.
 * 
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Function to call when user cancels
 * @param {function} onConfirm - Function to call when user confirms
 * @param {string} title - Title of the modal
 * @param {string} message - Description message
 * @param {string} confirmText - Text for confirm button
 * @param {string} type - 'danger' | 'warning' | 'info'
 * @param {React.ReactNode} icon - Optional custom icon
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
    if (!isOpen) return null;

    const getIcon = () => {
        if (icon) return icon;
        switch (type) {
            case 'danger': return <Trash2 size={32} />;
            case 'warning': return <LogOut size={32} />;
            default: return <AlertTriangle size={32} />;
        }
    };

    return (
        <div className={`premium-modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
            <div className="premium-modal-container" onClick={(e) => e.stopPropagation()}>
                <button className="premium-modal-close" onClick={onClose}>
                    <X size={20} />
                </button>
                
                <div className={`premium-modal-icon-wrapper ${type}`}>
                    {getIcon()}
                </div>
                
                <div className="premium-modal-content">
                    <h2 className="premium-modal-title">{title}</h2>
                    <p className="premium-modal-message">{message}</p>
                </div>
                
                <div className="premium-modal-actions">
                    <button className="premium-modal-btn cancel" onClick={onClose}>
                        {cancelText}
                    </button>
                    <button className={`premium-modal-btn confirm ${type}`} onClick={() => {
                        onConfirm();
                        onClose();
                    }}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
