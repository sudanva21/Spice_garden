import { useState, useEffect } from 'react';
import { usePageReveal } from '../hooks/useReveal';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { getEvents } from '../api';

const API = import.meta.env.VITE_API_URL || '/api/v1';

function Countdown({ date }: { date: string }) {
    const [diff, setDiff] = useState({ days: 0, hours: 0, mins: 0 });

    useEffect(() => {
        const timer = setInterval(() => {
            const ms = new Date(date).getTime() - Date.now();
            if (ms <= 0) { setDiff({ days: 0, hours: 0, mins: 0 }); return; }
            setDiff({
                days: Math.floor(ms / 86400000),
                hours: Math.floor((ms % 86400000) / 3600000),
                mins: Math.floor((ms % 3600000) / 60000),
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [date]);

    return (
        <div style={{ display: 'flex', gap: 16 }}>
            {[
                { val: diff.days, label: 'DAYS' },
                { val: diff.hours, label: 'HRS' },
                { val: diff.mins, label: 'MIN' },
            ].map(t => (
                <div key={t.label} style={{ textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Cormorant Garamond', fontSize: '2rem', fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}>{t.val}</p>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '.65rem', letterSpacing: '1px', color: 'var(--muted)' }}>{t.label}</p>
                </div>
            ))}
        </div>
    );
}

export default function Events() {
    const [events, setEvents] = useState<any[]>([]);
    const { user, openAuthModal, token } = useAuth();

    // Booking Modal State
    const [bookingEvent, setBookingEvent] = useState<any>(null);
    const [ticketCount, setTicketCount] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    usePageReveal();

    useEffect(() => {
        getEvents().then(r => setEvents(r.data.events || [])).catch(() => { });
    }, []);

    const handleGetTickets = (ev: any) => {
        if (!user) {
            openAuthModal();
        } else {
            setBookingEvent(ev);
            setTicketCount(1);
            setPaymentMethod('upi');
            setSuccessMsg('');
            setIsSubmitting(false);
        }
    };

    const confirmBooking = async () => {
        if (!user || !bookingEvent) return;
        setIsSubmitting(true);
        try {
            const totalAmount = (bookingEvent.ticket_price || 0) * ticketCount;
            await axios.post(`${API}/event-bookings`, {
                event_id: bookingEvent.id,
                user_id: user.id,
                ticket_count: ticketCount,
                total_amount: totalAmount,
                payment_method: paymentMethod
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccessMsg('Tickets booked successfully!');
            setTimeout(() => {
                setBookingEvent(null);
            }, 3000);
        } catch (err) {
            console.error(err);
            alert('Failed to book tickets. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="page-enter" style={{ paddingTop: 120, minHeight: '100vh', position: 'relative' }}>
            <div className="container">
                <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
                    <p className="section-eyebrow">WHAT'S HAPPENING</p>
                    <h1>Upcoming Events</h1>
                    <p style={{ maxWidth: 500, margin: '12px auto 0' }}>Workshops, festivals, and immersive experiences at the garden</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                    {events.map((ev, i) => (
                        <div key={ev.id} className="glass" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, alignItems: 'center', transitionDelay: `${i * .1}s` }}>
                            <div>
                                <p style={{ fontFamily: 'DM Sans', fontSize: '.75rem', letterSpacing: '1px', color: 'var(--gold)', marginBottom: 8 }}>
                                    {ev.event_type?.toUpperCase() || 'EVENT'}
                                </p>
                                <h3 style={{ marginBottom: 12 }}>{ev.title}</h3>
                                <p style={{ marginBottom: 16 }}>{ev.description}</p>
                                <p style={{ fontFamily: 'DM Sans', fontSize: '.85rem', color: 'var(--muted)' }}>
                                    📅 {new Date(ev.event_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                                {ev.ticket_price > 0 && (
                                    <p style={{ fontFamily: 'DM Sans', fontSize: '1.2rem', color: '#fff', marginTop: 12 }}>
                                        Ticket: <strong style={{ color: 'var(--gold)' }}>₹{ev.ticket_price}</strong>
                                    </p>
                                )}
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <Countdown date={ev.event_date} />
                                <button onClick={() => handleGetTickets(ev)} className="btn btn-outline" style={{ marginTop: 16, fontSize: '.8rem', padding: '10px 24px' }}>
                                    {ev.ticket_price > 0 ? 'Buy Tickets' : 'Book Free Ticket'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {events.length === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 160 }} />)}
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            {bookingEvent && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 1, transition: 'opacity 0.3s' }}>
                    <div className="glass" style={{ width: '100%', maxWidth: 480, padding: 32, position: 'relative' }}>
                        <button onClick={() => setBookingEvent(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>

                        <h2 style={{ marginBottom: 8 }}>Book Tickets</h2>
                        <h4 style={{ color: 'var(--gold)', marginBottom: 24 }}>{bookingEvent.title}</h4>

                        {successMsg ? (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
                                <h3 style={{ color: 'var(--gold)' }}>{successMsg}</h3>
                                <p style={{ fontFamily: 'DM Sans', fontSize: '.9rem', color: 'var(--muted)', marginTop: 8 }}>We have emailed you the details.</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: 24 }}>
                                    <label style={{ display: 'block', fontFamily: 'DM Sans', fontSize: '.85rem', marginBottom: 8, color: 'var(--muted)' }}>Number of Tickets</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <button onClick={() => setTicketCount(Math.max(1, ticketCount - 1))} style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>-</button>
                                        <span style={{ fontSize: '1.2rem', fontWeight: 600, minWidth: 32, textAlign: 'center' }}>{ticketCount}</span>
                                        <button onClick={() => setTicketCount(Math.min(10, ticketCount + 1))} style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>+</button>
                                    </div>
                                </div>

                                {bookingEvent.ticket_price > 0 && (
                                    <>
                                        <div style={{ marginBottom: 24 }}>
                                            <label style={{ display: 'block', fontFamily: 'DM Sans', fontSize: '.85rem', marginBottom: 12, color: 'var(--muted)' }}>Select Payment Method</label>
                                            <div style={{ display: 'flex', gap: 16 }}>
                                                <label style={{ flex: 1, padding: 16, border: `1px solid ${paymentMethod === 'upi' ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, cursor: 'pointer', background: paymentMethod === 'upi' ? 'rgba(212,168,67,0.1)' : 'transparent', textAlign: 'center', transition: 'all 0.2s' }}>
                                                    <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} style={{ display: 'none' }} />
                                                    <span style={{ display: 'block', fontSize: '1.2rem', marginBottom: 8 }}>📱</span>
                                                    <span style={{ fontFamily: 'DM Sans', fontSize: '.85rem' }}>UPI</span>
                                                </label>
                                                <label style={{ flex: 1, padding: 16, border: `1px solid ${paymentMethod === 'cod' ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, cursor: 'pointer', background: paymentMethod === 'cod' ? 'rgba(212,168,67,0.1)' : 'transparent', textAlign: 'center', transition: 'all 0.2s' }}>
                                                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} style={{ display: 'none' }} />
                                                    <span style={{ display: 'block', fontSize: '1.2rem', marginBottom: 8 }}>💵</span>
                                                    <span style={{ fontFamily: 'DM Sans', fontSize: '.85rem' }}>Cash</span>
                                                </label>
                                            </div>
                                        </div>

                                        {paymentMethod === 'upi' && (
                                            <div style={{ marginTop: 20, textAlign: 'center', background: '#fff', padding: 20, borderRadius: 12, color: '#000', marginBottom: 24 }}>
                                                <p style={{ fontWeight: 'bold', marginBottom: 12 }}>Scan to Pay ₹{(bookingEvent.ticket_price * ticketCount).toFixed(2)}</p>
                                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=spicegarden@upi&pn=Spice%20Garden&am=${(bookingEvent.ticket_price * ticketCount).toFixed(2)}&cu=INR`} alt="UPI QR" style={{ width: 150, height: 150 }} />
                                                <p style={{ fontSize: '.8rem', color: '#666', marginTop: 12 }}>Use any UPI app (GPay, PhonePe, Paytm)</p>
                                            </div>
                                        )}
                                    </>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div>
                                        <p style={{ fontFamily: 'DM Sans', fontSize: '.85rem', color: 'var(--muted)' }}>Total Amount</p>
                                        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)' }}>₹{(bookingEvent.ticket_price * ticketCount).toFixed(2)}</p>
                                    </div>
                                    <button onClick={confirmBooking} disabled={isSubmitting} className="btn btn-primary">
                                        {isSubmitting ? 'Processing...' : 'Pay & Book'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
