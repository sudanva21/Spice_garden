import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePageReveal } from '../hooks/useReveal';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '/api/v1';

// Simple cart stored in state (shared via window for cross-page)
function getCart(): any[] { try { return JSON.parse(localStorage.getItem('sg_cart') || '[]'); } catch { return []; } }
function setCartStorage(items: any[]) { localStorage.setItem('sg_cart', JSON.stringify(items)); window.dispatchEvent(new Event('cart-update')); }

const CATS = ['All', 'Starters', 'Main Course (Veg)', 'Main Course (Non-Veg)', 'Biryani', 'Breads', 'Chinese', 'Soups', 'Desserts'];

export default function Menu() {
    const [items, setItems] = useState<any[]>([]);
    const [cat, setCat] = useState('All');
    const [cart, setCart] = useState<any[]>(getCart());
    const { user, openAuthModal } = useAuth();

    usePageReveal();

    useEffect(() => {
        axios.get(`${API}/menu`).then(r => setItems(r.data.items || [])).catch(() => { });
    }, []);

    const filtered = cat === 'All' ? items : items.filter(i => i.category === cat);

    const addToCart = (item: any) => {
        if (!user) {
            openAuthModal();
            return;
        }
        const existing = cart.find(c => c.id === item.id);
        let updated;
        if (existing) {
            updated = cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
        } else {
            updated = [...cart, { ...item, qty: 1 }];
        }
        setCart(updated);
        setCartStorage(updated);

    };

    const updateQty = (id: string, qty: number) => {
        if (!user) {
            openAuthModal();
            return;
        }
        let updated;
        if (qty <= 0) {
            updated = cart.filter(c => c.id !== id);
        } else {
            updated = cart.map(c => c.id === id ? { ...c, qty } : c);
        }
        setCart(updated);
        setCartStorage(updated);
    };

    const cartCount = cart.reduce((s, c) => s + c.qty, 0);

    return (
        <div className="page-enter" style={{ paddingTop: 120, minHeight: '100vh' }}>
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
                        <div key={item.id} className="glass" style={{ transitionDelay: `${(i % 8) * .05}s`, padding: 0, overflow: 'hidden' }}>
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
                                    {(() => {
                                        const cartItem = cart.find(c => c.id === item.id);
                                        if (cartItem) {
                                            return (
                                                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(39, 174, 96, 0.15)', borderRadius: 20, overflow: 'hidden', border: '1px solid #27ae60' }}>
                                                    <button onClick={() => updateQty(item.id, cartItem.qty - 1)} style={{ padding: '8px 12px', background: 'transparent', border: 'none', color: '#27ae60', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>−</button>
                                                    <span style={{ padding: '0 8px', color: '#27ae60', fontFamily: 'DM Sans', fontWeight: 700, fontSize: '.9rem', minWidth: 20, textAlign: 'center' }}>{cartItem.qty}</span>
                                                    <button onClick={() => addToCart(item)} style={{ padding: '8px 12px', background: 'transparent', border: 'none', color: '#27ae60', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>+</button>
                                                </div>
                                            );
                                        }
                                        return (
                                            <button onClick={() => addToCart(item)} style={{
                                                padding: '8px 24px', borderRadius: 20, border: '1px solid var(--gold)', cursor: 'pointer',
                                                background: 'transparent', color: 'var(--gold)', fontFamily: 'DM Sans', fontSize: '.85rem', fontWeight: 600,
                                                transition: 'all .3s ease'
                                            }}>ADD</button>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '60px 0' }}>No items in this category yet.</p>}

                {cartCount > 0 && (
                    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px', background: 'linear-gradient(to top, rgba(13,26,15,1) 40%, rgba(13,26,15,0))', zIndex: 100, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
                        <Link to="/order" style={{
                            width: '100%', maxWidth: 800, padding: '14px 20px', borderRadius: 16,
                            background: '#27ae60', color: 'white', textDecoration: 'none',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            boxShadow: '0 8px 32px rgba(39, 174, 96, 0.3)', animation: 'fadeInUp 0.3s ease',
                            pointerEvents: 'auto'
                        }}>
                            <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '.85rem' }}>
                                {cartCount} ITEM{cartCount > 1 ? 'S' : ''} &nbsp;|&nbsp; ₹{cart.reduce((s, c) => s + (c.price * c.qty), 0)}
                            </div>
                            <div style={{ fontFamily: 'DM Sans', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, fontSize: '.85rem' }}>
                                View Cart ➔
                            </div>
                        </Link>
                    </div>
                )}
            </div>
            {/* Pad bottom so cart bar doesn't overlap items */}
            <div style={{ paddingBottom: 100 }} />
        </div>
    );
}
