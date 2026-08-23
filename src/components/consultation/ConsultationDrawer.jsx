'use client';

import { useState } from 'react';
import PhoneInput from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import 'react-phone-number-input/style.css';
import { X, Check } from 'lucide-react';

export default function ConsultationDrawer({ isOpen, onClose }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    interest: 'Engagement Ring',
    budget: '$5,000 - $10,000',
    notes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
      setFormState({
        name: '',
        email: '',
        phone: '',
        interest: 'Engagement Ring',
        budget: '$5,000 - $10,000',
        notes: ''
      });
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="bp-drawer-overlay open" onClick={onClose}>
      <div className="bp-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="bp-drawer-header">
          <h3 className="bp-drawer-title bp-serif">Bespoke Inquiry</h3>
          <button className="bp-drawer-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="bp-drawer-body">
          {isSubmitted ? (
            <div className="bp-success-message">
              <div className="bp-success-icon">
                <Check size={48} style={{ margin: '0 auto', display: 'block', border: '1px solid #CEA268', borderRadius: '50%', padding: '10px' }} />
              </div>
              <h4 className="bp-success-title bp-serif">Inquiry Registered</h4>
              <p className="bp-success-desc">
                Thank you for your interest in Zulu Jewellers. A private client advisor will contact you within 24 hours to schedule your design consultation.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="bp-form-group">
                <label className="bp-form-label" htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleInputChange}
                  className="bp-form-input"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="bp-form-group">
                <label className="bp-form-label" htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formState.email}
                  onChange={handleInputChange}
                  className="bp-form-input"
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="bp-form-group">
                <label className="bp-form-label" htmlFor="phone">Phone / WhatsApp</label>
                <PhoneInput
                  placeholder="Enter phone number"
                  value={formState.phone}
                  onChange={(value) => setFormState(prev => ({ ...prev, phone: value || '' }))}
                  flags={flags}
                  required
                />
              </div>

              <div className="bp-form-group">
                <label className="bp-form-label" htmlFor="interest">Item Interest</label>
                <select
                  id="interest"
                  name="interest"
                  value={formState.interest}
                  onChange={handleInputChange}
                  className="bp-form-select"
                >
                  <option>Engagement Ring</option>
                  <option>Wedding Band Set</option>
                  <option>Bespoke Necklace</option>
                  <option>Custom Earrings</option>
                  <option>Other Fine Jewelry</option>
                </select>
              </div>

              <div className="bp-form-group">
                <label className="bp-form-label" htmlFor="budget">Target Budget (USD)</label>
                <select
                  id="budget"
                  name="budget"
                  value={formState.budget}
                  onChange={handleInputChange}
                  className="bp-form-select"
                >
                  <option>$3,000 - $5,000</option>
                  <option>$5,000 - $10,000</option>
                  <option>$10,000 - $25,000</option>
                  <option>$25,000 - $50,000</option>
                  <option>$50,000+</option>
                </select>
              </div>

              <div className="bp-form-group">
                <label className="bp-form-label" htmlFor="notes">Design Inspiration & Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formState.notes}
                  onChange={handleInputChange}
                  className="bp-form-textarea"
                  placeholder="Describe your design vision, timeline, diamond preference, or metal specifications..."
                  required
                />
              </div>

              <button type="submit" className="bp-form-submit">
                Submit Private Request
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
