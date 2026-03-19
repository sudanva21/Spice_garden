import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageReveal, useCounter } from '../hooks/useReveal';
import { subscribeNewsletter } from '../api';
import { SEOHead } from '../components/SEOHead';
import { RestaurantSchema } from '../components/RestaurantSchema';

export default function Home() {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    usePageReveal();

    const dinerCount = useCounter(15000, 2200);
    const menuCount = useCounter(60, 2000);
    const ratingCount = useCounter(4, 1800);

    return (
        <div className="page-enter">
            <SEOHead 
                title="Spice Garden | Best Indian-Chinese Restaurant in Gokak, Karnataka" 
                description="Experience the finest Indian & Chinese cuisine at Spice Garden. Fresh ingredients, rich spices, and a warm dining atmosphere await you in Gokak, Karnataka."
            />
            <RestaurantSchema />
            {/* ─── HERO ─── */}
            <section className="hero">
                <div className="hero-bg" />
                <div className="hero-overlay" />
                <div className="hero-content">
                    <p className="hero-eyebrow">GOKAK · KARNATAKA</p>
                    <h1 style={{ fontStyle: 'italic' }}>
                        Best Indian-Chinese Restaurant in Gokak
                    </h1>
                    <p>
                        Experience the finest Indian & Chinese cuisine at Spice Garden.
                        Fresh ingredients, rich spices, and a warm dining atmosphere await you.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/book" className="btn btn-gold">Book a Table</Link>
                        <Link to="/menu" className="btn btn-outline">View Our Menu</Link>
                    </div>
                </div>
            </section>

            {/* ─── STATS BAR ─── */}
            <section style={{ background: 'var(--surface)', borderTop: '1px solid rgba(212,168,67,0.08)', borderBottom: '1px solid rgba(212,168,67,0.08)' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24, padding: '48px 24px', textAlign: 'center' }}>
                    <div className="reveal" style={{ transitionDelay: '0s' }}>
                        <p style={{ fontFamily: 'Cormorant Garamond', fontSize: '3rem', fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}>
                            <span ref={dinerCount}>0</span>+
                        </p>
                        <p style={{ fontFamily: 'DM Sans', fontSize: '.85rem', color: 'var(--muted)', marginTop: 4 }}>Happy Diners</p>
                    </div>
                    <div className="reveal" style={{ transitionDelay: '.1s' }}>
                        <p style={{ fontFamily: 'Cormorant Garamond', fontSize: '3rem', fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}>
                            <span ref={menuCount}>0</span>+
                        </p>
                        <p style={{ fontFamily: 'DM Sans', fontSize: '.85rem', color: 'var(--muted)', marginTop: 4 }}>Menu Items</p>
                    </div>
                    <div className="reveal" style={{ transitionDelay: '.2s' }}>
                        <p style={{ fontFamily: 'Cormorant Garamond', fontSize: '3rem', fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}>
                            <span ref={ratingCount}>0</span>.5★
                        </p>
                        <p style={{ fontFamily: 'DM Sans', fontSize: '.85rem', color: 'var(--muted)', marginTop: 4 }}>Google Rating</p>
                    </div>
                </div>
            </section>

            {/* ─── ABOUT ─── */}
            <section className="section">
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 40, alignItems: 'center' }}>
                    <div className="reveal-left">
                        <p className="section-eyebrow">ABOUT THE RESTAURANT</p>
                        <h2 style={{ marginBottom: 24 }}>Where Every Meal Is a Celebration</h2>
                        <p style={{ marginBottom: 20 }}>
                            Spice Garden is Gokak's premier family dining restaurant, serving authentic Indian and Chinese cuisine
                            crafted with the freshest ingredients and traditional spices.
                        </p>
                        <p style={{ marginBottom: 28 }}>
                            Whether you're craving creamy butter chicken, sizzling tandoori kebabs, or flavorful vegetarian curries,
                            our chefs bring passion to every dish. Perfect for family dinners, celebrations, and casual dining.
                        </p>
                        <Link to="/about" className="btn btn-outline">Read Our Story →</Link>
                    </div>
                    <div className="reveal-right" style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '1px solid rgba(212,168,67,0.12)' }}>
                        <img
                            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"
                            alt="Spice Garden Restaurant Interior"
                            style={{ width: '100%', aspectRatio: '16/10', minHeight: 250, objectFit: 'cover', animation: 'hero-drift 20s ease-in-out infinite', display: 'block' }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,26,15,0.3), transparent 40%)', pointerEvents: 'none' }} />
                    </div>
                </div>
            </section>

            {/* ─── POPULAR DISHES ─── */}
            <section className="section" style={{ background: 'var(--surface)' }}>
                <div className="container">
                    <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
                        <p className="section-eyebrow">CHEF'S SPECIAL</p>
                        <h2>Popular Dishes</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 28 }}>
                        {[
                            { img: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400', name: 'Butter Chicken', price: '₹280', desc: 'Tender chicken in rich, creamy tomato-butter gravy' },
                            { img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400', name: 'Paneer Tikka', price: '₹220', desc: 'Smoky tandoori-grilled cottage cheese with spices' },
                            { img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', name: 'Chicken Biryani', price: '₹250', desc: 'Aromatic basmati rice layered with spiced chicken' },
                        ].map((dish, i) => (
                            <div key={dish.name} className="glass reveal" style={{ padding: 0, overflow: 'hidden', transitionDelay: `${i * .1}s` }}>
                                <img src={dish.img} alt={dish.name} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                                <div style={{ padding: '16px 20px 20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <h3 style={{ margin: 0 }}>{dish.name}</h3>
                                        <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.2rem', fontWeight: 700, color: 'var(--gold)' }}>{dish.price}</span>
                                    </div>
                                    <p>{dish.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="reveal" style={{ textAlign: 'center', marginTop: 40 }}>
                        <Link to="/menu" className="btn btn-gold">View Full Menu →</Link>
                    </div>
                </div>
            </section>

            {/* ─── ORDER ONLINE CTA ─── */}
            <section className="section" style={{
                background: 'linear-gradient(135deg, rgba(13,26,15,0.95), rgba(28,48,32,0.95)), url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400") center/cover',
                textAlign: 'center'
            }}>
                <div className="container">
                    <div className="reveal">
                        <p className="section-eyebrow">ORDER FROM HOME</p>
                        <h2 style={{ maxWidth: 600, margin: '0 auto 20px' }}>
                            Craving Something Delicious?
                        </h2>
                        <p style={{ maxWidth: 540, margin: '0 auto 36px' }}>
                            Browse our full menu, add your favorites to the cart, and get hot food delivered
                            right to your doorstep. Pay with Cash on Delivery or UPI.
                        </p>
                        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/menu" className="btn btn-gold">Order Online</Link>
                            <a href="tel:+919741800400" className="btn btn-outline">📞 Call to Order</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── EVENTS CTA ─── */}
            <section className="section" style={{ background: 'var(--surface)' }}>
                <div className="container">
                    <div className="glass reveal-scale" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 24, alignItems: 'center', padding: 32 }}>
                        <div>
                            <p className="section-eyebrow">EVENTS & CELEBRATIONS</p>
                            <h2 style={{ marginBottom: 12 }}>Something Special Awaits</h2>
                            <p style={{ marginBottom: 20 }}>
                                From live music nights to grand food festivals and private celebrations — discover what's happening at Spice Garden.
                            </p>
                        </div>
                        <Link to="/events" className="btn btn-gold">View Events</Link>
                    </div>
                </div>
            </section>

            {/* ─── NEWSLETTER ─── */}
            <section className="section">
                <div className="container" style={{ maxWidth: 600, textAlign: 'center' }}>
                    <div className="reveal">
                        <p className="section-eyebrow">STAY CONNECTED</p>
                        <h2 style={{ marginBottom: 16 }}>Get Exclusive Offers</h2>
                        <p style={{ marginBottom: 32 }}>Subscribe for special menu updates, events, and exclusive discounts.</p>
                        {subscribed ? (
                            <p style={{ color: 'var(--green)', fontFamily: 'DM Sans' }}>✓ You're subscribed! Thank you.</p>
                        ) : (
                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                                <input
                                    value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="Your email address"
                                    style={{
                                        flex: '1 1 250px', background: 'var(--surface2)', border: '1px solid rgba(212,168,67,0.15)',
                                        borderRadius: 28, padding: '14px 22px', color: 'var(--text)', fontFamily: 'DM Sans',
                                        fontSize: '.95rem', outline: 'none'
                                    }}
                                />
                                <button
                                    onClick={() => subscribeNewsletter(email).then(() => setSubscribed(true)).catch(() => setSubscribed(true))}
                                    className="btn btn-gold"
                                    style={{ flex: '1 1 auto', justifyContent: 'center' }}
                                >Subscribe</button>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
