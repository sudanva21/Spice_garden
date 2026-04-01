import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminEvents from '../components/admin/AdminEvents';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';
import menuJson from '../data/menu.json';

/* ═══════════════════════════════════════════════════════
 * DESIGN TOKENS — light modern admin dashboard
 * ═══════════════════════════════════════════════════════ */
const T = {
    bg:       '#f5f5f0',
    surface:  '#ffffff',
    surface2: '#fafaf7',
    border:   '#e8e5dd',
    borderHi: '#d4a843',
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
    shadowLg: '0 4px 16px rgba(0,0,0,.08)',
    font:     "'DM Sans', -apple-system, system-ui, sans-serif",
    fontHead: "'Cormorant Garamond', Georgia, serif",
};

const TABS = ['Overview', 'Bookings', 'Orders', 'Menu', 'Gallery', 'Blog', 'Events', 'Settings'];
const TAB_ICONS: Record<string, string> = {
    Overview: '📊', Bookings: '📅', Orders: '🛒', Menu: '🍽️',
    Gallery: '🖼️', Blog: '✍️', Events: '🎉', Settings: '⚙️',
};

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
    pending:   { color: T.orange, bg: T.orangeBg },
    confirmed: { color: T.green,  bg: T.greenBg },
    cancelled: { color: T.red,    bg: T.redBg },
    preparing: { color: T.blue,   bg: T.blueBg },
    ready:     { color: T.purple, bg: T.purpleBg },
    delivered: { color: T.green,  bg: T.greenBg },
    paid:      { color: T.green,  bg: T.greenBg },
};

/* ─── Reusable sub-components ─── */
function Badge({ status }: { status: string }) {
    const s = STATUS_COLORS[status] || { color: T.textMuted, bg: '#f3f4f6' };
    return (
        <span style={{
            padding: '4px 12px', borderRadius: 20,
            background: s.bg, color: s.color,
            fontFamily: T.font, fontSize: '.72rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '.5px',
        }}>{status}</span>
    );
}

function Card({ children, style, ...p }: any) {
    return (
        <div style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: T.radius, padding: 24, boxShadow: T.shadow,
            transition: 'box-shadow .2s ease, border-color .2s ease', ...style
        }} {...p}>{children}</div>
    );
}

function Stat({ label, value, color, icon }: { label: string; value: string | number; color: string; icon: string }) {
    return (
        <Card style={{ borderLeft: `4px solid ${color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{ fontFamily: T.font, fontSize: '.82rem', color: T.textSec, marginBottom: 8 }}>{label}</p>
                    <h3 style={{ fontSize: '1.8rem', fontFamily: T.fontHead, fontWeight: 700, color: T.text, margin: 0 }}>{value}</h3>
                </div>
                <span style={{ fontSize: '2rem', opacity: .5 }}>{icon}</span>
            </div>
        </Card>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: `1px solid ${T.border}`, background: T.surface2,
    color: T.text, fontFamily: T.font, fontSize: '.9rem',
    outline: 'none', transition: 'border-color .2s',
};

const labelStyle: React.CSSProperties = {
    display: 'block', fontFamily: T.font, fontSize: '.75rem',
    fontWeight: 600, color: T.textSec, marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: '.5px',
};

const btnStyle = (color: string, bg: string): React.CSSProperties => ({
    padding: '6px 16px', borderRadius: 8, border: `1px solid ${color}`,
    background: bg, color, cursor: 'pointer',
    fontFamily: T.font, fontSize: '.78rem', fontWeight: 600,
    transition: 'all .15s ease',
});

const btnGold: React.CSSProperties = {
    padding: '10px 22px', borderRadius: 10, border: 'none',
    background: `linear-gradient(135deg, ${T.gold}, #d4a843)`, color: '#fff',
    cursor: 'pointer', fontFamily: T.font, fontSize: '.85rem', fontWeight: 700,
    boxShadow: '0 2px 8px rgba(184,134,11,.25)', transition: 'transform .15s',
};

function Input({ label, value, onChange, type = 'text', placeholder, ...props }: any) {
    return (
        <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>{label}</label>
            {type === 'textarea' ? (
                <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' as const }}
                    value={value || ''} onChange={(e: any) => onChange(e.target.value)}
                    placeholder={placeholder} rows={3} {...props} />
            ) : type === 'checkbox' ? (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: T.font, fontSize: '.85rem', cursor: 'pointer', color: T.text }}>
                    <input type="checkbox" checked={!!value} onChange={(e: any) => onChange(e.target.checked)}
                        style={{ width: 18, height: 18, accentColor: T.gold }} {...props} />
                    {placeholder || label}
                </label>
            ) : (
                <input style={inputStyle} type={type} value={value || ''}
                    onChange={(e: any) => onChange(e.target.value)} placeholder={placeholder || label} {...props} />
            )}
        </div>
    );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
    return (
        <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>{label}</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={value} onChange={(e) => onChange(e.target.value)}>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );
}

function ImageUpload({ label, value, onChange }: any) {
    return (
        <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>{label}</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input type="file" accept="image/*" onChange={(e: any) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        const img = new Image();
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            let w = img.width, h = img.height; const max = 800;
                            if (w > h) { if (w > max) { h *= max / w; w = max; } } else { if (h > max) { w *= max / h; h = max; } }
                            canvas.width = w; canvas.height = h;
                            canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
                            onChange(canvas.toDataURL('image/jpeg', 0.7));
                        };
                        img.src = ev.target?.result as string;
                    };
                    reader.readAsDataURL(file);
                }} style={{ ...inputStyle, flex: 1, padding: 8 }} />
                {value && <img src={value} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, border: `2px solid ${T.border}` }} alt="" />}
            </div>
            {!value && <input style={{ ...inputStyle, marginTop: 8 }} value={value || ''} onChange={(e: any) => onChange(e.target.value)} placeholder="Or paste image URL..." />}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
 * MAIN ADMIN COMPONENT
 * ═══════════════════════════════════════════════════════ */
