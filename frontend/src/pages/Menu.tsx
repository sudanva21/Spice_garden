import { useState, useEffect } from 'react';
import { usePageReveal } from '../hooks/useReveal';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SEOHead } from '../components/SEOHead';

const CATS = ['All', 'Starters', 'Main Course (Veg)', 'Main Course (Non-Veg)', 'Biryani', 'Breads', 'Chinese', 'Soups', 'Desserts'];

export default function Menu() {
    const [items, setItems] = useState<any[]>([]);
    const [cat, setCat] = useState('All');

    usePageReveal();

    useEffect(() => {
        getDocs(collection(db, 'menu')).then(qs => {
            setItems(qs.docs.map(d => ({ id: d.id, ...d.data() })));
        }).catch(() => { });
    }, []);

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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 20 }}>
                    {filtered.map((item, i) => (
                        <div key={item.id} className="glass menu-card" style={{ transitionDelay: `${(i % 8) * .05}s`, padding: 0, overflow: 'hidden' }}>
                            {item.image_url && (
                                <img src={item.image_url} alt={item.name}
                                    style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                            )}
                            <div style={{ padding: '16px 20px 20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <span style={{
                                        width: 14, height: 14, borderRadius: 3,
                                        border: `2px solid ${item.is_veg ? '#27ae60' : '#e74c3c'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '.5rem', flexShrink: 0
                                    }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.is_veg ? '#27ae60' : '#e74c3c' }} />
                                    </span>
                                    <h3 style={{ fontSize: '1rem', margin: 0 }}>{item.name}</h3>
                                </div>
                                {item.description && <p style={{ fontSize: '.82rem', color: 'var(--muted)', marginBottom: 12, fontFamily: 'DM Sans' }}>{item.description}</p>}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.3rem', fontWeight: 700, color: 'var(--gold)' }}>₹{item.price}</span>
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
