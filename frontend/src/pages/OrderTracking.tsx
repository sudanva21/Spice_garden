import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePageReveal } from '../hooks/useReveal';

export default function OrderTracking() {
    const { id } = useParams<{ id: string }>();
    const [status, setStatus] = useState(0); // 0=Received, 1=Preparing, 2=On the way, 3=Delivered

    usePageReveal();

    // Simulate progress
    useEffect(() => {
        const interval = setInterval(() => {
            setStatus(s => {
                if (s >= 3) {
                    clearInterval(interval);
                    return 3;
                }
                return s + 1;
            });
        }, 8000); // Progress every 8 seconds for demo

        return () => clearInterval(interval);
    }, []);

    const steps = [
        { title: 'Order Received', desc: 'We have received your order', icon: '📝' },
        { title: 'Preparing Food', desc: 'Your food is being prepared', icon: '🍳' },
        { title: 'Out for Delivery', desc: 'Driver is on the way', icon: '🛵' },
        { title: 'Delivered', desc: 'Enjoy your meal!', icon: '✨' },
    ];

    return (
        <div className="page-enter" style={{ paddingTop: 120, minHeight: '100vh', background: 'var(--bg)' }}>
            <div className="container" style={{ maxWidth: 600 }}>
                <div className="glass reveal" style={{ padding: 40, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                        <div>
                            <p className="section-eyebrow" style={{ marginBottom: 4 }}>ORDER TRACKING</p>
                            <h2 style={{ fontSize: '1.5rem', fontFamily: 'Cormorant Garamond', fontWeight: 700 }}>#{id}</h2>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontFamily: 'DM Sans', fontSize: '.85rem', color: 'var(--muted)' }}>Estimated Time</p>
                            <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--gold)' }}>25-30 min</p>
                        </div>
                    </div>

                    <div style={{ position: 'relative', paddingLeft: 40, paddingTop: 10, paddingBottom: 10 }}>
                        {/* Vertical line connecting steps */}
                        <div style={{ position: 'absolute', left: 19, top: 40, bottom: 40, width: 2, background: 'rgba(212,168,67,0.1)' }}>
                            <div style={{ width: '100%', background: 'var(--gold)', transition: 'height 1s ease', height: `${(status / 3) * 100}%` }} />
                        </div>

                        {steps.map((step, idx) => {
                            const isCompleted = status >= idx;
                            const isActive = status === idx;
                            return (
                                <div key={idx} style={{ position: 'relative', marginBottom: idx === 3 ? 0 : 32, opacity: isCompleted ? 1 : 0.4, transition: 'opacity 0.5s ease' }}>
                                    {/* Circle marker */}
                                    <div style={{
                                        position: 'absolute', left: -31, top: 4, width: 20, height: 20, borderRadius: '50%',
                                        background: isCompleted ? 'var(--gold)' : 'var(--bg)', border: `2px solid ${isCompleted ? 'var(--gold)' : 'rgba(212,168,67,0.3)'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2
                                    }}>
                                        {isCompleted && <span style={{ width: 8, height: 8, background: '#111', borderRadius: '50%' }} />}
                                    </div>

                                    <div style={{ background: isActive ? 'rgba(212,168,67,0.05)' : 'transparent', padding: isActive ? '12px 16px' : '0 16px', borderRadius: 12, border: isActive ? '1px solid rgba(212,168,67,0.2)' : '1px solid transparent', transition: 'all 0.3s ease' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span style={{ fontSize: '1.5rem', filter: isActive ? 'none' : 'grayscale(1)' }}>{step.icon}</span>
                                            <div>
                                                <h4 style={{ fontSize: '1.1rem', marginBottom: 2, color: isActive ? 'var(--gold)' : '#fff' }}>{step.title}</h4>
                                                <p style={{ fontFamily: 'DM Sans', fontSize: '.85rem', color: 'var(--muted)' }}>{step.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {status >= 2 && (
                        <div className="reveal" style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(212,168,67,0.1)', display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(212,168,67,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                🛵
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 600 }}>Ramesh Kumar</p>
                                <p style={{ fontFamily: 'DM Sans', fontSize: '.85rem', color: 'var(--muted)' }}>Delivery Partner</p>
                            </div>
                            <a href="tel:8050280065" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', background: 'rgba(39, 174, 96, 0.1)', color: '#27ae60', border: '1px solid #27ae60' }}>
                                📞
                            </a>
                        </div>
                    )}

                    <div style={{ marginTop: 40, textAlign: 'center' }}>
                        <Link to="/" style={{ color: 'var(--muted)', fontFamily: 'DM Sans', fontSize: '.9rem', textDecoration: 'none' }}>
                            Return to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
