import { Gem, Sparkles, Star } from 'lucide-react';

export default function PageLoader({ admin = false, label = 'Preparing your experience' }) {
  return (
    <div className={`zj-page-loader${admin ? ' zj-page-loader--admin' : ''}`} role="status" aria-live="polite">
      <div className="zj-page-loader__icons" aria-hidden="true">
        <Gem className="zj-page-loader__icon zj-page-loader__icon--gem" size={42} strokeWidth={1.4} />
        <Sparkles className="zj-page-loader__icon zj-page-loader__icon--sparkles" size={26} strokeWidth={1.5} />
        <Star className="zj-page-loader__icon zj-page-loader__icon--star" size={18} fill="currentColor" strokeWidth={1.5} />
      </div>
      <p className="zj-page-loader__label">{label}</p>
      <span className="zj-page-loader__dots" aria-hidden="true"><i /><i /><i /></span>
      <span className="sr-only">Loading</span>
    </div>
  );
}
