import { Package, Truck, Headset, ShieldCheck } from 'lucide-react';

export default function TrustBadge() {
    return (
        <>
        <style>{`
            .zj-trust-badge-section {
                background: #F8F9FA; /* Softer background to highlight the white card */
                padding: 40px 24px;
            }
            .zj-trust-card {
                background: #ffffff;
                max-width: 1280px;
                margin: 0 auto;
                padding: 50px 40px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.04); /* Subtle, elegant shadow */
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 24px;
            }
            .zj-trust-item {
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: 16px;
                text-align: left;
            }
            .zj-trust-icon {
                color: #2D3748; /* Deep Navy Blue/Black */
                flex-shrink: 0;
            }
            .zj-trust-icon svg {
                width: 36px;
                height: 36px;
                stroke-width: 0.5;
            }
            .zj-trust-info {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            .zj-trust-title {
                font-size: 15px;
                font-weight: 500;
                color: #1A202C;
                letter-spacing: 0.01em;
            }
            .zj-trust-desc {
                font-size: 12px;
                color: #A0AEC0; /* Light Grayish-Blue description */
                line-height: 1.4;
            }

            @media (max-width: 1100px) {
                .zj-trust-card {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 32px;
                    padding: 40px 30px;
                }
            }
            @media (max-width: 640px) {
                .zj-trust-card {
                    grid-template-columns: 1fr;
                    gap: 24px;
                    padding: 30px 20px;
                }
                .zj-trust-item {
                    justify-content: center;
                    text-align: center;
                    flex-direction: column;
                }
            }
        `}</style>
        <section className="zj-trust-badge-section">
            <div className="zj-trust-card">
                <div className="zj-trust-item">
                    <div className="zj-trust-icon"><Package /></div>
                    <div className="zj-trust-info">
                        <div className="zj-trust-title">Discount</div>
                        <div className="zj-trust-desc">Every week new sales</div>
                    </div>
                </div>
                <div className="zj-trust-item">
                    <div className="zj-trust-icon"><Truck /></div>
                    <div className="zj-trust-info">
                        <div className="zj-trust-title">Free Delivery</div>
                        <div className="zj-trust-desc">100% Free for all orders</div>
                    </div>
                </div>
                <div className="zj-trust-item">
                    <div className="zj-trust-icon"><Headset /></div>
                    <div className="zj-trust-info">
                        <div className="zj-trust-title">Great Support 24/7</div>
                        <div className="zj-trust-desc">We care your experiences</div>
                    </div>
                </div>
                <div className="zj-trust-item">
                    <div className="zj-trust-icon"><ShieldCheck /></div>
                    <div className="zj-trust-info">
                        <div className="zj-trust-title">Secure Payment</div>
                        <div className="zj-trust-desc">100% Secure Payment Method</div>
                    </div>
                </div>
            </div>
        </section>
        </>
    );
}