import { useState } from 'react';
import { usePageReveal } from '../hooks/useReveal';
import { SEOHead } from '../components/SEOHead';
import menuData from '../data/menu.json';

const CATS = ['All', ...Array.from(new Set(menuData.map(d => d.category)))];

interface MenuItem {
    id: string;
    name: string;
    price: string;
    category: string;
    is_veg: boolean;
    description: string;
    image_url?: string;
}

export default function Menu() {
    const [cat, setCat] = useState('All');

    usePageReveal([cat]);

    const items: MenuItem[] = menuData.map((d, i) => ({ id: i.toString(), ...d }));
    const filtered = cat === 'All' ? items : items.filter(i => i.category === cat);

    return (
        <div className="page-enter" style={{ paddingTop: 120, minHeight: '100vh' }}>
            <SEOHead 
                title="Our Menu | Spice Garden Gokak" 
                description="Browse our delicious Indian and Chinese cuisine menu. Order online or visit Spice Garden in Gokak."
            />
            <div className="container">
                <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
                    <p className="section-eyebrow">OUR MENU</p>
                    <h1>Delicious Indian & Chinese Cuisine</h1>
                    <p style={{ maxWidth: 500, margin: '12px auto 0' }}>Authentic flavors, fresh ingredients, served with love</p>
                </div>

                {/* Category Filters */}
                <div className="reveal" style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
                    {CATS.map(c => (
                        <button key={c} onClick={() => setCat(c)} style={{
                            padding: '10px 22px', borderRadius: 28,
                            border: `1.5px solid ${cat === c ? 'var(--gold)' : 'rgba(212,168,67,0.15)'}`,
                            background: cat === c ? 'linear-gradient(135deg, var(--gold), var(--gold-light))' : 'transparent',
                            color: cat === c ? '#0D1A0F' : 'var(--gold)',
                            fontFamily: 'DM Sans', fontWeight: 600, fontSize: '.82rem',
                            cursor: 'pointer', transition: 'all .3s var(--ease)'
                        }}>{c}</button>
                    ))}
                </div>

                {/* Menu Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
                    {filtered.map((item, i) => (
                        <div key={item.id} className="glass menu-card reveal" style={{ 
                            transitionDelay: `${(i % 8) * .05}s`, 
                            padding: item.image_url ? 0 : '16px', 
                            overflow: 'hidden',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            borderTop: item.image_url ? '' : '3px solid var(--gold)',
                            background: item.image_url ? '' : 'linear-gradient(145deg, rgba(212,168,67,0.08) 0%, rgba(13,26,15,0.6) 100%)'
                        }}>
                            {item.image_url && (
                                <img src={item.image_url} alt={item.name}
                                    style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                            )}
                            <div style={{ padding: item.image_url ? '14px 16px' : 0, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                                    <span style={{
                                        width: 16, height: 16, borderRadius: 3,
                                        border: `2px solid ${item.is_veg ? '#27ae60' : '#e74c3c'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                        marginTop: 4
                                    }}>
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.is_veg ? '#27ae60' : '#e74c3c' }} />
                                    </span>
                                    <h3 style={{ fontSize: '1.05rem', margin: 0, lineHeight: 1.25 }}>
                                        {item.name}
                                    </h3>
                                </div>
                                {item.description && <p style={{ fontSize: '.9rem', color: 'var(--muted)', marginBottom: 20, fontFamily: 'DM Sans', flexGrow: 1 }}>{item.description}</p>}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: item.description ? 0 : 12 }}>
                                    <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.25rem', fontWeight: 700, color: 'var(--gold)' }}>
                                        {item.price.toLowerCase() === 'apc' ? 'As Per Catch' : `₹${item.price}`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '60px 0' }}>No items in this category yet.</p>}

            </div>
            {/* Pad bottom so cart bar doesn't overlap items */}
            <div style={{ paddingBottom: 100 }} />
        </div>
    );
}
