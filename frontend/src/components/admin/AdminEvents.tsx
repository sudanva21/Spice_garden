import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/* ─── Design tokens (same as Admin.tsx light theme) ─── */
const T = {
    bg:       '#f5f5f0',
    surface:  '#ffffff',
    surface2: '#fafaf7',
    border:   '#e8e5dd',
    text:     '#1e1e1e',
    textSec:  '#6b6b6b',
    textMuted:'#9a9a9a',
    gold:     '#b8860b',
    goldBg:   '#fdf8ef',
    green:    '#16a34a',
    greenBg:  '#f0fdf4',
    red:      '#dc2626',
    redBg:    '#fef2f2',
    blue:     '#2563eb',
    blueBg:   '#eff6ff',
    orange:   '#ea580c',
    orangeBg: '#fff7ed',
    purple:   '#7c3aed',
    purpleBg: '#f5f3ff',
    radius:   '12px',
    shadow:   '0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)',
    font:     "'DM Sans', -apple-system, system-ui, sans-serif",
    fontHead: "'Cormorant Garamond', Georgia, serif",
};

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: `1px solid ${T.border}`, background: T.surface2,
    color: T.text, fontFamily: T.font, fontSize: '.9rem',
    outline: 'none', transition: 'border-color .2s',
};

const btnGold: React.CSSProperties = {
    padding: '10px 22px', borderRadius: 10, border: 'none',
    background: `linear-gradient(135deg, ${T.gold}, #d4a843)`, color: '#fff',
    cursor: 'pointer', fontFamily: T.font, fontSize: '.85rem', fontWeight: 700,
    boxShadow: '0 2px 8px rgba(184,134,11,.25)', transition: 'transform .15s',
};

const btnSmall = (color: string, bg: string): React.CSSProperties => ({
    padding: '6px 14px', borderRadius: 8, border: `1px solid ${color}`,
    background: bg, color, cursor: 'pointer',
    fontFamily: T.font, fontSize: '.78rem', fontWeight: 600,
    transition: 'all .15s ease',
});

const labelStyle: React.CSSProperties = {
    display: 'block', fontFamily: T.font, fontSize: '.75rem',
    fontWeight: 600, color: T.textSec, marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: '.5px',
};

