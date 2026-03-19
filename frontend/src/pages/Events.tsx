import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { TABLES } from '../constants/tables';
import { usePageReveal } from '../hooks/useReveal';
import toast from 'react-hot-toast';
import { SEOHead } from '../components/SEOHead';
import { EventSchema } from '../components/EventSchema';

export default function Events() {
    usePageReveal();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All Events');

    useEffect(() => {
        async function fetchEvents() {
            try {
                const { data, error } = await supabase
                    .from(TABLES.EVENTS)
                    .select('*')
                    .eq('status', 'active')
                    .order('date', { ascending: true });

                if (error) throw new Error(error.message);
                setEvents(data || []);
            } catch (err: any) {
                toast.error('Failed to load events: ' + err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchEvents();
    }, []);

    const filteredEvents = events.filter(e => {
        if (filter === 'All Events') return true;
        const eventDate = new Date(e.date);
        const today = new Date();

        if (filter === 'Upcoming') return eventDate > today;
        if (filter === 'This Weekend') {
            const dayOfWeek = today.getDay();
            const daysUntilSat = (6 - dayOfWeek + 7) % 7;
            const saturday = new Date(today);
            saturday.setDate(today.getDate() + daysUntilSat);
            saturday.setHours(0, 0, 0, 0);
            const sunday = new Date(saturday);
            sunday.setDate(saturday.getDate() + 1);
            sunday.setHours(23, 59, 59, 999);
            return eventDate >= saturday && eventDate <= sunday;
        }
        return true;
    });

    const filters = ['All Events', 'Upcoming', 'This Weekend'];

    return (
        <div className="page-enter" style={{ background: '#0a0f0d', minHeight: '100vh' }}>
            <SEOHead 
                title="Upcoming Events | Spice Garden Gokak" 
                description="Discover live music nights, grand food festivals, and private celebrations at Spice Garden Gokak."
            />
            {events.map((ev) => (
                <EventSchema key={`schema-${ev.id}`} event={{
                    title: ev.title,
                    description: ev.description,
                    date: ev.date,
                    image: ev.image_url,
                    locationName: ev.venue || 'Spice Garden',
                    locationAddress: 'Gokak, Karnataka'
                }} />
            ))}
            {/* ─── Hero Section ─── */}
            <div style={{
                position: 'relative', width: '100%', height: 420, overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <img
                    src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600&q=80"
                    alt="Events"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(10,15,13,0.5) 0%, rgba(10,15,13,0.85) 100%)'
                }} />
                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 20px' }}>
                    <p style={{
                        fontFamily: 'Cinzel, serif', fontSize: '.75rem', letterSpacing: 6,
                        color: 'var(--gold)', marginBottom: 12, textTransform: 'uppercase'
                    }}>SPICE GARDEN</p>
                    <h1 style={{
                        fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
                        color: '#fff', fontWeight: 600, lineHeight: 1.15, marginBottom: 14
                    }}>
                        Exclusive Resort<br /><em style={{ color: 'var(--gold)' }}>Experiences</em>
                    </h1>
                    <p style={{
                        fontFamily: 'DM Sans, sans-serif', fontSize: '1rem', color: 'rgba(255,255,255,0.7)',
                        maxWidth: 520, margin: '0 auto 28px'
                    }}>
                        Discover curated moments of luxury, from private beach yoga to gourmet gala dinners at our world‑class retreats.
                    </p>
                    <a href="#events-grid" style={{
                        display: 'inline-block', padding: '14px 36px', borderRadius: 10,
                        background: 'var(--gold)', color: '#0d1a0f', fontWeight: 700,
                        fontFamily: 'DM Sans', fontSize: '.9rem', textDecoration: 'none',
                        boxShadow: '0 6px 24px rgba(212,168,67,0.35)', transition: 'transform .2s'
                    }}>
                        Explore Now
                    </a>
                </div>
            </div>

            {/* ─── Filter Tabs ─── */}
            <div id="events-grid" style={{
                maxWidth: 1200, margin: '0 auto', padding: '40px 20px 0'
            }}>
                <div style={{
                    display: 'flex', gap: 8, marginBottom: 36, flexWrap: 'wrap'
                }}>
                    {filters.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '10px 22px', borderRadius: 8, cursor: 'pointer',
                                fontFamily: 'DM Sans', fontSize: '.85rem', fontWeight: 600,
                                border: filter === f ? '2px solid var(--gold)' : '2px solid rgba(212,168,67,0.15)',
                                background: filter === f ? 'var(--gold)' : 'transparent',
                                color: filter === f ? '#0d1a0f' : 'var(--muted)',
                                transition: 'all .25s ease'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* ─── Event Cards Grid ─── */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: '50%',
                            border: '3px solid rgba(212,168,67,0.2)',
                            borderTopColor: 'var(--gold)',
                            animation: 'spin 1s linear infinite'
                        }} />
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                        <p style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.6rem', color: 'var(--gold)', marginBottom: 8 }}>
                            No events found
                        </p>
                        <p style={{ fontFamily: 'DM Sans', color: 'var(--muted)', fontSize: '.9rem' }}>
                            Check back soon for upcoming experiences.
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                        gap: 28, paddingBottom: 80
                    }}>
                        {filteredEvents.map(ev => {
                            const isSoldOut = ev.booked_seats >= ev.capacity;
                            const availableSeats = ev.capacity - ev.booked_seats;
                            const bookingPercent = Math.min(100, (ev.booked_seats / ev.capacity) * 100);
                            const eventDate = new Date(ev.date);
                            const month = eventDate.toLocaleString('en-IN', { month: 'short' }).toUpperCase();
                            const day = eventDate.getDate().toString().padStart(2, '0');

                            return (
                                <div key={ev.id} style={{
                                    borderRadius: 16, overflow: 'hidden',
                                    background: 'rgba(19,35,24,0.5)',
                                    backdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(212,168,67,0.08)',
                                    transition: 'transform .3s ease, box-shadow .3s ease',
                                    display: 'flex', flexDirection: 'column'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(212,168,67,0.12)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    {/* Card Image */}
                                    <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
                                        <img
                                            src={ev.image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800'}
                                            alt={ev.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s' }}
                                            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
                                            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                                        />

                                        {/* Date Badge — top left */}
                                        <div style={{
                                            position: 'absolute', top: 14, left: 14,
                                            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
                                            borderRadius: 10, padding: '8px 12px', textAlign: 'center',
                                            border: '1px solid rgba(212,168,67,0.25)',
                                            minWidth: 48
                                        }}>
                                            <p style={{ fontFamily: 'DM Sans', fontSize: '.6rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: 1.5, margin: 0 }}>{month}</p>
                                            <p style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1 }}>{day}</p>
                                        </div>

                                        {/* Price Badge — bottom right */}
                                        <div style={{
                                            position: 'absolute', bottom: 14, right: 14,
                                            background: 'var(--gold)', color: '#0d1a0f',
                                            borderRadius: 8, padding: '6px 14px',
                                            fontFamily: 'DM Sans', fontSize: '.78rem', fontWeight: 800,
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
                                        }}>
                                            ₹{ev.price_per_seat} <span style={{ fontWeight: 400, fontSize: '.65rem', opacity: 0.7 }}>PER GUEST</span>
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div style={{ padding: '20px 22px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        {/* Venue */}
                                        <p style={{
                                            fontFamily: 'DM Sans', fontSize: '.7rem', fontWeight: 700,
                                            color: 'var(--gold)', letterSpacing: 1.5, textTransform: 'uppercase',
                                            marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5
                                        }}>
                                            <span style={{ fontSize: '.8rem' }}>📍</span> {ev.venue}
                                        </p>

                                        {/* Title */}
                                        <h3 style={{
                                            fontFamily: 'Cormorant Garamond, serif', fontSize: '1.45rem',
                                            fontWeight: 700, color: '#fff', marginBottom: 8, lineHeight: 1.25
                                        }}>
                                            {ev.title}
                                        </h3>

                                        {/* Description */}
                                        <p style={{
                                            fontFamily: 'DM Sans', fontSize: '.84rem', color: 'rgba(255,255,255,0.55)',
                                            lineHeight: 1.55, marginBottom: 18, flex: 1,
                                            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                        }}>
                                            {ev.description}
                                        </p>

                                        {/* Seats Indicator */}
                                        <div style={{ marginBottom: 18 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                                {isSoldOut ? (
                                                    <span style={{ fontFamily: 'DM Sans', fontSize: '.78rem', fontWeight: 700, color: '#e74c3c' }}>
                                                        FULLY BOOKED
                                                    </span>
                                                ) : availableSeats <= 5 ? (
                                                    <span style={{ fontFamily: 'DM Sans', fontSize: '.78rem', fontWeight: 700, color: '#e74c3c' }}>
                                                        🔥 ONLY {availableSeats} SEATS LEFT
                                                    </span>
                                                ) : (
                                                    <span style={{ fontFamily: 'DM Sans', fontSize: '.78rem', fontWeight: 600, color: 'var(--muted)' }}>
                                                        {availableSeats} SEATS AVAILABLE
                                                    </span>
                                                )}
                                                <span style={{ fontFamily: 'DM Sans', fontSize: '.72rem', color: 'var(--muted)' }}>
                                                    {Math.round(bookingPercent)}% BOOKED
                                                </span>
                                            </div>
                                            {/* Progress Bar */}
                                            <div style={{
                                                width: '100%', height: 5, borderRadius: 10,
                                                background: 'rgba(255,255,255,0.08)', overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    width: `${bookingPercent}%`, height: '100%', borderRadius: 10,
                                                    background: bookingPercent > 80 ? '#e74c3c' : 'var(--gold)',
                                                    transition: 'width 1s ease'
                                                }} />
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <Link
                                                to={isSoldOut ? '#' : `/events/${ev.id}`}
                                                onClick={e => isSoldOut && e.preventDefault()}
                                                style={{
                                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    padding: '13px 0', borderRadius: 10, textDecoration: 'none',
                                                    fontFamily: 'DM Sans', fontSize: '.88rem', fontWeight: 700,
                                                    background: isSoldOut ? 'rgba(100,100,100,0.2)' : 'var(--gold)',
                                                    color: isSoldOut ? 'rgba(255,255,255,0.4)' : '#0d1a0f',
                                                    cursor: isSoldOut ? 'not-allowed' : 'pointer',
                                                    border: 'none',
                                                    boxShadow: isSoldOut ? 'none' : '0 4px 14px rgba(212,168,67,0.25)',
                                                    transition: 'all .2s ease'
                                                }}
                                            >
                                                {isSoldOut ? 'Sold Out' : 'Book Now'}
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    navigator.share?.({ title: ev.title, url: `${window.location.origin}/events/${ev.id}` })
                                                        .catch(() => { navigator.clipboard.writeText(`${window.location.origin}/events/${ev.id}`); toast.success('Link copied!'); });
                                                }}
                                                style={{
                                                    width: 48, height: 48, borderRadius: 10,
                                                    border: '1.5px solid rgba(212,168,67,0.2)',
                                                    background: 'transparent', color: 'var(--gold)',
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    transition: 'background .2s'
                                                }}
                                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,168,67,0.08)')}
                                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
