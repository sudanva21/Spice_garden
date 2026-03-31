import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminEvents from '../components/admin/AdminEvents';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

const TABS = ['Overview', 'Bookings', 'Orders', 'Menu', 'Gallery', 'Blog', 'Events', 'Settings'];

const MOCK_DATA = [
    { name: "Butter Chicken", desc: "Velvety tomato gravy with tender chicken chunk, finished with fenugreek and cream.", price: 420, cat: "Main Course (Non-Veg)", veg: false, imgUrl: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=800" },
    { name: "Paneer Tikka Masala", desc: "Charcoal-smoked paneer cubes in a robust, spiced tomato and onion gravy.", price: 350, cat: "Main Course (Veg)", veg: true, imgUrl: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&q=80&w=800" },
    { name: "Hyderabadi Chicken Dum Biryani", desc: "Aromatic basmati rice layered with marinated chicken, slow-cooked in dum style.", price: 450, cat: "Biryani", veg: false, imgUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800" },
    { name: "Dal Makhani", desc: "Overnight simmered black lentils and kidney beans with butter and cream.", price: 280, cat: "Main Course (Veg)", veg: true, imgUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800" },
    { name: "Garlic Naan", desc: "Soft and fluffy Indian bread topped with minced garlic and cilantro.", price: 80, cat: "Breads", veg: true, imgUrl: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?auto=format&fit=crop&q=80&w=800" },
    { name: "Vegetable Hakka Noodles", desc: "Wok-tossed noodles with crunchy wok-fried vegetables and soy sauce.", price: 220, cat: "Chinese", veg: true, imgUrl: "https://images.unsplash.com/photo-1616548325143-69623e1eebce?auto=format&fit=crop&q=80&w=800" },
    { name: "Manchow Soup", desc: "Spicy and tangy dark brown soup topped with crispy fried noodles.", price: 150, cat: "Soups", veg: true, imgUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800" },
    { name: "Mutton Rogan Josh", desc: "Kashmiri delicacy of tender mutton pieces in a fiery red gravy.", price: 550, cat: "Main Course (Non-Veg)", veg: false, imgUrl: "https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&q=80&w=800" }
];

// ─── Input component defined OUTSIDE Admin to prevent re-mount on state changes ───
function AdminInput({ label, value, onChange, type = 'text', placeholder, ...props }: any) {
    return (
        <div style={{ marginBottom: 16 }}>
            <label className="admin-label">{label}</label>
            {type === 'textarea' ? (
                <textarea
                    className="admin-textarea"
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={3}
                    {...props}
                />
            ) : type === 'checkbox' ? (
                <label className="admin-checkbox">
                    <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} {...props} />
                    {placeholder || label}
                </label>
            ) : (
                <input
                    className="admin-input"
                    type={type}
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder || label}
                    {...props}
                />
            )}
        </div>
    );
}

function AdminSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <label className="admin-label">{label}</label>
            <select className="admin-select" value={value} onChange={e => onChange(e.target.value)}>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );
}

async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, onChange: (b64: string) => void) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const max = 800; // auto-compress to save firestore string memory
            if (width > height) { if (width > max) { height *= max / width; width = max; } }
            else { if (height > max) { width *= max / height; height = max; } }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            onChange(canvas.toDataURL('image/jpeg', 0.7)); // 70% quality JPEG Base64
        };
        img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
}

function ImageUploadInput({ label, value, onChange }: any) {
    return (
        <div style={{ marginBottom: 16 }}>
            <label className="admin-label">{label} (Auto-compressed base64)</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, onChange)} style={{ flex: 1, padding: '12px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid rgba(212,168,67,0.2)' }} />
                {value && <img src={value} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--gold)' }} alt="preview" />}
            </div>
            {!value && <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 4 }}>Alternatively, paste a URL below:</p>}
            {!value && <AdminInput value={value} onChange={onChange} placeholder="https://..." />}
        </div>
    );
}

