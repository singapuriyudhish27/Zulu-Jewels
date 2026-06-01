import Link from 'next/link';

export const metadata = {
    title: '404 — Page Not Found | Zulu Jewellers',
    description: 'The page you are looking for could not be found.',
};

export default function NotFound() {
    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Montserrat:wght@300;400;500&display=swap');

                * { margin: 0; padding: 0; box-sizing: border-box; }

                .nf-page {
                    min-height: 100vh;
                    background: #0a0a0a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Montserrat', sans-serif;
                    padding: 2rem;
                    position: relative;
                    overflow: hidden;
                }

                .nf-page::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%);
                    pointer-events: none;
                }

                .nf-container {
                    text-align: center;
                    max-width: 560px;
                    position: relative;
                    z-index: 1;
                }

                .nf-code {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: clamp(6rem, 18vw, 12rem);
                    font-weight: 300;
                    color: transparent;
                    -webkit-text-stroke: 1px rgba(201,168,76,0.4);
                    line-height: 1;
                    letter-spacing: 0.05em;
                    margin-bottom: 1.5rem;
                }

                .nf-divider {
                    width: 60px;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, #c9a84c, transparent);
                    margin: 0 auto 1.5rem;
                }

                .nf-title {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: clamp(1.4rem, 4vw, 2rem);
                    font-weight: 400;
                    color: #e8d5a3;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    margin-bottom: 1rem;
                }

                .nf-message {
                    font-size: 0.9rem;
                    color: rgba(255,255,255,0.45);
                    line-height: 1.7;
                    letter-spacing: 0.04em;
                    margin-bottom: 2.5rem;
                    font-weight: 300;
                }

                .nf-links {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.75rem;
                }

                .nf-btn-primary {
                    display: inline-block;
                    padding: 0.875rem 2.5rem;
                    background: linear-gradient(135deg, #c9a84c 0%, #e8d5a3 50%, #c9a84c 100%);
                    color: #0a0a0a;
                    text-decoration: none;
                    font-size: 0.7rem;
                    font-weight: 600;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    border-radius: 1px;
                    transition: opacity 0.3s ease, transform 0.2s ease;
                }

                .nf-btn-primary:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }

                .nf-btn-secondary {
                    display: inline-block;
                    padding: 0.75rem 2rem;
                    border: 1px solid rgba(201,168,76,0.3);
                    color: rgba(201,168,76,0.8);
                    text-decoration: none;
                    font-size: 0.7rem;
                    font-weight: 400;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    border-radius: 1px;
                    transition: all 0.3s ease;
                }

                .nf-btn-secondary:hover {
                    border-color: rgba(201,168,76,0.7);
                    color: #c9a84c;
                    background: rgba(201,168,76,0.05);
                }
            `}} />

            <div className="nf-page">
                <div className="nf-container">
                    <div className="nf-code">404</div>
                    <div className="nf-divider" />
                    <h1 className="nf-title">Page Not Found</h1>
                    <p className="nf-message">
                        The page you are looking for may have been moved, deleted, or never existed.
                        Let us guide you back to our collection.
                    </p>
                    <div className="nf-links">
                        <Link href="/Pages" className="nf-btn-primary">
                            Explore Collection
                        </Link>
                        <Link href="/" className="nf-btn-secondary">
                            Return Home
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
