import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { usePageReveal } from '../hooks/useReveal';
import toast from 'react-hot-toast';

declare global {
    interface Window {
        Razorpay: any;
    }
}

function loadRazorpayScript() {
    return new Promise((resolve) => {
        if (window.Razorpay) { resolve(true); return; }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

export default function EventDetail() {
    usePageReveal();
    const { id } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Form State (no auth required)
    const [attendeeName, setAttendeeName] = useState('');
    const [attendeeEmail, setAttendeeEmail] = useState('');
    const [attendeePhone, setAttendeePhone] = useState('');
    const [seats, setSeats] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        async function init() {
            try {
                const docSnap = await getDoc(doc(db, 'events', id as string));
                if (!docSnap.exists()) {
                    toast.error('Event not found');
                    navigate('/events');
                    return;
                }
                setEvent({ id: docSnap.id, ...docSnap.data() });
            } catch (err: any) {
                toast.error('Event not found');
                navigate('/events');
            } finally {
                setLoading(false);
            }
        }
        init();
    }, [id, navigate]);

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!attendeeName || !attendeeEmail || !attendeePhone || seats < 1) {
            toast.error('Please fill all fields correctly');
            return;
        }
        if (attendeePhone.length < 10) {
            toast.error('Please enter a valid phone number');
            return;
        }

        setIsProcessing(true);
        toast.loading('Creating your order...', { id: 'payment' });

        try {
            await loadRazorpayScript();
            if (!window.Razorpay) throw new Error('Payment system failed to load. Please refresh.');

            // 1. Create order via API
            const orderRes = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId: event.id,
                    seats,
                    attendeeName,
                    attendeeEmail,
                    attendeePhone
                })
            });
            const orderData = await orderRes.json();
            
            if (!orderData.success) {
                throw new Error(orderData.error || 'Failed to create order');
            }

            const { orderId, bookingId, amount, keyId, testMode } = orderData.data;

            toast.dismiss('payment');

            // TEST MODE: skip Razorpay, directly verify
            if (testMode) {
                toast.loading('Test mode — completing booking...', { id: 'payment' });
                const verifyRes = await fetch('/api/verify-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        razorpayOrderId: orderId,
                        razorpayPaymentId: 'test_pay_' + Date.now(),
                        razorpaySignature: 'test_signature',
                        bookingId
                    })
                });
                const verifyData = await verifyRes.json();
                if (!verifyData.success) throw new Error(verifyData.error || 'Verification failed');
                toast.success('Booking confirmed! 🎉', { id: 'payment' });
                navigate(`/booking/${bookingId}`);
                return;
            }

            // 2. Open Razorpay checkout
            const options = {
                key: keyId,
                amount: amount,
                currency: 'INR',
                name: 'Spice Garden',
                description: `Ticket for ${event.title}`,
                image: 'https://i.ibb.co/placeholder/logo.png',
                order_id: orderId,
                handler: async function (response: any) {
                    try {
                        toast.loading('Verifying payment...', { id: 'payment' });
                        const verifyRes = await fetch('/api/verify-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                                bookingId
                            })
                        });
                        const verifyData = await verifyRes.json();
                        
                        if (!verifyData.success) throw new Error(verifyData.error || 'Verification failed');

                        toast.success('Payment successful! 🎉', { id: 'payment' });
                        navigate(`/booking/${bookingId}`);
                    } catch (err: any) {
                        toast.error(err.message, { id: 'payment' });
                        navigate(`/booking-failed?reason=${encodeURIComponent(err.message)}`);
                    }
                },
                prefill: {
                    name: attendeeName,
                    email: attendeeEmail,
                    contact: attendeePhone
                },
                theme: { color: '#bd900a' },
                modal: {
                    ondismiss: function() {
                        toast.error('Payment cancelled', { id: 'payment' });
                        setIsProcessing(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                toast.error('Payment failed', { id: 'payment' });
                navigate(`/booking-failed?reason=${encodeURIComponent(response.error.description)}`);
            });
            rzp.open();

        } catch (err: any) {
            toast.error(err.message, { id: 'payment' });
            setIsProcessing(false);
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

    const availableSeats = event.capacity - event.booked_seats;
    const isSoldOut = availableSeats <= 0;
    const totalAmount = seats * event.price_per_seat;
    const eventDate = new Date(event.date);
    const dateStr = eventDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="page-enter" style={{ background: '#0a0f0d', minHeight: '100vh', paddingTop: 100, paddingBottom: 80 }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>

                {/* Back Button */}
                <button
                    onClick={() => navigate('/events')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gold)',
                        fontFamily: 'DM Sans', fontSize: '.88rem', border: 'none', background: 'none',
                        cursor: 'pointer', marginBottom: 32, opacity: 0.8, transition: 'opacity .2s'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0.8')}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                    Back to Events
                </button>

                <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>

                    {/* ─── LEFT COLUMN: Event Details ─── */}
                    <div style={{ flex: '1 1 520px', minWidth: 0 }}>

                        {/* Hero Image */}
                        <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', marginBottom: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                            <img
                                src={event.image_url || 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=1200'}
                                alt={event.title}
                                style={{ width: '100%', height: 380, objectFit: 'cover', display: 'block' }}
                            />
                            {/* Gradient overlay */}
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(transparent, rgba(10,15,13,0.9))' }} />
                            
                            {/* Badge on image */}
                            {isSoldOut && (
                                <div style={{
                                    position: 'absolute', top: 20, right: 20,
                                    background: 'rgba(231,76,60,0.9)', backdropFilter: 'blur(10px)',
                                    color: '#fff', padding: '8px 18px', borderRadius: 12,
                                    fontFamily: 'DM Sans', fontWeight: 800, fontSize: '.8rem', letterSpacing: 1.5
                                }}>SOLD OUT</div>
                            )}

                            {/* Price badge on image */}
                            <div style={{
                                position: 'absolute', bottom: 20, right: 20,
                                background: 'var(--gold)', color: '#0d1a0f',
                                padding: '8px 18px', borderRadius: 10,
                                fontFamily: 'DM Sans', fontWeight: 800, fontSize: '.9rem',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                            }}>
                                ₹{event.price_per_seat} <span style={{ fontWeight: 400, fontSize: '.7rem', opacity: 0.7 }}>/ guest</span>
                            </div>
                        </div>

                        {/* Title & Subtitle */}
                        <h1 style={{
                            fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 4vw, 3rem)',
                            fontWeight: 700, color: '#fff', marginBottom: 8, lineHeight: 1.15
                        }}>
                            {event.title}
                        </h1>
                        <p style={{
                            fontFamily: 'Cormorant Garamond, serif', fontSize: '1.15rem',
                            fontStyle: 'italic', color: 'var(--gold)', marginBottom: 28, opacity: 0.8
                        }}>
                            An exclusive experience at Spice Garden
                        </p>

                        {/* Description */}
                        <div style={{
                            background: 'rgba(19,35,24,0.3)', border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: 16, padding: '28px 30px', marginBottom: 28
                        }}>
                            <p style={{
                                fontFamily: 'DM Sans', fontSize: '.95rem', color: 'rgba(255,255,255,0.65)',
                                lineHeight: 1.75, whiteSpace: 'pre-line'
                            }}>
                                {event.description}
                            </p>
                        </div>

                        {/* Info Bar */}
                        <div style={{
                            display: 'flex', gap: 0, borderRadius: 16, overflow: 'hidden',
                            border: '1px solid rgba(212,168,67,0.12)', background: 'rgba(19,35,24,0.4)'
                        }}>
                            {[
                                { icon: '📅', label: 'DATE', value: dateStr },
                                { icon: '📍', label: 'VENUE', value: event.venue },
                                { icon: '👥', label: 'CAPACITY', value: `Limited to ${event.capacity} guests` }
                            ].map((item, i) => (
                                <div key={i} style={{
                                    flex: 1, padding: '20px 22px', textAlign: 'center',
                                    borderRight: i < 2 ? '1px solid rgba(212,168,67,0.08)' : 'none'
                                }}>
                                    <p style={{ fontFamily: 'DM Sans', fontSize: '.65rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: 2, marginBottom: 6 }}>
                                        {item.icon} {item.label}
                                    </p>
                                    <p style={{ fontFamily: 'DM Sans', fontSize: '.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ─── RIGHT COLUMN: Booking Form ─── */}
                    <div style={{ flex: '0 1 420px', minWidth: 320 }}>
                        <div style={{
                            position: 'sticky', top: 100,
                            background: 'rgba(19,35,24,0.6)', backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(212,168,67,0.15)', borderRadius: 24,
                            padding: 36, boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                        }}>
                            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                                Reserve Your Seat
                            </h2>
                            <p style={{ fontFamily: 'DM Sans', fontSize: '.85rem', color: 'var(--muted)', marginBottom: 28 }}>
                                Complete your reservation for this exclusive event.
                            </p>

                            {isSoldOut ? (
                                <div style={{
                                    background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)',
                                    borderRadius: 14, padding: '28px 20px', textAlign: 'center'
                                }}>
                                    <p style={{ fontFamily: 'DM Sans', fontWeight: 600, color: '#e74c3c', fontSize: '.95rem' }}>
                                        This event is fully booked.
                                    </p>
                                    <p style={{ fontFamily: 'DM Sans', color: 'var(--muted)', fontSize: '.82rem', marginTop: 8 }}>
                                        Check back for future events!
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleBooking}>
                                    {/* Full Name */}
                                    <div style={{ marginBottom: 18 }}>
                                        <label style={labelStyle}>FULL NAME</label>
                                        <input
                                            type="text" required disabled={isProcessing}
                                            value={attendeeName}
                                            onChange={e => setAttendeeName(e.target.value)}
                                            placeholder="Johnathan Doe"
                                            style={inputStyle}
                                        />
                                    </div>

                                    {/* Phone Number */}
                                    <div style={{ marginBottom: 18 }}>
                                        <label style={labelStyle}>PHONE NUMBER</label>
                                        <input
                                            type="tel" required disabled={isProcessing}
                                            value={attendeePhone}
                                            onChange={e => setAttendeePhone(e.target.value)}
                                            placeholder="+91 98765 43210"
                                            style={inputStyle}
                                        />
                                    </div>

                                    {/* Email */}
                                    <div style={{ marginBottom: 24 }}>
                                        <label style={labelStyle}>EMAIL ADDRESS</label>
                                        <input
                                            type="email" required disabled={isProcessing}
                                            value={attendeeEmail}
                                            onChange={e => setAttendeeEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            style={inputStyle}
                                        />
                                        <p style={{ fontFamily: 'DM Sans', fontSize: '.7rem', color: 'var(--gold)', marginTop: 6, opacity: 0.6 }}>
                                            🎟️ Your ticket will be sent to this email
                                        </p>
                                    </div>

                                    {/* Seat Selector & Live Total */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        background: 'rgba(10,15,13,0.5)', borderRadius: 14,
                                        padding: '16px 20px', border: '1px solid rgba(212,168,67,0.1)',
                                        marginBottom: 24
                                    }}>
                                        <div>
                                            <p style={{ fontFamily: 'DM Sans', fontSize: '.65rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: 1.5, marginBottom: 6 }}>NUMBER OF GUESTS</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                                <button type="button" disabled={isProcessing || seats <= 1} onClick={() => setSeats(s => s - 1)} style={seatBtnStyle}>−</button>
                                                <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.6rem', fontWeight: 700, color: '#fff', minWidth: 24, textAlign: 'center' }}>{seats}</span>
                                                <button type="button" disabled={isProcessing || seats >= availableSeats} onClick={() => setSeats(s => s + 1)} style={seatBtnStyle}>+</button>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontFamily: 'DM Sans', fontSize: '.65rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: 1.5, marginBottom: 4 }}>LIVE TOTAL</p>
                                            <p style={{ fontFamily: 'Cormorant Garamond', fontSize: '2rem', fontWeight: 700, color: 'var(--gold)' }}>
                                                ₹{totalAmount.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Seats Available */}
                                    <div style={{ marginBottom: 24 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <span style={{ fontFamily: 'DM Sans', fontSize: '.75rem', fontWeight: 600, color: availableSeats <= 10 ? '#e74c3c' : 'var(--muted)' }}>
                                                {availableSeats <= 10 ? `🔥 Only ${availableSeats} seats left!` : `${availableSeats} seats available`}
                                            </span>
                                            <span style={{ fontFamily: 'DM Sans', fontSize: '.72rem', color: 'var(--muted)' }}>
                                                {Math.round((event.booked_seats / event.capacity) * 100)}% booked
                                            </span>
                                        </div>
                                        <div style={{ width: '100%', height: 4, borderRadius: 10, background: 'rgba(255,255,255,0.06)' }}>
                                            <div style={{ width: `${Math.min(100, (event.booked_seats / event.capacity) * 100)}%`, height: '100%', borderRadius: 10, background: (event.booked_seats / event.capacity) > 0.8 ? '#e74c3c' : 'var(--gold)', transition: 'width .6s ease' }} />
                                        </div>
                                    </div>

                                    {/* Pay Now Button */}
                                    <button
                                        type="submit"
                                        disabled={isProcessing}
                                        style={{
                                            width: '100%', padding: '16px', borderRadius: 14, border: 'none',
                                            background: 'var(--gold)', color: '#0d1a0f',
                                            fontFamily: 'DM Sans', fontSize: '1rem', fontWeight: 800,
                                            cursor: isProcessing ? 'wait' : 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                            boxShadow: '0 8px 30px rgba(212,168,67,0.3)',
                                            transition: 'all .2s ease', opacity: isProcessing ? 0.7 : 1
                                        }}
                                        onMouseEnter={e => !isProcessing && (e.currentTarget.style.transform = 'translateY(-2px)')}
                                        onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                                    >
                                        {isProcessing ? (
                                            <div style={{ width: 22, height: 22, border: '2.5px solid #0d1a0f', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                        ) : (
                                            <>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                                                </svg>
                                                Pay ₹{totalAmount.toLocaleString()}
                                            </>
                                        )}
                                    </button>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 16 }}>
                                        <span style={{ fontFamily: 'DM Sans', fontSize: '.7rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            🔒 Secure Checkout
                                        </span>
                                        <span style={{ fontFamily: 'DM Sans', fontSize: '.7rem', color: 'var(--muted)' }}>
                                            24h Cancellation
                                        </span>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

// Reusable styles
const labelStyle: React.CSSProperties = {
    display: 'block', fontFamily: 'DM Sans', fontSize: '.65rem', fontWeight: 700,
    color: 'var(--muted)', letterSpacing: 1.5, marginBottom: 8
};

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 12,
    border: '1px solid rgba(212,168,67,0.15)', background: 'rgba(10,15,13,0.6)',
    color: '#fff', fontFamily: 'DM Sans', fontSize: '.9rem',
    outline: 'none', transition: 'border-color .2s'
};

const seatBtnStyle: React.CSSProperties = {
    width: 36, height: 36, borderRadius: 10, border: '1.5px solid rgba(212,168,67,0.3)',
    background: 'rgba(212,168,67,0.08)', color: 'var(--gold)',
    fontFamily: 'DM Sans', fontSize: '1.1rem', fontWeight: 600,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all .2s'
};