export default function AdminEvents() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(false);

    useEffect(() => { fetchEvents(); }, []);

    async function fetchEvents() {
        setLoading(true);
        try {
            // Fetch all events, sort client-side (no composite index needed)
            const qs = await getDocs(collection(db, 'events'));
            const allEvents = qs.docs.map(d => ({ id: d.id, ...d.data() }));
            allEvents.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setEvents(allEvents);
        } catch (err: any) { console.error('Fetch events error:', err); toast.error('Error: ' + err.message); }
        setLoading(false);
    }

    const handleSaveEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...editItem };
        if (!payload.title || !payload.date || !payload.venue || payload.capacity <= 0 || payload.price_per_seat < 0) {
            toast.error('Please fill all required fields'); return;
        }
        try {
            const id = payload.id; delete payload.id;
            if (id) { await updateDoc(doc(db, 'events', id), payload); toast.success('Event updated!'); }
            else { payload.booked_seats = 0; await addDoc(collection(db, 'events'), payload); toast.success('Event created!'); }
            setIsFormOpen(false); setEditItem(null); fetchEvents();
        } catch (err: any) { toast.error(err.message); }
    };

    const handleDeleteEvent = async (id: string) => {
        if (!confirm('Delete this event? This cannot be undone.')) return;
        try { await deleteDoc(doc(db, 'events', id)); toast.success('Deleted!'); fetchEvents(); }
        catch (err: any) { toast.error(err.message); }
    };

    const openBookings = async (eventId: string) => {
        setSelectedEventId(eventId); setIsSlideOverOpen(true); setLoadingBookings(true);
        try {
            // Fetch all bookings, filter by event_id client-side (no composite index needed)
            const qs = await getDocs(collection(db, 'bookings'));
            const allBookings = qs.docs.map(d => ({ id: d.id, ...d.data() } as any));
            const eventBookings = allBookings
                .filter((b: any) => b.event_id === eventId)
                .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setBookings(eventBookings);
        } catch (err: any) { console.error('Bookings fetch error:', err); toast.error('Error: ' + err.message); }
        finally { setLoadingBookings(false); }
    };

    const exportToPDF = () => {
        if (!bookings.length) { toast.error('No bookings'); return; }
        const ev = events.find(e => e.id === selectedEventId);
        const d = new jsPDF();
        d.setFontSize(20); d.text('Event Bookings Report', 14, 22);
        d.setFontSize(12);
        d.text(`Event: ${ev?.title || 'Unknown'}`, 14, 32);
        d.text(`Total Bookings: ${bookings.length}`, 14, 40);
        d.text(`Collected: Rs.${bookings.filter(b => b.payment_status === 'paid').reduce((a, c) => a + c.total_amount, 0)}`, 14, 48);
        autoTable(d, {
            head: [["Name", "Email", "Phone", "Seats", "Amount", "Status", "Date"]],
            body: bookings.map(b => [b.attendee_name, b.attendee_email, b.attendee_phone, b.seats, b.total_amount, b.payment_status, new Date(b.created_at).toLocaleDateString()]),
            startY: 55, styles: { fontSize: 10 }, headStyles: { fillColor: [184, 134, 11] },
        });
        d.save(`bookings-${ev?.title?.replace(/\s+/g, '-').toLowerCase() || 'event'}.pdf`);
        toast.success('PDF exported');
    };

    const exportToExcel = () => {
        if (!bookings.length) { toast.error('No bookings'); return; }
        const ev = events.find(e => e.id === selectedEventId);
        const ws = XLSX.utils.json_to_sheet(bookings.map(b => ({
            "Name": b.attendee_name, "Email": b.attendee_email, "Phone": b.attendee_phone,
            "Seats": b.seats, "Amount": b.total_amount, "Status": b.payment_status,
            "Date": new Date(b.created_at).toLocaleString(),
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Bookings");
        XLSX.writeFile(wb, `bookings-${ev?.title?.replace(/\s+/g, '-').toLowerCase() || 'event'}.xlsx`);
        toast.success('Excel exported');
    };

    const getStatusStyle = (status: string) => {
        if (status === 'active') return { color: T.green, bg: T.greenBg };
        if (status === 'draft') return { color: T.orange, bg: T.orangeBg };
        return { color: T.textMuted, bg: '#f3f4f6' };
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontFamily: T.fontHead, fontSize: '1.8rem', color: T.text, margin: 0 }}>Events</h2>
                <button onClick={() => { setEditItem({ status: 'draft', capacity: 50, price_per_seat: 1000 }); setIsFormOpen(true); }}
                    style={btnGold}>+ Add Event</button>
            </div>

            {/* Events List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 60 }}>
                    <div style={{ fontSize: '2rem', animation: 'float 2s ease-in-out infinite' }}>🎉</div>
                    <p style={{ color: T.textMuted, marginTop: 12 }}>Loading events...</p>
                </div>
            ) : events.length === 0 ? (
                <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '48px 24px', textAlign: 'center', boxShadow: T.shadow }}>
                    <p style={{ color: T.textMuted, fontSize: '.95rem' }}>No events yet. Create your first event!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {events.map(ev => {
                        const ss = getStatusStyle(ev.status);
                        const pct = Math.min(100, (ev.booked_seats / ev.capacity) * 100);
                        return (
                            <div key={ev.id} style={{
                                background: T.surface, border: `1px solid ${T.border}`,
                                borderRadius: T.radius, padding: 20, boxShadow: T.shadow,
                                transition: 'box-shadow .2s', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center',
                            }}>
                                {/* Event image */}
                                {ev.image_url ? (
                                    <img src={ev.image_url} alt="" style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: 64, height: 64, borderRadius: 10, background: T.goldBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📸</div>
                                )}

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 200 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                        <h3 style={{ margin: 0, fontSize: '1.05rem', color: T.text, fontWeight: 700 }}>{ev.title}</h3>
                                        <span style={{
                                            padding: '3px 10px', borderRadius: 20, fontSize: '.7rem', fontWeight: 700,
                                            textTransform: 'uppercase', letterSpacing: '.5px',
                                            background: ss.bg, color: ss.color,
                                        }}>{ev.status}</span>
                                    </div>
                                    <p style={{ fontSize: '.82rem', color: T.textSec, margin: '2px 0' }}>
                                        📅 {new Date(ev.date).toLocaleString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' })}
                                        &nbsp;&nbsp;📍 {ev.venue}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                                        <span style={{ fontSize: '.82rem', color: T.textSec }}>{ev.booked_seats}/{ev.capacity} seats</span>
                                        <div style={{ width: 80, height: 6, background: T.border, borderRadius: 3, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', background: T.gold, width: `${pct}%`, borderRadius: 3, transition: 'width .3s' }} />
                                        </div>
                                        <span style={{ fontSize: '.85rem', color: T.gold, fontWeight: 700 }}>₹{ev.price_per_seat}/seat</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                    <button onClick={() => openBookings(ev.id)} style={btnSmall(T.blue, T.blueBg)}>Bookings</button>
                                    <button onClick={() => { setEditItem(ev); setIsFormOpen(true); }} style={btnSmall(T.gold, T.goldBg)}>Edit</button>
                                    <button onClick={() => handleDeleteEvent(ev.id)} style={btnSmall(T.red, T.redBg)}>Delete</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ═══ Event Form Modal ═══ */}
            {isFormOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 16, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)',
                }}>
                    <div style={{
                        background: T.surface, borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,.15)',
                        width: '100%', maxWidth: 680, maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                        overflow: 'hidden', animation: 'fadeInUp .25s ease',
                    }}>
                        {/* Modal header */}
                        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontFamily: T.fontHead, fontSize: '1.4rem', color: T.gold, margin: 0 }}>{editItem?.id ? 'Edit Event' : 'Create Event'}</h3>
                            <button onClick={() => setIsFormOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: T.textMuted }}>✕</button>
                        </div>

                        {/* Modal body */}
                        <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
                            <form id="eventForm" onSubmit={handleSaveEvent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                                <div style={{ gridColumn: '1 / -1', marginBottom: 14 }}>
                                    <label style={labelStyle}>Event Title *</label>
                                    <input required style={inputStyle} value={editItem?.title || ''} onChange={e => setEditItem({ ...editItem, title: e.target.value })} placeholder="Gala Dinner..." />
                                </div>
                                <div style={{ gridColumn: '1 / -1', marginBottom: 14 }}>
                                    <label style={labelStyle}>Description *</label>
                                    <textarea required rows={3} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' as const }} value={editItem?.description || ''} onChange={e => setEditItem({ ...editItem, description: e.target.value })} placeholder="Description..." />
                                </div>
                                <div style={{ marginBottom: 14 }}>
                                    <label style={labelStyle}>Date & Time *</label>
                                    <input type="datetime-local" required style={inputStyle}
                                        value={(() => { if (!editItem?.date) return ''; try { const d = new Date(editItem.date); if (isNaN(d.getTime())) return ''; const p = (n: number) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; } catch { return ''; } })()}
                                        onChange={e => { if (!e.target.value) setEditItem({ ...editItem, date: '' }); else { try { const d = new Date(e.target.value); if (!isNaN(d.getTime())) setEditItem({ ...editItem, date: d.toISOString() }); } catch { } } }} />
                                </div>
                                <div style={{ marginBottom: 14 }}>
                                    <label style={labelStyle}>Venue *</label>
                                    <input required style={inputStyle} value={editItem?.venue || ''} onChange={e => setEditItem({ ...editItem, venue: e.target.value })} placeholder="Grand Ballroom" />
                                </div>
                                <div style={{ marginBottom: 14 }}>
                                    <label style={labelStyle}>Capacity *</label>
                                    <input type="number" min="1" required style={inputStyle} value={editItem?.capacity || ''} onChange={e => setEditItem({ ...editItem, capacity: parseInt(e.target.value) })} />
                                </div>
                                <div style={{ marginBottom: 14 }}>
                                    <label style={labelStyle}>Price per Seat (₹) *</label>
                                    <input type="number" min="0" required style={inputStyle} value={editItem?.price_per_seat || ''} onChange={e => setEditItem({ ...editItem, price_per_seat: parseInt(e.target.value) })} />
                                </div>
                                <div style={{ marginBottom: 14 }}>
                                    <label style={labelStyle}>Cover Image</label>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <input type="file" accept="image/*" style={{ ...inputStyle, flex: 1, padding: 8 }} onChange={e => {
                                            const file = e.target.files?.[0]; if (!file) return;
                                            const reader = new FileReader();
                                            reader.onload = (ev) => {
                                                const img = new Image();
                                                img.onload = () => {
                                                    const canvas = document.createElement('canvas');
                                                    let w = img.width, h = img.height; const max = 600;
                                                    if (w > h) { if (w > max) { h *= max / w; w = max; } } else { if (h > max) { w *= max / h; h = max; } }
                                                    canvas.width = w; canvas.height = h;
                                                    canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
                                                    setEditItem({ ...editItem, image_url: canvas.toDataURL('image/jpeg', 0.6) });
                                                };
                                                img.src = ev.target?.result as string;
                                            };
                                            reader.readAsDataURL(file);
                                        }} />
                                        {editItem?.image_url && <img src={editItem.image_url} alt="" style={{ height: 40, width: 40, borderRadius: 8, objectFit: 'cover', border: `2px solid ${T.border}` }} />}
                                    </div>
                                    {!editItem?.image_url && <input style={{ ...inputStyle, marginTop: 8 }} value={editItem?.image_url || ''} onChange={e => setEditItem({ ...editItem, image_url: e.target.value })} placeholder="Or paste URL..." />}
                                </div>
                                <div style={{ marginBottom: 14 }}>
                                    <label style={labelStyle}>Status</label>
                                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={editItem?.status || 'draft'} onChange={e => setEditItem({ ...editItem, status: e.target.value })}>
                                        <option value="active">Active</option>
                                        <option value="draft">Draft</option>
                                        <option value="past">Past</option>
                                    </select>
                                </div>
                            </form>
                        </div>

                        {/* Modal footer */}
                        <div style={{ padding: '16px 24px', borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button onClick={() => setIsFormOpen(false)} style={btnSmall(T.textSec, T.surface2)}>Cancel</button>
                            <button type="submit" form="eventForm" style={btnGold}>Save Event</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Bookings Slide-Over ═══ */}
            {isSlideOverOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.3)', backdropFilter: 'blur(3px)' }} onClick={() => setIsSlideOverOpen(false)} />
                    <div style={{
                        position: 'relative', marginLeft: 'auto', width: '100%', maxWidth: 440, height: '100%',
                        background: T.surface, borderLeft: `1px solid ${T.border}`,
                        boxShadow: '-10px 0 30px rgba(0,0,0,.08)', display: 'flex', flexDirection: 'column',
                        animation: 'slideInRight .25s ease',
                    }}>
                        {/* Slide header */}
                        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                            <div>
                                <h3 style={{ fontFamily: T.fontHead, fontSize: '1.3rem', color: T.gold, margin: 0, fontWeight: 700 }}>Event Bookings</h3>
                                <p style={{ fontSize: '.78rem', color: T.textMuted, margin: '2px 0 0' }}>{events.find(e => e.id === selectedEventId)?.title}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {bookings.length > 0 && (<>
                                    <button onClick={exportToPDF} style={btnSmall(T.red, T.redBg)} title="PDF">PDF</button>
                                    <button onClick={exportToExcel} style={btnSmall(T.green, T.greenBg)} title="Excel">Excel</button>
                                </>)}
                                <button onClick={() => setIsSlideOverOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: T.textMuted, marginLeft: 8 }}>✕</button>
                            </div>
                        </div>

                        {/* Slide body */}
                        <div style={{ padding: 16, flex: 1, overflowY: 'auto' }}>
                            {loadingBookings ? (
                                <div style={{ textAlign: 'center', padding: 40 }}>
                                    <div style={{ fontSize: '1.5rem', animation: 'float 2s ease-in-out infinite' }}>📋</div>
                                    <p style={{ color: T.textMuted, marginTop: 8 }}>Loading bookings...</p>
                                </div>
                            ) : bookings.length === 0 ? (
                                <p style={{ textAlign: 'center', color: T.textMuted, marginTop: 40 }}>No bookings yet for this event.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {bookings.map(book => {
                                        const pColor = book.payment_status === 'paid' ? T.green : book.payment_status === 'pending' ? T.orange : T.red;
                                        const pBg = book.payment_status === 'paid' ? T.greenBg : book.payment_status === 'pending' ? T.orangeBg : T.redBg;
                                        return (
                                            <div key={book.id} style={{
                                                background: T.surface2, border: `1px solid ${T.border}`,
                                                borderRadius: 12, padding: 16, transition: 'border-color .2s',
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                                    <p style={{ fontWeight: 700, color: T.text, fontSize: '.95rem', margin: 0 }}>{book.attendee_name}</p>
                                                    <span style={{
                                                        padding: '3px 10px', borderRadius: 12, fontSize: '.65rem',
                                                        fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.3px',
                                                        background: pBg, color: pColor,
                                                    }}>{book.payment_status}</span>
                                                </div>
                                                <div style={{ fontSize: '.8rem', color: T.textSec }}>
                                                    <p style={{ margin: '2px 0', display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>{book.attendee_email}</span>
                                                        <span>{book.attendee_phone}</span>
                                                    </p>
                                                    <p style={{ margin: '4px 0 0', display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>{book.seats} Seat{book.seats > 1 ? 's' : ''}</span>
                                                        <span style={{ color: T.gold, fontWeight: 700, fontSize: '.9rem' }}>₹{book.total_amount}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Slide footer */}
                        <div style={{ padding: '16px 24px', borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: '.85rem', color: T.textSec }}>Total Collected (Paid)</span>
                            <span style={{ fontFamily: T.fontHead, fontSize: '1.6rem', color: T.gold, fontWeight: 700 }}>
                                ₹{bookings.filter(b => b.payment_status === 'paid').reduce((a, c) => a + c.total_amount, 0)}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Keyframe animations */}
            <style>{`
                @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
            `}</style>
        </div>
    );
}