const STATUS_COLORS: Record<string, string> = {
    pending: '#f39c12', confirmed: '#27ae60', cancelled: '#e74c3c',
    preparing: '#3498db', ready: '#9b59b6', delivered: '#27ae60', paid: '#27ae60'
};

function StatusBadge({ status }: { status: string }) {
    const color = STATUS_COLORS[status] || '#6c757d';
    return (
        <span style={{
            padding: '4px 14px', borderRadius: 20,
            background: `${color}18`, color,
            fontFamily: 'DM Sans', fontSize: '.72rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>{status}</span>
    );
}

// ─── Local storage events removed, handled by AdminEvents with Supabase ───

export default function Admin() {
    const navigate = useNavigate();
    const [tab, setTab] = useState('Overview');
    const [data, setData] = useState<any>({ bookings: [], orders: [], menu: [], gallery: [], blog: [] });
    const [loading, setLoading] = useState(true);
    const [editItem, setEditItem] = useState<any>(null);
    const [newItem, setNewItem] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
    };

    const fetchAll = async () => {
        setLoading(true);
        try {
            const getCol = async (name: string) => {
                const qs = await getDocs(collection(db, name));
                return qs.docs.map(d => ({ id: d.id, ...d.data() }));
            };
            const [bookings, orders, menu, gallery, blog] = await Promise.all([
                getCol('bookings').catch(() => []),
                getCol('orders').catch(() => []),
                getCol('menu').catch(() => []),
                getCol('gallery').catch(() => []),
                getCol('blog').catch(() => [])
            ]);
            setData({ bookings, orders, menu, gallery, blog });
        } catch (err) { }
        setLoading(false);
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const updateBooking = async (id: string, status: string) => {
        const tId = toast.loading('Updating booking...');
        await updateDoc(doc(db, 'bookings', id), { status });
        setData({ ...data, bookings: data.bookings.map((b: any) => b.id === id ? { ...b, status } : b) });
        toast.success(`Booking ${status}`, { id: tId });
    };

    const updateOrder = async (id: string, updates: any) => {
        if (updates.order_status === 'delivered') {
            const proof = window.prompt("Enter Proof of Delivery (e.g. 'Handed to John at door'):");
            if (proof) updates.delivery_proof = proof;
            else if (proof === null) return;
        }
        const tId = toast.loading('Updating order...');
        await updateDoc(doc(db, 'orders', id), updates);
        setData({ ...data, orders: data.orders.map((o: any) => o.id === id ? { ...o, ...updates } : o) });
        toast.success('Order updated', { id: tId });
    };

    const saveMenuItem = async (item: any) => {
        const tId = toast.loading('Saving item...');
        try {
            const payload = { ...item };
            const id = payload.id;
            delete payload.id;
            if (id) await updateDoc(doc(db, 'menu', id), payload);
            else await addDoc(collection(db, 'menu'), payload);
            toast.success('Menu item saved', { id: tId });
            setEditItem(null); setNewItem(null); fetchAll();
        } catch (error: any) { toast.error(error?.message || 'Failed to save menu item', { id: tId }); }
    };

    const deleteItem = async (endpoint: string, id: string, key: string) => {
        if (!confirm('Delete this item completely?')) return;
        const tId = toast.loading('Deleting...');
        try {
            await deleteDoc(doc(db, endpoint, id));
            setData({ ...data, [key]: data[key].filter((i: any) => i.id !== id) });
            toast.success('Deleted item', { id: tId });
        } catch (error: any) { toast.error(error?.message || 'Failed to delete item', { id: tId }); }
    };

    const saveBlog = async (post: any) => {
        const tId = toast.loading('Saving post...');
        try {
            const payload = { ...post };
            const id = payload.id;
            delete payload.id;
            if (id) await updateDoc(doc(db, 'blog', id), payload);
            else await addDoc(collection(db, 'blog'), payload);
            toast.success('Blog post saved!', { id: tId });
            setEditItem(null); setNewItem(null); fetchAll();
        } catch (error: any) { toast.error(error?.message || 'Failed to save blog post', { id: tId }); }
    };

    const handleSeedMenu = async () => {
        if (!confirm("Add 8 premium mock dishes to the menu?")) return;
        const tId = toast.loading('Seeding database with mock menu items...');
        try {
            for (const item of MOCK_DATA) {
                await addDoc(collection(db, 'menu'), {
                    name: item.name,
                    description: item.desc,
                    price: item.price,
                    category: item.cat,
                    is_veg: item.veg,
                    available: true,
                    sort_order: 1,
                    image_url: item.imgUrl
                });
            }
            toast.success('Mock menu completely seeded!', { id: tId });
            fetchAll();
        } catch(err: any) {
            toast.error('Failed to seed menu: ' + err.message, { id: tId });
        }
    };

    // ─── Local Events CRUD removed, handled by AdminEvents ───

    // ─── Tab count helper ───
    const getTabCount = (t: string): number => {
        const map: Record<string, number> = {
            Bookings: data.bookings.length,
            Orders: data.orders.length,
            Menu: data.menu.length,
            Gallery: data.gallery.length,
            Blog: data.blog.length,
            Events: -1, // Sub-tab handles its own data length
        };
        return map[t] ?? -1;
    };

    return (
        <div className="page-enter" style={{ paddingTop: 80, minHeight: '100vh', background: '#0a0f0d' }}>
            <div style={{ display: 'flex', maxWidth: 1400, margin: '0 auto', gap: 24, padding: '0 20px', minHeight: 'calc(100vh - 80px)', flexWrap: 'wrap' }}>
                {/* ═══ SIDEBAR ═══ */}
                <div style={{ width: window.innerWidth > 768 ? 240 : '100%', flexShrink: 0, padding: '24px 0', borderRight: window.innerWidth > 768 ? '1px solid rgba(212,168,67,0.1)' : 'none' }}>
                    <div style={{ marginBottom: 36, padding: '0 16px' }}>
                        <p className="section-eyebrow" style={{ fontSize: '.7rem' }}>MANAGEMENT</p>
                        <h2 style={{ fontFamily: 'Cormorant Garamond', color: 'var(--gold)', margin: '8px 0 20px 0' }}>Dashboard</h2>
                        <button onClick={handleLogout} className="admin-btn-sm admin-btn-delete" style={{ width: '100%' }}>🚪 Logout</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: window.innerWidth > 768 ? 'column' : 'row', gap: 6, paddingRight: 16, flexWrap: 'wrap' }}>
                        {TABS.map(t => {
                            const count = getTabCount(t);
                            const active = tab === t;
                            return (
                                <button key={t} onClick={() => { setTab(t); setEditItem(null); setNewItem(null); setSearchQuery(''); }}
                                    style={{
                                        textAlign: 'left', padding: '12px 16px', borderRadius: 8,
                                        background: active ? 'linear-gradient(90deg, rgba(212,168,67,0.15), transparent)' : 'transparent',
                                        borderLeft: active ? '3px solid var(--gold)' : '3px solid transparent',
                                        color: active ? 'var(--gold)' : 'var(--text)',
                                        fontFamily: 'DM Sans', fontSize: '.9rem', fontWeight: active ? 600 : 400,
                                        cursor: 'pointer', transition: 'all .25s ease',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                    {t}
                                    {count >= 0 && <span style={{ fontSize: '.75rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 10 }}>{count}</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ═══ MAIN CONTENT ═══ */}
                <div style={{ flex: 1, padding: '24px 0', minWidth: 0 }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 80 }}>
                            <div style={{ fontSize: '2rem', marginBottom: 16, animation: 'float 2s ease-in-out infinite' }}>🍽️</div>
                            <p style={{ color: 'var(--muted)', fontFamily: 'DM Sans' }}>Loading data...</p>
                        </div>
                    ) : (
                        <div style={{ animation: 'fade-in .4s ease' }}>
                            {/* ═══ OVERVIEW TAB ═══ */}
                            {tab === 'Overview' && (
                                <div>
                                    <h2 style={{ marginBottom: 24, fontFamily: 'Cormorant Garamond', fontSize: '2.5rem', color: 'var(--gold)' }}>Welcome back</h2>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                                        {[
                                            { label: 'Pending Orders', val: data.orders.filter((o:any) => o.order_status === 'pending').length, color: '#f39c12' },
                                            { label: 'Confirmed Bookings', val: data.bookings.filter((b:any) => b.status === 'confirmed').length, color: '#27ae60' },
                                            { label: 'Total Menu Items', val: data.menu.length, color: 'var(--gold)' },
                                            { label: 'Total Revenue', val: '₹' + data.orders.filter((o:any)=>o.payment_status==='paid').reduce((acc:number, o:any)=>acc+Number(o.total||0), 0), color: '#3498db' }
                                        ].map((stat, i) => (
                                            <div key={i} className="admin-card" style={{ borderTop: `3px solid ${stat.color}` }}>
                                                <p style={{ fontFamily: 'DM Sans', fontSize: '.85rem', color: 'var(--muted)', marginBottom: 8 }}>{stat.label}</p>
                                                <h3 style={{ fontSize: '2rem', color: stat.color }}>{stat.val}</h3>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: 36, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                        <div className="admin-card" style={{ flex: 1, minWidth: 280 }}>
                                            <h3 style={{ fontSize: '1.2rem', marginBottom: 16 }}>Recent Bookings</h3>
                                            {data.bookings.slice(0, 3).map((b: any) => (
                                                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <div>
                                                        <p style={{ fontFamily: 'DM Sans', fontSize: '.9rem', fontWeight: 600 }}>{b.name}</p>
                                                        <p style={{ color: 'var(--muted)', fontSize: '.75rem' }}>{b.visit_date} • {b.time_slot}</p>
                                                    </div>
                                                    <StatusBadge status={b.status || 'pending'} />
                                                </div>
                                            ))}
                                            <button onClick={() => setTab('Bookings')} className="admin-btn-sm" style={{ marginTop: 12, width: '100%' }}>View All</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        {/* ═══ BOOKINGS TAB ═══ */}
                        {tab === 'Bookings' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {data.bookings.length === 0 && <p style={{ textAlign: 'center', color: 'var(--muted)', padding: 60, fontFamily: 'DM Sans' }}>No reservations yet</p>}
                                {data.bookings.map((b: any) => (
                                    <div key={b.id} className="admin-card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.05rem', marginBottom: 4 }}>{b.name}</h3>
                                                <p style={{ fontFamily: 'DM Sans', fontSize: '.82rem', color: 'var(--muted)' }}>{b.phone || b.email}</p>
                                            </div>
                                            <StatusBadge status={b.status || 'pending'} />
                                        </div>
                                        <div style={{ display: 'flex', gap: 24, marginTop: 14, fontFamily: 'DM Sans', fontSize: '.85rem', flexWrap: 'wrap', color: 'var(--muted)' }}>
                                            <span>📅 {b.visit_date ? new Date(b.visit_date).toLocaleDateString('en-IN') : '—'}</span>
                                            <span>⏰ {b.time_slot || '—'}</span>
                                            <span>👥 {b.group_size || '—'} guests</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                                            {b.status !== 'confirmed' && <button onClick={() => updateBooking(b.id, 'confirmed')} className="admin-btn-sm admin-btn-success">✓ Confirm</button>}
                                            {b.status !== 'cancelled' && <button onClick={() => updateBooking(b.id, 'cancelled')} className="admin-btn-sm admin-btn-delete">✕ Cancel</button>}
                                            <button onClick={() => deleteItem('bookings', b.id, 'bookings')} className="admin-btn-sm admin-btn-delete">🗑️</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ═══ ORDERS TAB ═══ */}
                        {tab === 'Orders' && (() => {
                            const activeOrders = data.orders.filter((o: any) => !['delivered', 'cancelled'].includes(o.order_status));
                            const historyOrders = data.orders.filter((o: any) => ['delivered', 'cancelled'].includes(o.order_status));
                            const showHistory = newItem === 'history';
                            const searchStr = searchQuery.toLowerCase();
                            const baseList = showHistory ? historyOrders : activeOrders;
                            const displayOrders = baseList.filter((o: any) => (o.customer_name || '').toLowerCase().includes(searchStr) || (o.customer_phone || '').includes(searchStr));

                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button onClick={() => setNewItem(null)} style={{
                                                padding: '10px 20px', borderRadius: 12, border: '1.5px solid var(--gold)',
                                                background: !showHistory ? 'var(--gold)' : 'transparent',
                                                color: !showHistory ? '#000' : 'var(--gold)',
                                                cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '.82rem', fontWeight: 600
                                            }}>Active ({activeOrders.length})</button>
                                            <button onClick={() => setNewItem('history')} style={{
                                                padding: '10px 20px', borderRadius: 12, border: '1.5px solid var(--gold)',
                                                background: showHistory ? 'var(--gold)' : 'transparent',
                                                color: showHistory ? '#000' : 'var(--gold)',
                                                cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '.82rem', fontWeight: 600
                                            }}>History ({historyOrders.length})</button>
                                        </div>
                                        <input type="text" placeholder="Search orders by name or phone..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(212,168,67,0.2)', background: 'rgba(255,255,255,0.02)', color: '#fff', width: '100%', maxWidth: 300, fontFamily: 'DM Sans', fontSize: '.9rem' }} />
                                    </div>
                                    {displayOrders.length === 0 && <p style={{ textAlign: 'center', color: 'var(--muted)', padding: 60, fontFamily: 'DM Sans' }}>No orders found</p>}
                                    {displayOrders.map((o: any) => (
                                        <div key={o.id} className="admin-card">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                                                <div>
                                                    <h3 style={{ fontSize: '1.05rem', marginBottom: 4 }}>{o.customer_name}</h3>
                                                    <p style={{ fontFamily: 'DM Sans', fontSize: '.82rem', color: 'var(--muted)' }}>{o.customer_phone}</p>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <StatusBadge status={o.order_status || 'pending'} />
                                                    <p style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.3rem', fontWeight: 700, color: 'var(--gold)', marginTop: 4 }}>₹{o.total}</p>
                                                </div>
                                            </div>
                                            <div style={{ background: 'rgba(212,168,67,0.04)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                                                {(Array.isArray(o.items) ? o.items : []).map((item: any, idx: number) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'DM Sans', fontSize: '.85rem', padding: '4px 0' }}>
                                                        <span>{item.name} × {item.qty}</span><span style={{ color: 'var(--gold)' }}>₹{item.price * item.qty}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <p style={{ fontFamily: 'DM Sans', fontSize: '.82rem', color: 'var(--muted)', marginBottom: 8 }}>📍 {o.customer_address}</p>
                                            <p style={{ fontFamily: 'DM Sans', fontSize: '.82rem', color: 'var(--muted)', marginBottom: 8 }}>
                                                {o.payment_method === 'upi' ? '📱 UPI' : '💵 COD'} • <StatusBadge status={o.payment_status || 'pending'} />
                                            </p>
                                            {o.delivery_proof && <p style={{ fontFamily: 'DM Sans', fontSize: '.82rem', color: '#27ae60', background: 'rgba(39,174,96,0.08)', padding: '8px 12px', borderRadius: 8, marginBottom: 12 }}>✓ Proof: {o.delivery_proof}</p>}
                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                                                {['pending', 'preparing', 'ready', 'delivered'].map(s => (
                                                    <button key={s} onClick={() => updateOrder(o.id, { order_status: s })} disabled={o.order_status === s}
                                                        className="admin-btn-sm" style={{
                                                            borderColor: STATUS_COLORS[s] || '#6c757d',
                                                            color: STATUS_COLORS[s] || '#6c757d',
                                                            opacity: o.order_status === s ? 0.4 : 1,
                                                            cursor: o.order_status === s ? 'default' : 'pointer',
                                                            textTransform: 'capitalize',
                                                        }}>{s}</button>
                                                ))}
                                                {o.payment_status !== 'paid' && <button onClick={() => updateOrder(o.id, { payment_status: 'paid' })} className="admin-btn-sm admin-btn-success">💰 Mark Paid</button>}
                                                <button onClick={() => deleteItem('orders', o.id, 'orders')} className="admin-btn-sm admin-btn-delete">🗑️</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}

                        {/* ═══ MENU TAB ═══ */}
                        {tab === 'Menu' && (() => {
                            const searchStr = searchQuery.toLowerCase();
                            const displayMenu = data.menu.filter((m: any) => 
                                (m.name || '').toLowerCase().includes(searchStr) || 
                                (m.category || '').toLowerCase().includes(searchStr)
                            );

                            return (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                                        <button onClick={() => setNewItem({ name: '', description: '', price: 0, category: 'Starters', image_url: '', is_veg: true, available: true, sort_order: 99 })} className="btn btn-gold">+ Add Menu Item</button>
                                        <input type="text" placeholder="Search menu..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(212,168,67,0.2)', background: 'rgba(255,255,255,0.02)', color: '#fff', width: '100%', maxWidth: 300, fontFamily: 'DM Sans', fontSize: '.9rem' }} />
                                    </div>

                                    {(newItem || editItem) && tab === 'Menu' && (() => {
                                        const item = editItem || newItem;
                                        const setItem = editItem ? setEditItem : setNewItem;
                                        return (
                                            <div className="admin-card" style={{ marginBottom: 24 }}>
                                                <h3 style={{ marginBottom: 20, color: 'var(--gold)' }}>{editItem ? '✏️ Edit' : '➕ New'} Menu Item</h3>
                                                <AdminInput label="Name" value={item.name} onChange={(v: string) => setItem({ ...item, name: v })} placeholder="Dish name" />
                                                <AdminInput label="Description" value={item.description} onChange={(v: string) => setItem({ ...item, description: v })} type="textarea" placeholder="Short description of the dish" />
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                                    <AdminInput label="Price (₹)" value={item.price} onChange={(v: string) => setItem({ ...item, price: parseFloat(v) || 0 })} type="number" />
                                                    <AdminSelect label="Category" value={item.category} onChange={(v: string) => setItem({ ...item, category: v })}
                                                        options={['Starters', 'Main Course (Veg)', 'Main Course (Non-Veg)', 'Biryani', 'Breads', 'Chinese', 'Soups', 'Desserts']} />
                                                </div>
                                                <ImageUploadInput label="Image Upload" value={item.image_url} onChange={(v: string) => setItem({ ...item, image_url: v })} />
                                                <div style={{ display: 'flex', gap: 24, marginBottom: 20 }}>
                                                    <label className="admin-checkbox">
                                                        <input type="checkbox" checked={item.is_veg} onChange={e => setItem({ ...item, is_veg: e.target.checked })} /> Vegetarian
                                                    </label>
                                                    <label className="admin-checkbox">
                                                        <input type="checkbox" checked={item.available} onChange={e => setItem({ ...item, available: e.target.checked })} /> Available
                                                    </label>
                                                </div>
                                                <div style={{ display: 'flex', gap: 10 }}>
                                                    <button onClick={() => saveMenuItem(item)} className="btn btn-gold">💾 Save</button>
                                                    <button onClick={() => { setEditItem(null); setNewItem(null); }} className="btn btn-outline">Cancel</button>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {displayMenu.length === 0 && <p style={{ textAlign: 'center', color: 'var(--muted)', padding: 60, fontFamily: 'DM Sans' }}>No menu items found</p>}
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
                                        {displayMenu.map((m: any) => (
                                            <div key={m.id} className="admin-card" style={{ padding: 18 }}>
                                                <div style={{ display: 'flex', gap: 14 }}>
                                                    {m.image_url && <img src={m.image_url} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10 }} />}
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <h4 style={{ fontSize: '.95rem', margin: 0 }}>{m.is_veg ? '🟢' : '🔴'} {m.name}</h4>
                                                            <span style={{ color: 'var(--gold)', fontWeight: 700, fontFamily: 'Cormorant Garamond', fontSize: '1.1rem' }}>₹{m.price}</span>
                                                        </div>
                                                        <p style={{ fontFamily: 'DM Sans', fontSize: '.75rem', color: 'var(--muted)', margin: '4px 0' }}>
                                                            {m.category} {!m.available && <span style={{ color: '#e74c3c' }}>• UNAVAILABLE</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                                    <button onClick={() => setEditItem({ ...m })} className="admin-btn-sm admin-btn-edit">Edit</button>
                                                    <button onClick={() => deleteItem('menu', m.id, 'menu')} className="admin-btn-sm admin-btn-delete">Delete</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* ═══ GALLERY TAB ═══ */}
                        {tab === 'Gallery' && (
                            <div>
                                <button onClick={() => setNewItem({ caption: '', category: 'Ambiance', image_url: '', active: true, sort_order: 99 })} className="btn btn-gold" style={{ marginBottom: 24 }}>+ Add Photo</button>
                                {(newItem || editItem) && tab === 'Gallery' && (() => {
                                    const item = editItem || newItem;
                                    const setItem = editItem ? setEditItem : setNewItem;
                                    return (
                                        <div className="admin-card" style={{ marginBottom: 24 }}>
                                            <h3 style={{ marginBottom: 20, color: 'var(--gold)' }}>{editItem ? '✏️ Edit' : '➕ New'} Photo</h3>
                                            <AdminInput label="Caption" value={item.caption} onChange={(v: string) => setItem({ ...item, caption: v })} placeholder="Photo caption" />
                                            <AdminSelect label="Category" value={item.category} onChange={(v: string) => setItem({ ...item, category: v })} options={['Food', 'Ambiance', 'Events']} />
                                            <ImageUploadInput label="Image Upload" value={item.image_url} onChange={(v: string) => setItem({ ...item, image_url: v })} />
                                            <div style={{ display: 'flex', gap: 10 }}>
                                                <button onClick={async () => {
                                                    try {
                                                        const payload = { ...item };
                                                        const id = payload.id;
                                                        delete payload.id;
                                                        if (id) await updateDoc(doc(db, 'gallery', id), payload);
                                                        else await addDoc(collection(db, 'gallery'), payload);
                                                        setEditItem(null); setNewItem(null); fetchAll();
                                                    } catch (error: any) { alert(error?.message || 'Failed to save photo'); }
                                                }} className="btn btn-gold">💾 Save</button>
                                                <button onClick={() => { setEditItem(null); setNewItem(null); }} className="btn btn-outline">Cancel</button>
                                            </div>
                                        </div>
                                    );
                                })()}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                                    {data.gallery.map((img: any) => (
                                        <div key={img.id} className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                                            <img src={img.image_url} alt={img.caption} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 0 }} />
                                            <div style={{ padding: '12px 16px' }}>
                                                <p style={{ fontFamily: 'DM Sans', fontSize: '.85rem', fontWeight: 500, marginBottom: 8 }}>{img.caption}</p>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button onClick={() => setEditItem({ ...img })} className="admin-btn-sm admin-btn-edit">Edit</button>
                                                    <button onClick={() => deleteItem('gallery', img.id, 'gallery')} className="admin-btn-sm admin-btn-delete">Delete</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ═══ BLOG TAB ═══ */}
                        {tab === 'Blog' && (
                            <div>
                                <button onClick={() => setNewItem({ title: '', slug: '', content: '', excerpt: '', category: 'Food', author: 'Spice Garden Team', featured_image_url: '', status: 'published' })} className="btn btn-gold" style={{ marginBottom: 24 }}>+ New Post</button>
                                {(newItem || editItem) && tab === 'Blog' && (() => {
                                    const item = editItem || newItem;
                                    const setItem = editItem ? setEditItem : setNewItem;
                                    return (
                                        <div className="admin-card" style={{ marginBottom: 24 }}>
                                            <h3 style={{ marginBottom: 20, color: 'var(--gold)' }}>{editItem ? '✏️ Edit' : '➕ New'} Blog Post</h3>
                                            <AdminInput label="Title" value={item.title} onChange={(v: string) => setItem({ ...item, title: v, slug: v.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} placeholder="Blog post title" />
                                            <AdminInput label="Excerpt" value={item.excerpt} onChange={(v: string) => setItem({ ...item, excerpt: v })} placeholder="Short summary" />
                                            <AdminInput label="Content" value={item.content} onChange={(v: string) => setItem({ ...item, content: v })} type="textarea" placeholder="Full blog post content..." />
                                            <ImageUploadInput label="Featured Image" value={item.featured_image_url} onChange={(v: string) => setItem({ ...item, featured_image_url: v })} />
                                            <div style={{ display: 'flex', gap: 10 }}>
                                                <button onClick={() => saveBlog(item)} className="btn btn-gold">💾 Save</button>
                                                <button onClick={() => { setEditItem(null); setNewItem(null); }} className="btn btn-outline">Cancel</button>
                                            </div>
                                        </div>
                                    );
                                })()}
                                {data.blog.map((p: any) => (
                                    <div key={p.id} className="admin-card" style={{ marginBottom: 12 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h4 style={{ fontSize: '.95rem', marginBottom: 4 }}>{p.title}</h4>
                                                <p style={{ fontFamily: 'DM Sans', fontSize: '.78rem', color: 'var(--muted)' }}>{p.category} • {p.author}</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button onClick={() => setEditItem({ ...p })} className="admin-btn-sm admin-btn-edit">Edit</button>
                                                <button onClick={() => deleteItem('blog', p.id, 'blog')} className="admin-btn-sm admin-btn-delete">Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ═══ EVENTS TAB ═══ */}
                        {tab === 'Events' && (
                            <AdminEvents />
                        )}

                        {/* ═══ SETTINGS TAB ═══ */}
                        {tab === 'Settings' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                <div className="admin-card">
                                    <h3 style={{ marginBottom: 24, color: 'var(--gold)' }}>⚙️ Restaurant Settings</h3>
                                    <div style={{ display: 'grid', gap: 0 }}>
                                        {[
                                            { label: 'Restaurant Name', value: 'Spice Garden', icon: '🏪' },
                                            { label: 'Phone Number', value: '097418 00400', icon: '📞' },
                                            { label: 'WhatsApp Number', value: '9741800400', icon: '💬' },
                                            { label: 'UPI ID', value: '8050280065@fam', icon: '💳' },
                                            { label: 'Address', value: 'Jadhav Farm, Gokak, Karnataka', icon: '📍' },
                                            { label: 'Timings', value: 'Mon-Sun: 12-3 PM, 7-11 PM', icon: '🕐' },
                                        ].map(s => (
                                            <div key={s.label} style={{
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                padding: '16px 0', borderBottom: '1px solid rgba(212,168,67,0.06)',
                                            }}>
                                                <span style={{ fontFamily: 'DM Sans', fontSize: '.88rem', color: 'var(--muted)' }}>
                                                    {s.icon} {s.label}
                                                </span>
                                                <span style={{ fontFamily: 'DM Sans', fontSize: '.88rem', fontWeight: 500 }}>{s.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p style={{ fontFamily: 'DM Sans', fontSize: '.78rem', color: 'var(--muted)', marginTop: 24, opacity: 0.7 }}>
                                        To update these settings, contact the developer or update the source code.
                                    </p>
                                </div>
                                <div className="admin-card" style={{ borderLeft: '4px solid #e74c3c' }}>
                                    <h3 style={{ marginBottom: 8, color: '#e74c3c' }}>Developer Controls</h3>
                                    <p style={{ fontFamily: 'DM Sans', fontSize: '.8rem', color: 'var(--muted)', marginBottom: 16 }}>
                                        Adding mock data skips normal validations. This is strictly for demonstration purposes.
                                    </p>
                                    <button onClick={handleSeedMenu} className="admin-btn" style={{ background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.2)' }}>
                                        🌱 Seed Mock Menu (10 Items)
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                </div>
            </div>
        </div>
    );
}