export default function Admin() {
    const navigate = useNavigate();
    const [tab, setTab] = useState('Overview');
    const [data, setData] = useState<any>({ bookings: [], orders: [], menu: [], gallery: [], blog: [] });
    const [loading, setLoading] = useState(true);
    const [editItem, setEditItem] = useState<any>(null);
    const [newItem, setNewItem] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogout = () => { localStorage.removeItem('admin_token'); navigate('/admin/login'); };

    const fetchAll = async () => {
        setLoading(true);
        try {
            const getCol = async (name: string) => {
                const qs = await getDocs(collection(db, name));
                return qs.docs.map(d => ({ id: d.id, ...d.data() }));
            };
            const [bookings, orders, fbMenu, gallery, blog] = await Promise.all([
                getCol('bookings').catch(() => []),
                getCol('orders').catch(() => []),
                getCol('menu').catch(() => []),
                getCol('gallery').catch(() => []),
                getCol('blog').catch(() => []),
            ]);
            // Merge: if Firebase menu is empty, fall back to local JSON data
            const menuItems = fbMenu.length > 0
                ? fbMenu
                : menuJson.map((m: any, i: number) => ({ id: `local-${i}`, ...m, available: true, is_local: true }));
            setData({ bookings, orders, menu: menuItems, gallery, blog });
        } catch (err) { console.error('Fetch error:', err); }
        setLoading(false);
    };

    useEffect(() => { fetchAll(); }, []);

    /* ─── CRUD helpers ─── */
    const updateBooking = async (id: string, status: string) => {
        const tId = toast.loading('Updating...');
        try {
            await updateDoc(doc(db, 'bookings', id), { status });
            setData({ ...data, bookings: data.bookings.map((b: any) => b.id === id ? { ...b, status } : b) });
            toast.success(`Booking ${status}`, { id: tId });
        } catch (e: any) { toast.error(e.message, { id: tId }); }
    };

    const updateOrder = async (id: string, updates: any) => {
        if (updates.order_status === 'delivered') {
            const proof = window.prompt("Enter Proof of Delivery:");
            if (proof) updates.delivery_proof = proof;
            else if (proof === null) return;
        }
        const tId = toast.loading('Updating...');
        try {
            await updateDoc(doc(db, 'orders', id), updates);
            setData({ ...data, orders: data.orders.map((o: any) => o.id === id ? { ...o, ...updates } : o) });
            toast.success('Order updated', { id: tId });
        } catch (e: any) { toast.error(e.message, { id: tId }); }
    };

    const saveMenuItem = async (item: any) => {
        const tId = toast.loading('Saving...');
        try {
            const payload = { ...item };
            delete payload.is_local;
            const id = payload.id;
            delete payload.id;
            if (id && !String(id).startsWith('local-')) await updateDoc(doc(db, 'menu', id), payload);
            else await addDoc(collection(db, 'menu'), payload);
            toast.success('Menu item saved', { id: tId });
            setEditItem(null); setNewItem(null); fetchAll();
        } catch (e: any) { toast.error(e.message, { id: tId }); }
    };

    const deleteItem = async (endpoint: string, id: string, key: string) => {
        if (!confirm('Delete this item?')) return;
        if (String(id).startsWith('local-')) { toast.error('Cannot delete a local-only item. Add it to Firebase first.'); return; }
        const tId = toast.loading('Deleting...');
        try {
            await deleteDoc(doc(db, endpoint, id));
            setData({ ...data, [key]: data[key].filter((i: any) => i.id !== id) });
            toast.success('Deleted', { id: tId });
        } catch (e: any) { toast.error(e.message, { id: tId }); }
    };

    const saveBlog = async (post: any) => {
        const tId = toast.loading('Saving...');
        try {
            const payload = { ...post };
            const id = payload.id; delete payload.id;
            if (id) await updateDoc(doc(db, 'blog', id), payload);
            else await addDoc(collection(db, 'blog'), payload);
            toast.success('Blog saved!', { id: tId });
            setEditItem(null); setNewItem(null); fetchAll();
        } catch (e: any) { toast.error(e.message, { id: tId }); }
    };

    const syncMenuToFirebase = async () => {
        if (!confirm(`Sync all ${menuJson.length} menu items from menu.json to Firebase? This will add them to the 'menu' collection.`)) return;
        const tId = toast.loading(`Syncing ${menuJson.length} items...`);
        try {
            for (const item of menuJson) {
                await addDoc(collection(db, 'menu'), {
                    name: item.name, description: item.description || '',
                    price: item.price, category: item.category,
                    is_veg: item.is_veg, available: true, sort_order: 1,
                    image_url: item.image_url || '',
                });
            }
            toast.success(`Synced ${menuJson.length} items!`, { id: tId });
            fetchAll();
        } catch (e: any) { toast.error(e.message, { id: tId }); }
    };

    const getTabCount = (t: string): number => {
        const m: Record<string, number> = {
            Bookings: data.bookings.length, Orders: data.orders.length,
            Menu: data.menu.length, Gallery: data.gallery.length, Blog: data.blog.length,
        };
        return m[t] ?? -1;
    };

    /* ═══════════════════════════════════════
     *  RENDER
     * ═══════════════════════════════════════ */
    return (
        <div style={{ minHeight: '100vh', background: T.bg, fontFamily: T.font }}>
            <div style={{ display: 'flex', maxWidth: 1440, margin: '0 auto', minHeight: '100vh' }}>

                {/* ═══ SIDEBAR ═══ */}
                <aside style={{
                    width: 260, flexShrink: 0, background: T.surface,
                    borderRight: `1px solid ${T.border}`, padding: '28px 0',
                    position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
                    display: window.innerWidth > 768 ? 'flex' : 'none',
                    flexDirection: 'column',
                }}>
                    <div style={{ padding: '0 20px', marginBottom: 32 }}>
                        <h2 style={{ fontFamily: T.fontHead, color: T.gold, fontSize: '1.6rem', margin: '0 0 4px 0' }}>🌿 Spice Garden</h2>
                        <p style={{ fontSize: '.75rem', color: T.textMuted, margin: 0 }}>Admin Dashboard</p>
                    </div>

                    <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px' }}>
                        {TABS.map(t => {
                            const active = tab === t;
                            const count = getTabCount(t);
                            return (
                                <button key={t} onClick={() => { setTab(t); setEditItem(null); setNewItem(null); setSearchQuery(''); }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
                                        borderRadius: 10, border: 'none', cursor: 'pointer',
                                        background: active ? T.goldBg : 'transparent',
                                        color: active ? T.gold : T.textSec,
                                        fontFamily: T.font, fontSize: '.88rem', fontWeight: active ? 700 : 500,
                                        transition: 'all .15s ease', textAlign: 'left', width: '100%',
                                    }}>
                                    <span style={{ fontSize: '1.1rem' }}>{TAB_ICONS[t]}</span>
                                    <span style={{ flex: 1 }}>{t}</span>
                                    {count >= 0 && <span style={{
                                        fontSize: '.72rem', background: active ? T.gold : '#e8e5dd',
                                        color: active ? '#fff' : T.textSec, padding: '2px 8px', borderRadius: 10,
                                        fontWeight: 700, minWidth: 24, textAlign: 'center',
                                    }}>{count}</span>}
                                </button>
                            );
                        })}
                    </nav>

                    <div style={{ padding: '0 20px', marginTop: 'auto', paddingTop: 20 }}>
                        <button onClick={handleLogout} style={{
                            ...btnStyle(T.red, T.redBg), width: '100%', padding: '10px 16px',
                            borderRadius: 10, fontSize: '.85rem', textAlign: 'center',
                        }}>🚪 Logout</button>
                    </div>
                </aside>

                {/* ═══ MOBILE TOP BAR ═══ */}
                {window.innerWidth <= 768 && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
                        background: T.surface, borderBottom: `1px solid ${T.border}`,
                        padding: '12px 16px', display: 'flex', gap: 8, overflowX: 'auto',
                    }}>
                        {TABS.map(t => (
                            <button key={t} onClick={() => { setTab(t); setEditItem(null); setNewItem(null); }}
                                style={{
                                    padding: '8px 14px', borderRadius: 8, border: 'none', whiteSpace: 'nowrap',
                                    background: tab === t ? T.goldBg : 'transparent',
                                    color: tab === t ? T.gold : T.textSec,
                                    fontFamily: T.font, fontSize: '.82rem', fontWeight: tab === t ? 700 : 500,
                                    cursor: 'pointer',
                                }}>{TAB_ICONS[t]} {t}</button>
                        ))}
                    </div>
                )}

                {/* ═══ MAIN CONTENT ═══ */}
                <main style={{
                    flex: 1, padding: window.innerWidth > 768 ? '32px 40px' : '72px 16px 24px',
                    minWidth: 0, overflowY: 'auto',
                }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 100 }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: 16, animation: 'float 2s ease-in-out infinite' }}>🍽️</div>
                            <p style={{ color: T.textMuted, fontFamily: T.font, fontSize: '.95rem' }}>Loading dashboard data...</p>
                        </div>
                    ) : (
                        <div style={{ animation: 'fadeIn .3s ease' }}>

                            {/* ═══ OVERVIEW ═══ */}
                            {tab === 'Overview' && (
                                <div>
                                    <h2 style={{ fontFamily: T.fontHead, fontSize: '2rem', color: T.text, marginBottom: 28, fontWeight: 700 }}>Welcome back 👋</h2>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                                        <Stat label="Pending Orders" value={data.orders.filter((o: any) => o.order_status === 'pending').length} color={T.orange} icon="🛒" />
                                        <Stat label="Confirmed Bookings" value={data.bookings.filter((b: any) => b.status === 'confirmed').length} color={T.green} icon="📅" />
                                        <Stat label="Total Menu Items" value={data.menu.length} color={T.gold} icon="🍽️" />
                                        <Stat label="Total Revenue" value={'₹' + data.orders.filter((o: any) => o.payment_status === 'paid').reduce((a: number, o: any) => a + Number(o.total || 0), 0)} color={T.blue} icon="💰" />
                                    </div>

                                    {/* Recent Bookings */}
                                    <Card style={{ marginTop: 28 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                            <h3 style={{ fontFamily: T.fontHead, fontSize: '1.3rem', color: T.text, margin: 0 }}>Recent Bookings</h3>
                                            <button onClick={() => setTab('Bookings')} style={{ ...btnStyle(T.gold, T.goldBg), fontSize: '.78rem' }}>View All →</button>
                                        </div>
                                        {data.bookings.length === 0
                                            ? <p style={{ color: T.textMuted, fontSize: '.9rem' }}>No bookings yet</p>
                                            : data.bookings.slice(0, 5).map((b: any) => (
                                                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${T.border}` }}>
                                                    <div>
                                                        <p style={{ fontSize: '.9rem', fontWeight: 600, color: T.text, margin: 0 }}>{b.name}</p>
                                                        <p style={{ fontSize: '.78rem', color: T.textMuted, margin: '2px 0 0' }}>{b.visit_date} • {b.time_slot}</p>
                                                    </div>
                                                    <Badge status={b.status || 'pending'} />
                                                </div>
                                            ))}
                                    </Card>
                                </div>
                            )}

                            {/* ═══ BOOKINGS ═══ */}
                            {tab === 'Bookings' && (
                                <div>
                                    <h2 style={{ fontFamily: T.fontHead, fontSize: '1.8rem', color: T.text, marginBottom: 20 }}>Reservations</h2>
                                    {data.bookings.length === 0 && <Card><p style={{ color: T.textMuted, textAlign: 'center', padding: 40 }}>No reservations yet</p></Card>}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {data.bookings.map((b: any) => (
                                            <Card key={b.id}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                                                    <div>
                                                        <h3 style={{ fontSize: '1.05rem', margin: '0 0 4px', color: T.text }}>{b.name}</h3>
                                                        <p style={{ fontSize: '.82rem', color: T.textMuted, margin: 0 }}>{b.phone || b.email}</p>
                                                    </div>
                                                    <Badge status={b.status || 'pending'} />
                                                </div>
                                                <div style={{ display: 'flex', gap: 20, marginTop: 12, fontSize: '.85rem', color: T.textSec, flexWrap: 'wrap' }}>
                                                    <span>📅 {b.visit_date ? new Date(b.visit_date).toLocaleDateString('en-IN') : '—'}</span>
                                                    <span>⏰ {b.time_slot || '—'}</span>
                                                    <span>👥 {b.group_size || '—'} guests</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                                                    {b.status !== 'confirmed' && <button onClick={() => updateBooking(b.id, 'confirmed')} style={btnStyle(T.green, T.greenBg)}>✓ Confirm</button>}
                                                    {b.status !== 'cancelled' && <button onClick={() => updateBooking(b.id, 'cancelled')} style={btnStyle(T.red, T.redBg)}>✕ Cancel</button>}
                                                    <button onClick={() => deleteItem('bookings', b.id, 'bookings')} style={btnStyle(T.red, T.redBg)}>🗑️</button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ═══ ORDERS ═══ */}
                            {tab === 'Orders' && (() => {
                                const activeOrders = data.orders.filter((o: any) => !['delivered', 'cancelled'].includes(o.order_status));
                                const historyOrders = data.orders.filter((o: any) => ['delivered', 'cancelled'].includes(o.order_status));
                                const showHistory = newItem === 'history';
                                const searchStr = searchQuery.toLowerCase();
                                const baseList = showHistory ? historyOrders : activeOrders;
                                const displayOrders = baseList.filter((o: any) => (o.customer_name || '').toLowerCase().includes(searchStr) || (o.customer_phone || '').includes(searchStr));

                                return (
                                    <div>
                                        <h2 style={{ fontFamily: T.fontHead, fontSize: '1.8rem', color: T.text, marginBottom: 20 }}>Orders</h2>
                                        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button onClick={() => setNewItem(null)} style={{
                                                    ...btnGold,
                                                    background: !showHistory ? `linear-gradient(135deg, ${T.gold}, #d4a843)` : 'transparent',
                                                    color: !showHistory ? '#fff' : T.gold, border: `1.5px solid ${T.gold}`,
                                                    boxShadow: !showHistory ? '0 2px 8px rgba(184,134,11,.25)' : 'none',
                                                }}>Active ({activeOrders.length})</button>
                                                <button onClick={() => setNewItem('history')} style={{
                                                    ...btnGold,
                                                    background: showHistory ? `linear-gradient(135deg, ${T.gold}, #d4a843)` : 'transparent',
                                                    color: showHistory ? '#fff' : T.gold, border: `1.5px solid ${T.gold}`,
                                                    boxShadow: showHistory ? '0 2px 8px rgba(184,134,11,.25)' : 'none',
                                                }}>History ({historyOrders.length})</button>
                                            </div>
                                            <input type="text" placeholder="Search by name or phone..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                                style={{ ...inputStyle, maxWidth: 280 }} />
                                        </div>
                                        {displayOrders.length === 0 && <Card><p style={{ textAlign: 'center', color: T.textMuted, padding: 40 }}>No orders found</p></Card>}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            {displayOrders.map((o: any) => (
                                                <Card key={o.id}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                                                        <div>
                                                            <h3 style={{ fontSize: '1.05rem', margin: '0 0 4px', color: T.text }}>{o.customer_name}</h3>
                                                            <p style={{ fontSize: '.82rem', color: T.textMuted, margin: 0 }}>{o.customer_phone}</p>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <Badge status={o.order_status || 'pending'} />
                                                            <p style={{ fontFamily: T.fontHead, fontSize: '1.3rem', fontWeight: 700, color: T.gold, margin: '4px 0 0' }}>₹{o.total}</p>
                                                        </div>
                                                    </div>
                                                    <div style={{ background: T.surface2, borderRadius: 10, padding: 14, marginBottom: 12, border: `1px solid ${T.border}` }}>
                                                        {(Array.isArray(o.items) ? o.items : []).map((item: any, idx: number) => (
                                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', padding: '4px 0', color: T.text }}>
                                                                <span>{item.name} × {item.qty}</span><span style={{ color: T.gold, fontWeight: 600 }}>₹{item.price * item.qty}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <p style={{ fontSize: '.82rem', color: T.textSec, marginBottom: 4 }}>📍 {o.customer_address}</p>
                                                    <p style={{ fontSize: '.82rem', color: T.textSec, marginBottom: 8 }}>{o.payment_method === 'upi' ? '📱 UPI' : '💵 COD'} • <Badge status={o.payment_status || 'pending'} /></p>
                                                    {o.delivery_proof && <p style={{ fontSize: '.82rem', color: T.green, background: T.greenBg, padding: '8px 12px', borderRadius: 8, marginBottom: 12 }}>✓ Proof: {o.delivery_proof}</p>}
                                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                                                        {['pending', 'preparing', 'ready', 'delivered'].map(s => (
                                                            <button key={s} onClick={() => updateOrder(o.id, { order_status: s })} disabled={o.order_status === s}
                                                                style={{ ...btnStyle(STATUS_COLORS[s]?.color || T.textMuted, STATUS_COLORS[s]?.bg || '#f3f4f6'),
                                                                    opacity: o.order_status === s ? .4 : 1, textTransform: 'capitalize' as const,
                                                                    cursor: o.order_status === s ? 'default' : 'pointer',
                                                                }}>{s}</button>
                                                        ))}
                                                        {o.payment_status !== 'paid' && <button onClick={() => updateOrder(o.id, { payment_status: 'paid' })} style={btnStyle(T.green, T.greenBg)}>💰 Mark Paid</button>}
                                                        <button onClick={() => deleteItem('orders', o.id, 'orders')} style={btnStyle(T.red, T.redBg)}>🗑️</button>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* ═══ MENU ═══ */}
                            {tab === 'Menu' && (() => {
                                const searchStr = searchQuery.toLowerCase();
                                const displayMenu = data.menu.filter((m: any) =>
                                    (m.name || '').toLowerCase().includes(searchStr) ||
                                    (m.category || '').toLowerCase().includes(searchStr)
                                );
                                const localCount = data.menu.filter((m: any) => m.is_local).length;

                                return (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                                            <h2 style={{ fontFamily: T.fontHead, fontSize: '1.8rem', color: T.text, margin: 0 }}>Menu ({data.menu.length})</h2>
                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                <button onClick={() => setNewItem({ name: '', description: '', price: 0, category: 'Starters', image_url: '', is_veg: true, available: true, sort_order: 99 })} style={btnGold}>+ Add Item</button>
                                                {localCount > 0 && (
                                                    <button onClick={syncMenuToFirebase} style={btnStyle(T.blue, T.blueBg)}>⬆️ Sync {localCount} to Firebase</button>
                                                )}
                                            </div>
                                        </div>

                                        {localCount > 0 && (
                                            <div style={{ background: T.blueBg, border: `1px solid #bfdbfe`, borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: '.85rem', color: T.blue }}>
                                                ℹ️ Showing {localCount} items from local menu.json (Firebase menu collection is empty). Click "Sync to Firebase" to push them.
                                            </div>
                                        )}

                                        <input type="text" placeholder="Search menu by name or category..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                            style={{ ...inputStyle, marginBottom: 16, maxWidth: 350 }} />

                                        {(newItem || editItem) && tab === 'Menu' && (() => {
                                            const item = editItem || newItem;
                                            const setItem = editItem ? setEditItem : setNewItem;
                                            return (
                                                <Card style={{ marginBottom: 20, borderLeft: `4px solid ${T.gold}` }}>
                                                    <h3 style={{ marginBottom: 16, color: T.gold, fontFamily: T.fontHead, fontSize: '1.3rem' }}>{editItem ? '✏️ Edit' : '➕ New'} Menu Item</h3>
                                                    <Input label="Name" value={item.name} onChange={(v: string) => setItem({ ...item, name: v })} placeholder="Dish name" />
                                                    <Input label="Description" value={item.description} onChange={(v: string) => setItem({ ...item, description: v })} type="textarea" placeholder="Short description" />
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                                        <Input label="Price (₹)" value={item.price} onChange={(v: string) => setItem({ ...item, price: parseFloat(v) || 0 })} type="number" />
                                                        <Select label="Category" value={item.category} onChange={(v: string) => setItem({ ...item, category: v })}
                                                            options={['Starters', 'Main Course (Veg)', 'Main Course (Non-Veg)', 'Biryani', 'Breads', 'Chinese', 'Soups', 'Desserts']} />
                                                    </div>
                                                    <ImageUpload label="Image" value={item.image_url} onChange={(v: string) => setItem({ ...item, image_url: v })} />
                                                    <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
                                                        <Input label="Vegetarian" value={item.is_veg} onChange={(v: boolean) => setItem({ ...item, is_veg: v })} type="checkbox" />
                                                        <Input label="Available" value={item.available} onChange={(v: boolean) => setItem({ ...item, available: v })} type="checkbox" />
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 10 }}>
                                                        <button onClick={() => saveMenuItem(item)} style={btnGold}>💾 Save</button>
                                                        <button onClick={() => { setEditItem(null); setNewItem(null); }} style={btnStyle(T.textSec, T.surface2)}>Cancel</button>
                                                    </div>
                                                </Card>
                                            );
                                        })()}

                                        {displayMenu.length === 0 && <Card><p style={{ textAlign: 'center', color: T.textMuted, padding: 40 }}>No menu items found</p></Card>}

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
                                            {displayMenu.map((m: any) => (
                                                <Card key={m.id} style={{ padding: 0, overflow: 'hidden' }}>
                                                    <div style={{ display: 'flex', gap: 14, padding: 16 }}>
                                                        {m.image_url && <img src={m.image_url} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 10 }} />}
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                <h4 style={{ fontSize: '.95rem', margin: 0, color: T.text }}>{m.is_veg ? '🟢' : '🔴'} {m.name}</h4>
                                                                <span style={{ color: T.gold, fontWeight: 700, fontFamily: T.fontHead, fontSize: '1.1rem', whiteSpace: 'nowrap' }}>
                                                                    {String(m.price).toLowerCase() === 'apc' ? 'APC' : `₹${m.price}`}
                                                                </span>
                                                            </div>
                                                            <p style={{ fontSize: '.75rem', color: T.textMuted, margin: '4px 0' }}>
                                                                {m.category} {m.is_local && <span style={{ color: T.blue }}>• LOCAL</span>}
                                                                {m.available === false && <span style={{ color: T.red }}> • UNAVAILABLE</span>}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 8, padding: '0 16px 12px' }}>
                                                        <button onClick={() => setEditItem({ ...m })} style={btnStyle(T.gold, T.goldBg)}>Edit</button>
                                                        <button onClick={() => deleteItem('menu', m.id, 'menu')} style={btnStyle(T.red, T.redBg)}>Delete</button>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* ═══ GALLERY ═══ */}
                            {tab === 'Gallery' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                        <h2 style={{ fontFamily: T.fontHead, fontSize: '1.8rem', color: T.text, margin: 0 }}>Gallery</h2>
                                        <button onClick={() => setNewItem({ caption: '', category: 'Ambiance', image_url: '', active: true, sort_order: 99 })} style={btnGold}>+ Add Photo</button>
                                    </div>
                                    {(newItem || editItem) && tab === 'Gallery' && (() => {
                                        const item = editItem || newItem;
                                        const setItem = editItem ? setEditItem : setNewItem;
                                        return (
                                            <Card style={{ marginBottom: 20, borderLeft: `4px solid ${T.gold}` }}>
                                                <h3 style={{ marginBottom: 16, color: T.gold, fontFamily: T.fontHead }}>{editItem ? '✏️ Edit' : '➕ New'} Photo</h3>
                                                <Input label="Caption" value={item.caption} onChange={(v: string) => setItem({ ...item, caption: v })} placeholder="Photo caption" />
                                                <Select label="Category" value={item.category} onChange={(v: string) => setItem({ ...item, category: v })} options={['Food', 'Ambiance', 'Events']} />
                                                <ImageUpload label="Image" value={item.image_url} onChange={(v: string) => setItem({ ...item, image_url: v })} />
                                                <div style={{ display: 'flex', gap: 10 }}>
                                                    <button onClick={async () => {
                                                        try {
                                                            const payload = { ...item }; const id = payload.id; delete payload.id;
                                                            if (id) await updateDoc(doc(db, 'gallery', id), payload);
                                                            else await addDoc(collection(db, 'gallery'), payload);
                                                            setEditItem(null); setNewItem(null); fetchAll();
                                                            toast.success('Photo saved!');
                                                        } catch (e: any) { toast.error(e.message); }
                                                    }} style={btnGold}>💾 Save</button>
                                                    <button onClick={() => { setEditItem(null); setNewItem(null); }} style={btnStyle(T.textSec, T.surface2)}>Cancel</button>
                                                </div>
                                            </Card>
                                        );
                                    })()}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                                        {data.gallery.map((img: any) => (
                                            <Card key={img.id} style={{ padding: 0, overflow: 'hidden' }}>
                                                <img src={img.image_url} alt={img.caption} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                                                <div style={{ padding: '12px 16px' }}>
                                                    <p style={{ fontSize: '.85rem', fontWeight: 500, marginBottom: 8, color: T.text }}>{img.caption}</p>
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <button onClick={() => setEditItem({ ...img })} style={btnStyle(T.gold, T.goldBg)}>Edit</button>
                                                        <button onClick={() => deleteItem('gallery', img.id, 'gallery')} style={btnStyle(T.red, T.redBg)}>Delete</button>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ═══ BLOG ═══ */}
                            {tab === 'Blog' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                        <h2 style={{ fontFamily: T.fontHead, fontSize: '1.8rem', color: T.text, margin: 0 }}>Blog Posts</h2>
                                        <button onClick={() => setNewItem({ title: '', slug: '', content: '', excerpt: '', category: 'Food', author: 'Spice Garden Team', featured_image_url: '', status: 'published' })} style={btnGold}>+ New Post</button>
                                    </div>
                                    {(newItem || editItem) && tab === 'Blog' && (() => {
                                        const item = editItem || newItem;
                                        const setItem = editItem ? setEditItem : setNewItem;
                                        return (
                                            <Card style={{ marginBottom: 20, borderLeft: `4px solid ${T.gold}` }}>
                                                <h3 style={{ marginBottom: 16, color: T.gold, fontFamily: T.fontHead }}>{editItem ? '✏️ Edit' : '➕ New'} Blog Post</h3>
                                                <Input label="Title" value={item.title} onChange={(v: string) => setItem({ ...item, title: v, slug: v.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} placeholder="Title" />
                                                <Input label="Excerpt" value={item.excerpt} onChange={(v: string) => setItem({ ...item, excerpt: v })} placeholder="Summary" />
                                                <Input label="Content" value={item.content} onChange={(v: string) => setItem({ ...item, content: v })} type="textarea" placeholder="Full post..." />
                                                <ImageUpload label="Featured Image" value={item.featured_image_url} onChange={(v: string) => setItem({ ...item, featured_image_url: v })} />
                                                <div style={{ display: 'flex', gap: 10 }}>
                                                    <button onClick={() => saveBlog(item)} style={btnGold}>💾 Save</button>
                                                    <button onClick={() => { setEditItem(null); setNewItem(null); }} style={btnStyle(T.textSec, T.surface2)}>Cancel</button>
                                                </div>
                                            </Card>
                                        );
                                    })()}
                                    {data.blog.map((p: any) => (
                                        <Card key={p.id} style={{ marginBottom: 12 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <h4 style={{ fontSize: '.95rem', margin: '0 0 4px', color: T.text }}>{p.title}</h4>
                                                    <p style={{ fontSize: '.78rem', color: T.textMuted, margin: 0 }}>{p.category} • {p.author}</p>
                                                </div>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button onClick={() => setEditItem({ ...p })} style={btnStyle(T.gold, T.goldBg)}>Edit</button>
                                                    <button onClick={() => deleteItem('blog', p.id, 'blog')} style={btnStyle(T.red, T.redBg)}>Delete</button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {/* ═══ EVENTS ═══ */}
                            {tab === 'Events' && <AdminEvents />}

                            {/* ═══ SETTINGS ═══ */}
                            {tab === 'Settings' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    <h2 style={{ fontFamily: T.fontHead, fontSize: '1.8rem', color: T.text, margin: 0 }}>Settings</h2>
                                    <Card>
                                        <h3 style={{ marginBottom: 20, color: T.gold, fontFamily: T.fontHead, fontSize: '1.3rem' }}>⚙️ Restaurant Info</h3>
                                        {[
                                            { label: 'Restaurant Name', value: 'Spice Garden', icon: '🏪' },
                                            { label: 'Phone Number', value: '097418 00400', icon: '📞' },
                                            { label: 'WhatsApp Number', value: '9741800400', icon: '💬' },
                                            { label: 'UPI ID', value: '8050280065@fam', icon: '💳' },
                                            { label: 'Address', value: 'Jadhav Farm, Gokak, Karnataka', icon: '📍' },
                                            { label: 'Timings', value: 'Mon-Sun: 12-3 PM, 7-11 PM', icon: '🕐' },
                                        ].map(s => (
                                            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: `1px solid ${T.border}` }}>
                                                <span style={{ fontSize: '.88rem', color: T.textSec }}>{s.icon} {s.label}</span>
                                                <span style={{ fontSize: '.88rem', fontWeight: 600, color: T.text }}>{s.value}</span>
                                            </div>
                                        ))}
                                        <p style={{ fontSize: '.78rem', color: T.textMuted, marginTop: 20 }}>To update, contact developer or edit source code.</p>
                                    </Card>

                                    <Card style={{ borderLeft: `4px solid ${T.blue}` }}>
                                        <h3 style={{ marginBottom: 8, color: T.blue, fontFamily: T.fontHead }}>Database Tools</h3>
                                        <p style={{ fontSize: '.82rem', color: T.textSec, marginBottom: 16 }}>Sync your local menu.json data to Firebase Firestore.</p>
                                        <button onClick={syncMenuToFirebase} style={btnStyle(T.blue, T.blueBg)}>⬆️ Sync Menu to Firebase ({menuJson.length} items)</button>
                                    </Card>
                                </div>
                            )}

                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
