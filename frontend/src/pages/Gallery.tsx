import { useState } from 'react';
import { usePageReveal } from '../hooks/useReveal';
import { SEOHead } from '../components/SEOHead';
import galleryData from '../data/gallery.json';

export default function Gallery() {
    const [lightbox, setLightbox] = useState<any>(null);
    const [lightboxIdx, setLightboxIdx] = useState(0);

    usePageReveal();

    const openLightbox = (img: any, idx: number) => { setLightbox(img); setLightboxIdx(idx); };
    const nextImg = () => { const next = (lightboxIdx + 1) % galleryData.length; setLightbox(galleryData[next]); setLightboxIdx(next); };
    const prevImg = () => { const prev = (lightboxIdx - 1 + galleryData.length) % galleryData.length; setLightbox(galleryData[prev]); setLightboxIdx(prev); };

    return (
        <div className="page-enter" style={{ paddingTop: 120, minHeight: '100vh', paddingBottom: 80 }}>
            <SEOHead title="Gallery | Spice Garden Gokak" description="View photos of our beautiful ambiance, events, and delicious food at Spice Garden." />
            <div className="container">
                <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
                    <p className="section-eyebrow">VISUAL JOURNEY</p>
                    <h1>Photo Gallery</h1>
                    <p style={{ maxWidth: 500, margin: '12px auto 0' }}>A glimpse into our vibrant ambiance, celebrations, and festive moments.</p>
                </div>

                <style>{`
                    .bento-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        grid-auto-rows: 250px;
                        gap: 16px;
                        padding: 16px 0;
                    }
                    
                    .bento-item {
                        position: relative;
                        border-radius: 20px;
                        overflow: hidden;
                        cursor: pointer;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
                        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
                    }
                    
                    .bento-item img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                    }
                    
                    .bento-item::after {
                        content: '';
                        position: absolute;
                        inset: 0;
                        background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%);
                        opacity: 0;
                        transition: opacity 0.4s ease;
                    }

                    .bento-item:hover {
                        transform: translateY(-4px) scale(1.01);
                        box-shadow: 0 16px 48px rgba(212, 168, 67, 0.2);
                        z-index: 10;
                    }
                    
                    .bento-item:hover img {
                        transform: scale(1.05);
                    }
                    
                    .bento-item:hover::after {
                        opacity: 1;
                    }

                    .col-span-1 { grid-column: span 1; }
                    .col-span-2 { grid-column: span 2; }
                    .row-span-1 { grid-row: span 1; }
                    .row-span-2 { grid-row: span 2; }

                    /* Responsive sizing */
                    @media (max-width: 992px) {
                        .bento-grid {
                            grid-template-columns: repeat(3, 1fr);
                            grid-auto-rows: 200px;
                        }
                        /* On medium screens, re-adjust 4-column spans so they fit 3-columns nicely */
                        .col-span-2 { grid-column: span 2; }
                    }

                    @media (max-width: 768px) {
                        .bento-grid {
                            grid-template-columns: repeat(2, 1fr);
                            grid-auto-rows: 180px;
                            gap: 12px;
                        }
                        /* Flatten some larger spans for smaller screens */
                        .col-span-2 { grid-column: span 2; }
                    }
                    
                    @media (max-width: 480px) {
                        .bento-grid {
                            grid-template-columns: repeat(2, 1fr);
                            grid-auto-rows: 150px;
                            gap: 8px;
                        }
                    }
                `}</style>

                {/* Gallery Grid */}
                <div className="bento-grid">
                    {galleryData.map((img, i) => (
                        <div key={img.id} className={`bento-item reveal ${img.span}`} style={{ transitionDelay: `${(i % 8) * .05}s` }} onClick={() => openLightbox(img, i)}>
                            <img src={img.url} alt={img.id} loading="lazy" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Lightbox */}
            {lightbox && (
                <div
                    onClick={() => setLightbox(null)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out',
                        backdropFilter: 'blur(10px)',
                        animation: 'fadeIn .3s var(--ease)'
                    }}
                >
                    <button onClick={(e) => { e.stopPropagation(); prevImg(); }} style={{ position: 'absolute', left: '3%', top: '50%', transform: 'translateY(-50%)', background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.3)', color: 'var(--gold)', fontSize: '2rem', width: 60, height: 60, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>‹</button>
                    <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', animation: 'scaleIn .4s var(--ease)' }}>
                        <img src={lightbox.url} alt={lightbox.id} style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }} />
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); nextImg(); }} style={{ position: 'absolute', right: '3%', top: '50%', transform: 'translateY(-50%)', background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.3)', color: 'var(--gold)', fontSize: '2rem', width: 60, height: 60, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>›</button>
                    <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 24, right: 32, background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer', opacity: 0.7 }}>✕</button>
                    <p style={{ position: 'absolute', bottom: 32, fontFamily: 'DM Sans', fontSize: '1rem', color: 'rgba(255,255,255,0.6)', letterSpacing: 2 }}>{lightboxIdx + 1} / {galleryData.length}</p>
                </div>
            )}
        </div>
    );
}
