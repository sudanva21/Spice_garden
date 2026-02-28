import { useState, useEffect } from 'react';
import { usePageReveal } from '../hooks/useReveal';
import { getGallery } from '../api';

const CATS = ['All', 'Food', 'Ambiance', 'Events'];

export default function Gallery() {
    const [images, setImages] = useState<any[]>([]);
    const [cat, setCat] = useState('All');
    const [lightbox, setLightbox] = useState<any>(null);
    const [lightboxIdx, setLightboxIdx] = useState(0);

    usePageReveal();

    useEffect(() => {
        getGallery(cat === 'All' ? undefined : cat).then(r => setImages(r.data.images || [])).catch(() => { });
    }, [cat]);

    const openLightbox = (img: any, idx: number) => { setLightbox(img); setLightboxIdx(idx); };
    const nextImg = () => { const next = (lightboxIdx + 1) % images.length; setLightbox(images[next]); setLightboxIdx(next); };
    const prevImg = () => { const prev = (lightboxIdx - 1 + images.length) % images.length; setLightbox(images[prev]); setLightboxIdx(prev); };

    return (
        <div className="page-enter" style={{ paddingTop: 120, minHeight: '100vh' }}>
            <div className="container">
                <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
                    <p className="section-eyebrow">VISUAL JOURNEY</p>
                    <h1>Photo Gallery</h1>
                    <p style={{ maxWidth: 500, margin: '12px auto 0' }}>A glimpse into our restaurant, food, and dining experience</p>
                </div>

                {/* Filters */}
                <div className="reveal" style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
                    {CATS.map(c => (
                        <button key={c} onClick={() => setCat(c)} style={{
                            padding: '10px 24px', borderRadius: 28,
                            border: `1.5px solid ${cat === c ? 'var(--gold)' : 'rgba(212,168,67,0.15)'}`,
                            background: cat === c ? 'linear-gradient(135deg, var(--gold), var(--gold-light))' : 'transparent',
                            color: cat === c ? '#0D1A0F' : 'var(--gold)',
                            fontFamily: 'DM Sans', fontWeight: 600, fontSize: '.85rem',
                            cursor: 'pointer', transition: 'all .3s var(--ease)'
                        }}>{c}</button>
                    ))}
                </div>

                {/* Gallery Grid */}
                <div className="gallery-grid">
                    {images.map((img, i) => (
                        <div key={img.id} className="gallery-item" style={{ transitionDelay: `${(i % 6) * .06}s` }} onClick={() => openLightbox(img, i)}>
                            <img src={img.image_url} alt={img.caption || 'Gallery image'} />
                            <span className="caption">{img.caption}</span>
                        </div>
                    ))}
                </div>
                {images.length === 0 && <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '80px 0' }}>No images found for this category.</p>}
            </div>

            {/* Lightbox */}
            {lightbox && (
                <div
                    onClick={() => setLightbox(null)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out',
                        animation: 'fadeIn .2s ease'
                    }}
                >
                    <button onClick={(e) => { e.stopPropagation(); prevImg(); }} style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '1.8rem', width: 50, height: 50, borderRadius: '50%', cursor: 'pointer' }}>‹</button>
                    <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '85vw', maxHeight: '85vh', animation: 'scaleIn .3s var(--ease)' }}>
                        <img src={lightbox.image_url} alt={lightbox.caption} style={{ maxWidth: '85vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: 12 }} />
                        {lightbox.caption && <p style={{ textAlign: 'center', fontSize: '.9rem', color: 'var(--muted)', marginTop: 16, fontFamily: 'DM Sans' }}>{lightbox.caption}</p>}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); nextImg(); }} style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '1.8rem', width: 50, height: 50, borderRadius: '50%', cursor: 'pointer' }}>›</button>
                    <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 24, right: 24, background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                    <p style={{ position: 'absolute', bottom: 24, fontFamily: 'DM Sans', fontSize: '.8rem', color: 'rgba(255,255,255,0.4)' }}>{lightboxIdx + 1} / {images.length}</p>
                </div>
            )}
        </div>
    );
}
