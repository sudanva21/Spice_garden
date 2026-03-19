import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageReveal } from '../hooks/useReveal';
import AdminEvents from '../components/admin/AdminEvents';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const TABS = ['Bookings', 'Orders', 'Menu', 'Gallery', 'Blog', 'Events', 'Settings'];

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
    const [tab, setTab] = useState('Bookings');
    const [data, setData] = useState<any>({ bookings: [], orders: [], menu: [], gallery: [], blog: [] });
    const [loading, setLoading] = useState(true);
    const [editItem, setEditItem] = useState<any>(null);
    const [newItem, setNewItem] = useState<any>(null);

    usePageReveal();

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        delete axios.defaults.headers.common['Authorization'];
        navigate('/admin/login');
    };

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [bookings, orders, menu, gallery, blog] = await Promise.all([
                axios.get(`${API}/bookings`).catch(() => ({ data: { bookings: [] } })),
                axios.get(`${API}/orders`).catch(() => ({ data: { orders: [] } })),
                axios.get(`${API}/menu`).catch(() => ({ data: { items: [] } })),
                axios.get(`${API}/gallery`).catch(() => ({ data: { images: [] } })),
                axios.get(`${API}/blog`).catch(() => ({ data: { posts: [] } })),
            ]);
            setData({
                bookings: bookings.data.bookings || [],
                orders: orders.data.orders || [],
                menu: menu.data.items || [],
                gallery: gallery.data.images || [],
                blog: blog.data.posts || [],
            });
        } catch { }
        setLoading(false);
    };

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        fetchAll();
    }, []);

    const updateBooking = async (id: string, status: string) => {
        await axios.patch(`${API}/bookings/${id}`, { status });
        setData({ ...data, bookings: data.bookings.map((b: any) => b.id === id ? { ...b, status } : b) });
    };

    const updateOrder = async (id: string, updates: any) => {
        if (updates.order_status === 'delivered') {
            const proof = window.prompt("Enter Proof of Delivery (e.g. 'Handed to John at door'):");
            if (proof) updates.delivery_proof = proof;
            else if (proof === null) return;
        }
        await axios.patch(`${API}/orders/${id}`, updates);
        setData({ ...data, orders: data.orders.map((o: any) => o.id === id ? { ...o, ...updates } : o) });
    };

    const saveMenuItem = async (item: any) => {
        try {
            const payload = { ...item };
            delete payload.id;
            if (item.id) {
                await axios.patch(`${API}/menu/${item.id}`, payload);
            } else {
                await axios.post(`${API}/menu`, payload);
            }
            setEditItem(null); setNewItem(null); fetchAll();
        } catch (error: any) {
            alert(error?.response?.data?.error || 'Failed to save menu item');
        }
    };

    const deleteItem = async (endpoint: string, id: string, key: string) => {
        if (!confirm('Delete this item?')) return;
        try {
            await axios.delete(`${API}/${endpoint}/${id}`);
            setData({ ...data, [key]: data[key].filter((i: any) => i.id !== id) });
        } catch (error: any) {
            alert(error?.response?.data?.error || 'Failed to delete item');
        }
    };

    const saveBlog = async (post: any) => {
        try {
            const payload = { ...post };
            delete payload.id;
            if (post.id) { await axios.patch(`${API}/blog/${post.id}`, payload); }
            else { await axios.post(`${API}/blog`, payload); }
            setEditItem(null); setNewItem(null); fetchAll();
        } catch (error: any) {
            alert(error?.response?.data?.error || 'Failed to save blog post');
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
        <div className="page-enter" style={{ paddingTop: 100, minHeight: '100vh', paddingBottom: 60, background: '#0a0f0d' }}>
            <div className="container" style={{ maxWidth: 1100 }}>
                {/* Header */}
                <div className="reveal" style={{ textAlign: 'center', marginBottom: 36 }}>
                    <p className="section-eyebrow">MANAGEMENT</p>
                    <h1 style={{ marginBottom: 16 }}>Admin Panel</h1>
                    <button onClick={handleLogout} className="admin-btn-sm admin-btn-delete" style={{ fontSize: '.8rem' }}>
                        🚪 Logout
                    </button>
                </div>

                {/* Tab Bar */}
                <div className="reveal" style={{
                    display: 'flex', gap: 8, marginBottom: 36, justifyContent: 'center', flexWrap: 'wrap',
                    padding: '12px 16px', background: 'rgba(19,35,24,0.3)', borderRadius: 16,
                    border: '1px solid rgba(212,168,67,0.06)'
                }}>
                    {TABS.map(t => {
                        const count = getTabCount(t);
                        return (
                            <button
                                key={t}
                                onClick={() => { setTab(t); setEditItem(null); setNewItem(null); }}
                                style={{
                                    padding: '10px 20px', borderRadius: 12,
                                    border: tab === t ? '1.5px solid var(--gold)' : '1.5px solid transparent',
                                    background: tab === t ? 'linear-gradient(135deg, var(--gold), var(--gold-light))' : 'rgba(255,255,255,0.03)',
                                    color: tab === t ? '#0D1A0F' : 'var(--text)',
                                    fontFamily: 'DM Sans', fontSize: '.82rem', fontWeight: 600,
                                    cursor: 'pointer', transition: 'all .25s ease',
                                }}
                            >
                                {t}
                                {count >= 0 && (
                                    <span style={{
                                        marginLeft: 6, opacity: 0.7, fontSize: '.75rem',
                                        background: tab === t ? 'rgba(0,0,0,0.15)' : 'rgba(212,168,67,0.1)',
                                        padding: '2px 8px', borderRadius: 10,
                                    }}>{count}</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 80 }}>
                        <div style={{ fontSize: '2rem', marginBottom: 16, animation: 'float 2s ease-in-out infinite' }}>🍽️</div>
                        <p style={{ color: 'var(--muted)', fontFamily: 'DM Sans' }}>Loading data...</p>
                    </div>
                ) : (
                    <div>
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
                            const displayOrders = showHistory ? historyOrders : activeOrders;

                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
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
                        {tab === 'Menu' && (
                            <div>
                                <button onClick={() => setNewItem({ name: '', description: '', price: 0, category: 'Starters', image_url: '', is_veg: true, available: true, sort_order: 99 })} className="btn btn-gold" style={{ marginBottom: 24 }}>+ Add Menu Item</button>
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
                                            <AdminInput label="Image URL" value={item.image_url} onChange={(v: string) => setItem({ ...item, image_url: v })} placeholder="https://..." />
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
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
                                    {data.menu.map((m: any) => (
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
                        )}

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
                                            <AdminInput label="Image URL" value={item.image_url} onChange={(v: string) => setItem({ ...item, image_url: v })} placeholder="https://..." />
                                            <div style={{ display: 'flex', gap: 10 }}>
                                                <button onClick={async () => {
                                                    try {
                                                        const payload = { ...item }; delete payload.id;
                                                        if (item.id) await axios.patch(`${API}/gallery/${item.id}`, payload);
                                                        else await axios.post(`${API}/gallery`, payload);
                                                        setEditItem(null); setNewItem(null); fetchAll();
                                                    } catch (error: any) { alert(error?.response?.data?.error || 'Failed to save photo'); }
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
                                            <AdminInput label="Featured Image URL" value={item.featured_image_url} onChange={(v: string) => setItem({ ...item, featured_image_url: v })} placeholder="https://..." />
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
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
