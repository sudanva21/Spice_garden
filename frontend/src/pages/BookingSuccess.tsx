import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { usePageReveal } from '../hooks/useReveal';
import toast from 'react-hot-toast';

export default function BookingSuccess() {
    usePageReveal();
    const { id } = useParams();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBooking() {
            try {
                const docSnap = await getDoc(doc(db, 'bookings', id as string));
                if (!docSnap.exists()) throw new Error("Not found");
                setBooking({ id: docSnap.id, ...docSnap.data() });
            } catch (err: any) {
                toast.error('Failed to load ticket: ' + err.message);
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchBooking();
    }, [id]);

    const downloadTicket = () => {
        if (!booking) return;
        try {
            // Trigger a native browser file download from the backend API
            // The backend sends Content-Disposition: attachment; filename="..."
            const a = document.createElement('a');
            a.href = `/api/ticket/${booking.id}.pdf`;
            // The download attribute acts as a fallback/hint, but the backend header is the source of truth
            a.download = `Spice_Garden_Ticket_${booking.id.slice(0, 8)}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            toast.success('Ticket downloading... 🎫');
        } catch (err: any) {
            toast.error('Download error: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0f0d' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(212,168,67,0.2)', borderTopColor: 'var(--gold)', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!booking) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0f0d', textAlign: 'center', padding: 20 }}>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: 'var(--gold)', marginBottom: 16 }}>Ticket Not Found</h2>
                <p style={{ fontFamily: 'DM Sans', color: 'var(--muted)', marginBottom: 24 }}>We couldn't locate this booking record.</p>
                <Link to="/events" style={{ padding: '12px 28px', borderRadius: 12, background: 'var(--gold)', color: '#0d1a0f', fontFamily: 'DM Sans', fontWeight: 700, textDecoration: 'none' }}>Back to Events</Link>
            </div>
        );
    }

    const dateStr = new Date(booking.event_date).toLocaleString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="page-enter" style={{ background: '#0a0f0d', minHeight: '100vh', paddingTop: 120, paddingBottom: 80, display: 'flex', justifyContent: 'center', padding: '120px 20px 80px' }}>
            <div style={{ maxWidth: 640, width: '100%' }}>

                {/* Success Header */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    {/* Check icon */}
                    <div style={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: 'rgba(46,204,113,0.1)', border: '2px solid rgba(46,204,113,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px', animation: 'popIn 0.5s ease'
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                        Booking Confirmed
                    </h1>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '.9rem', color: '#2ecc71', fontWeight: 600 }}>
                        Payment Successful
                    </p>
                </div>

                {/* Ticket Card */}
                <div style={{
                    background: 'rgba(19,35,24,0.7)', backdropFilter: 'blur(20px)',
                    borderRadius: 24, border: '1px solid rgba(212,168,67,0.15)',
                    overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 80px rgba(212,168,67,0.05)'
                }}>
                    {/* Gold header strip */}
                    <div style={{
                        background: 'linear-gradient(135deg, var(--gold), #a67c00)', padding: '20px 32px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                        <div>
                            <p style={{ fontFamily: 'DM Sans', fontSize: '.65rem', fontWeight: 800, color: '#0d1a0f', letterSpacing: 2, opacity: 0.7 }}>SPICE GARDEN</p>
                            <p style={{ fontFamily: 'DM Sans', fontSize: '.75rem', fontWeight: 700, color: '#0d1a0f' }}>ENTRY PASS</p>
                        </div>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(13,26,15,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d1a0f" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M16 2v20M2 12h14"/></svg>
                        </div>
                    </div>

                    {/* Perforated edge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px', margin: '-1px 0', position: 'relative' }}>
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#0a0f0d', flexShrink: 0 }} />
                        ))}
                    </div>

                    {/* Content */}
                    <div style={{ padding: '28px 32px 32px' }}>
                        {/* Event Title */}
                        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 700, color: '#fff', marginBottom: 24, lineHeight: 1.2 }}>
                            {booking.event_title}
                        </h2>

                        {/* Info Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                            {[
                                { icon: '📅', label: 'DATE & TIME', value: dateStr },
                                { icon: '📍', label: 'VENUE', value: booking.event_venue || 'Spice Garden' },
                                { icon: '👤', label: 'GUEST', value: booking.attendee_name },
                                { icon: '💺', label: 'SEATS', value: booking.seats, highlight: true },
                            ].map((item, i) => (
                                <div key={i} style={{
                                    background: 'rgba(10,15,13,0.5)', borderRadius: 14,
                                    padding: '16px 18px',
                                    border: item.highlight ? '1px solid rgba(212,168,67,0.2)' : '1px solid rgba(255,255,255,0.04)',
                                    gridColumn: i < 2 ? 'span 1' : undefined
                                }}>
                                    <p style={{ fontFamily: 'DM Sans', fontSize: '.6rem', fontWeight: 700, color: item.highlight ? 'var(--gold)' : 'var(--muted)', letterSpacing: 1.5, marginBottom: 6 }}>
                                        {item.icon} {item.label}
                                    </p>
                                    <p style={{
                                        fontFamily: item.highlight ? 'Cormorant Garamond, serif' : 'DM Sans',
                                        fontSize: item.highlight ? '1.6rem' : '.85rem',
                                        fontWeight: item.highlight ? 700 : 400,
                                        color: item.highlight ? '#fff' : 'rgba(255,255,255,0.7)',
                                        lineHeight: 1.3
                                    }}>
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Amount Paid */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: 'rgba(212,168,67,0.06)', borderRadius: 14,
                            padding: '16px 20px', border: '1px solid rgba(212,168,67,0.1)',
                            marginBottom: 24
                        }}>
                            <span style={{ fontFamily: 'DM Sans', fontSize: '.75rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: 1 }}>AMOUNT PAID</span>
                            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 700, color: 'var(--gold)' }}>₹{booking.total_amount?.toLocaleString()}</span>
                        </div>

                        {/* Footer with ID and download */}
                        <div style={{ borderTop: '1px solid rgba(212,168,67,0.1)', paddingTop: 20, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                            <div>
                                <p style={{ fontSize: '.7rem', color: 'var(--muted)', fontFamily: 'monospace' }}>
                                    ID: {booking.id?.slice(0, 8)}...
                                </p>
                                <p style={{ fontFamily: 'DM Sans', fontSize: '.72rem', color: 'var(--muted)', marginTop: 4 }}>
                                    📧 {booking.attendee_email}
                                </p>
                            </div>
                            <button
                                onClick={downloadTicket}
                                style={{
                                    padding: '14px 28px', borderRadius: 14, border: 'none',
                                    background: 'var(--gold)', color: '#0d1a0f',
                                    fontFamily: 'DM Sans', fontSize: '.88rem', fontWeight: 800,
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                    boxShadow: '0 8px 25px rgba(212,168,67,0.25)',
                                    transition: 'all .2s'
                                }}
                                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                Download Ticket
                            </button>
                        </div>
                    </div>
                </div>

                {/* Email notice */}
                <p style={{ textAlign: 'center', fontFamily: 'DM Sans', fontSize: '.82rem', color: 'var(--muted)', marginTop: 24 }}>
                    🎟️ A confirmation email with your ticket has been sent to your inbox.
                </p>

                {/* Navigation */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}>
                    <Link to="/events" style={{
                        padding: '12px 24px', borderRadius: 12, textDecoration: 'none',
                        fontFamily: 'DM Sans', fontWeight: 700, fontSize: '.82rem',
                        border: '1.5px solid rgba(212,168,67,0.2)', color: 'var(--gold)',
                        background: 'transparent', transition: 'all .2s'
                    }}>
                        Browse More Events
                    </Link>
                    <Link to="/" style={{
                        padding: '12px 24px', borderRadius: 12, textDecoration: 'none',
                        fontFamily: 'DM Sans', fontWeight: 700, fontSize: '.82rem',
                        color: 'var(--muted)', background: 'transparent', transition: 'all .2s'
                    }}>
                        Go Home
                    </Link>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
}
