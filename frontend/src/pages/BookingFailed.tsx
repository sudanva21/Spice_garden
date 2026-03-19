import { Link, useSearchParams } from 'react-router-dom';

export default function BookingFailed() {
    const [params] = useSearchParams();
    const reason = params.get('reason') || 'An unexpected error occurred during payment processing.';

    return (
        <div className="page-enter" style={{ background: '#0a0f0d', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{
                maxWidth: 480, width: '100%', textAlign: 'center',
                background: 'rgba(19,35,24,0.5)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(231,76,60,0.15)', borderRadius: 24,
                padding: '48px 36px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
                {/* Error Icon */}
                <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'rgba(231,76,60,0.08)', border: '2px solid rgba(231,76,60,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px'
                }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                </div>

                <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', fontWeight: 700, color: '#fff', marginBottom: 10 }}>
                    Payment Unsuccessful
                </h1>
                <p style={{ fontFamily: 'DM Sans', fontSize: '.9rem', color: '#e74c3c', marginBottom: 8, fontWeight: 600 }}>
                    Your booking could not be completed.
                </p>
                <p style={{ fontFamily: 'DM Sans', fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: 32 }}>
                    {reason}
                </p>

                <div style={{
                    background: 'rgba(10,15,13,0.4)', border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 14, padding: '20px', marginBottom: 32
                }}>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                        💡 Don't worry — no amount has been charged. If money was debited, it will be refunded within 5–7 business days.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link
                        to="/events"
                        style={{
                            padding: '14px 28px', borderRadius: 12, textDecoration: 'none',
                            fontFamily: 'DM Sans', fontWeight: 700, fontSize: '.88rem',
                            background: 'var(--gold)', color: '#0d1a0f',
                            boxShadow: '0 4px 14px rgba(212,168,67,0.25)', transition: 'all .2s'
                        }}
                    >
                        Browse Events
                    </Link>
                    <Link
                        to="/"
                        style={{
                            padding: '14px 28px', borderRadius: 12, textDecoration: 'none',
                            fontFamily: 'DM Sans', fontWeight: 700, fontSize: '.88rem',
                            border: '1.5px solid rgba(212,168,67,0.2)', color: 'var(--gold)',
                            background: 'transparent', transition: 'all .2s'
                        }}
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
