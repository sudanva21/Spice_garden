import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageReveal } from '../hooks/useReveal';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const TABS = ['Bookings', 'Orders', 'Menu', 'Gallery', 'Blog', 'Events', 'Event Tickets', 'Settings'];

export default function Admin() {
    const navigate = useNavigate();
    const [tab, setTab] = useState('Bookings');
    const [data, setData] = useState<any>({ bookings: [], orders: [], menu: [], gallery: [], blog: [], events: [], eventBookings: [] });
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
            const [bookings, orders, menu, gallery, blog, events, eventBookings] = await Promise.all([
                axios.get(`${API}/bookings`).catch(() => ({ data: { bookings: [] } })),
                axios.get(`${API}/orders`).catch(() => ({ data: { orders: [] } })),
                axios.get(`${API}/menu`).catch(() => ({ data: { items: [] } })),
                axios.get(`${API}/gallery`).catch(() => ({ data: { images: [] } })),
                axios.get(`${API}/blog`).catch(() => ({ data: { posts: [] } })),
                axios.get(`${API}/events`).catch(() => ({ data: { events: [] } })),
                axios.get(`${API}/event-bookings`).catch(() => ({ data: [] })),
            ]);
            setData({
                bookings: bookings.data.bookings || [],
                orders: orders.data.orders || [],
                menu: menu.data.items || [],
                gallery: gallery.data.images || [],
                blog: blog.data.posts || [],
                events: events.data.events || [],
                eventBookings: eventBookings.data || [],
            });
        } catch { }
        setLoading(false);
    };

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        fetchAll();
    }, []);

    const statusColors: Record<string, string> = { pending: '#f39c12', confirmed: '#27ae60', cancelled: '#e74c3c', preparing: '#3498db', ready: '#9b59b6', delivered: '#27ae60', paid: '#27ae60' };

    const StatusBadge = ({ status }: { status: string }) => (
        <span style={{
            padding: '3px 12px', borderRadius: 16,
            background: `${statusColors[status] || '#6c757d'}22`,
            color: statusColors[status] || '#6c757d',
            fontFamily: 'DM Sans', fontSize: '.72rem', fontWeight: 600, textTransform: 'uppercase'
        }}>{status}</span>
    );

    const updateBooking = async (id: string, status: string) => {
        await axios.patch(`${API}/bookings/${id}`, { status });
        setData({ ...data, bookings: data.bookings.map((b: any) => b.id === id ? { ...b, status } : b) });
    };

    const updateOrder = async (id: string, updates: any) => {
        if (updates.order_status === 'delivered') {
            const proof = window.prompt("Enter Proof of Delivery (e.g. 'Handed to John at door'):");
            if (proof) updates.delivery_proof = proof;
            else if (proof === null) return; // cancelled prompt
        }

        await axios.patch(`${API}/orders/${id}`, updates);
        setData({ ...data, orders: data.orders.map((o: any) => o.id === id ? { ...o, ...updates } : o) });
    };

    const saveMenuItem = async (item: any) => {
        if (item.id) {
            await axios.patch(`${API}/menu/${item.id}`, item);
            setData({ ...data, menu: data.menu.map((m: any) => m.id === item.id ? item : m) });
        } else {
            const { data: d } = await axios.post(`${API}/menu`, item);
            setData({ ...data, menu: [...data.menu, d] });
        }
        setEditItem(null);
        setNewItem(null);
        fetchAll();
    };

    const deleteItem = async (endpoint: string, id: string, key: string) => {
        if (!confirm('Delete this item?')) return;
        await axios.delete(`${API}/${endpoint}/${id}`);
        setData({ ...data, [key]: data[key].filter((i: any) => i.id !== id) });
    };

    const saveBlog = async (post: any) => {
        if (post.id) { await axios.patch(`${API}/blog/${post.id}`, post); }
        else { await axios.post(`${API}/blog`, post); }
        setEditItem(null); setNewItem(null); fetchAll();
    };

    const saveEvent = async (evt: any) => {
        if (evt.id) { await axios.patch(`${API}/events/${evt.id}`, evt); }
        else { await axios.post(`${API}/events`, evt); }
        setEditItem(null); setNewItem(null); fetchAll();
    };

    const Input = ({ label, value, onChange, type = 'text', ...props }: any) => (
        <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontFamily: 'DM Sans', fontSize: '.72rem', color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase' }}>{label}</label>
            {type === 'textarea' ? (
                <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} style={{ width: '100%' }} {...props} />
            ) : type === 'checkbox' ? (
                <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} {...props} />
            ) : (
                <input type={type} value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%' }} {...props} />
            )}
        </div>
    );

    return (
        <div className="page-enter" style={{ paddingTop: 120, minHeight: '100vh' }}>
            <div className="container" style={{ maxWidth: 1100 }}>
                <div className="reveal" style={{ textAlign: 'center', marginBottom: 32 }}>
                    <p className="section-eyebrow">MANAGEMENT</p>
                    <h1>Admin Panel</h1>
                    <button onClick={handleLogout} style={{
                        marginTop: 12, padding: '8px 24px', borderRadius: 20,
                        border: '1px solid #e74c3c', background: 'transparent',
                        color: '#e74c3c', fontFamily: 'DM Sans', fontSize: '.8rem',
                        fontWeight: 600, cursor: 'pointer', transition: 'all .3s'
                    }}>🚪 Logout</button>
                </div>

                {/* Tab Bar */}
                <div className="reveal" style={{ display: 'flex', gap: 6, marginBottom: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {TABS.map(t => (
                        <button key={t} onClick={() => { setTab(t); setEditItem(null); setNewItem(null); }} style={{
                            padding: '10px 22px', borderRadius: 24,
                            border: `1.5px solid ${tab === t ? 'var(--gold)' : 'rgba(212,168,67,0.12)'}`,
                            background: tab === t ? 'linear-gradient(135deg, var(--gold), var(--gold-light))' : 'transparent',
                            color: tab === t ? '#0D1A0F' : 'var(--gold)',
                            fontFamily: 'DM Sans', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all .3s ease'
                        }}>{t} {t !== 'Settings' && <span style={{ opacity: .7 }}>({(data as any)[t.toLowerCase()]?.length || 0})</span>}</button>
                    ))}
                </div>

                {loading ? <p style={{ textAlign: 'center', color: 'var(--muted)', padding: 60 }}>Loading...</p> : (
                    <div>
                        {/* ═══ BOOKINGS TAB ═══ */}
                        {tab === 'Bookings' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {data.bookings.length === 0 && <p style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>No reservations yet</p>}
                                {data.bookings.map((b: any) => (
                                    <div key={b.id} className="glass" style={{ padding: 20 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                                            <div><h3 style={{ fontSize: '1rem', marginBottom: 4 }}>{b.name}</h3><p style={{ fontFamily: 'DM Sans', fontSize: '.8rem', color: 'var(--muted)' }}>{b.phone || b.email}</p></div>
                                            <StatusBadge status={b.status || 'pending'} />
                                        </div>
                                        <div style={{ display: 'flex', gap: 24, marginTop: 12, fontFamily: 'DM Sans', fontSize: '.82rem', flexWrap: 'wrap' }}>
                                            <span>📅 {b.visit_date ? new Date(b.visit_date).toLocaleDateString('en-IN') : '—'}</span>
                                            <span>⏰ {b.time_slot || '—'}</span>
                                            <span>👥 {b.group_size || '—'} guests</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                            {b.status !== 'confirmed' && <button onClick={() => updateBooking(b.id, 'confirmed')} style={{ padding: '5px 14px', borderRadius: 8, border: '1px solid #27ae60', background: 'transparent', color: '#27ae60', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '.78rem' }}>✓ Confirm</button>}
                                            {b.status !== 'cancelled' && <button onClick={() => updateBooking(b.id, 'cancelled')} style={{ padding: '5px 14px', borderRadius: 8, border: '1px solid #e74c3c', background: 'transparent', color: '#e74c3c', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '.78rem' }}>✕ Cancel</button>}
                                            <button onClick={() => deleteItem('bookings', b.id, 'bookings')} style={{ padding: '5px 14px', borderRadius: 8, border: '1px solid #c0392b', background: 'transparent', color: '#c0392b', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '.78rem' }}>🗑️ Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ═══ ORDERS TAB ═══ */}
                        {tab === 'Orders' && (() => {
                            const activeOrders = data.orders.filter((o: any) => !['delivered', 'cancelled'].includes(o.order_status));
                            const historyOrders = data.orders.filter((o: any) => ['delivered', 'cancelled'].includes(o.order_status));
                            const displayOrders = newItem === 'history' ? historyOrders : activeOrders;

                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                                        <button onClick={() => setNewItem(null)} style={{ padding: '8px 16px', borderRadius: 20, border: '1px solid var(--gold)', background: newItem !== 'history' ? 'var(--gold)' : 'transparent', color: newItem !== 'history' ? '#000' : 'var(--gold)', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '.8rem', fontWeight: 600 }}>Active Orders ({activeOrders.length})</button>
                                        <button onClick={() => setNewItem('history')} style={{ padding: '8px 16px', borderRadius: 20, border: '1px solid var(--gold)', background: newItem === 'history' ? 'var(--gold)' : 'transparent', color: newItem === 'history' ? '#000' : 'var(--gold)', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '.8rem', fontWeight: 600 }}>Order History ({historyOrders.length})</button>
                                    </div>
                                    {displayOrders.length === 0 && <p style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>No orders found</p>}
                                    {displayOrders.map((o: any) => (
                                        <div key={o.id} className="glass" style={{ padding: 20 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                                                <div><h3 style={{ fontSize: '1rem', marginBottom: 4 }}>{o.customer_name}</h3><p style={{ fontFamily: 'DM Sans', fontSize: '.8rem', color: 'var(--muted)' }}>{o.customer_phone}</p></div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <StatusBadge status={o.order_status || 'pending'} />
                                                    <p style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.2rem', fontWeight: 700, color: 'var(--gold)', marginTop: 4 }}>₹{o.total}</p>
                                                </div>
                                            </div>
                                            <div style={{ background: 'rgba(212,168,67,0.04)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                                                {(Array.isArray(o.items) ? o.items : []).map((item: any, idx: number) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'DM Sans', fontSize: '.82rem', padding: '4px 0' }}>
                                                        <span>{item.name} × {item.qty}</span><span>₹{item.price * item.qty}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <p style={{ fontFamily: 'DM Sans', fontSize: '.78rem', color: 'var(--muted)', marginBottom: 8 }}>📍 {o.customer_address}</p>
                                            <p style={{ fontFamily: 'DM Sans', fontSize: '.78rem', color: 'var(--muted)', marginBottom: 8 }}>{o.payment_method === 'upi' ? '📱 UPI' : '💵 COD'} • <StatusBadge status={o.payment_status || 'pending'} /></p>
                                            {o.delivery_proof && <p style={{ fontFamily: 'DM Sans', fontSize: '.78rem', color: '#27ae60', background: 'rgba(39, 174, 96, 0.1)', padding: 8, borderRadius: 6, marginBottom: 12 }}>✓ Proof of Delivery: {o.delivery_proof}</p>}
                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                {['pending', 'preparing', 'ready', 'delivered'].map(s => (
                                                    <button key={s} onClick={() => updateOrder(o.id, { order_status: s })} disabled={o.order_status === s} style={{
                                                        padding: '5px 14px', borderRadius: 8, cursor: o.order_status === s ? 'default' : 'pointer',
                                                        border: `1px solid ${statusColors[s] || '#6c757d'}`,
                                                        background: o.order_status === s ? `${statusColors[s]}22` : 'transparent',
                                                        color: statusColors[s] || '#6c757d',
                                                        fontFamily: 'DM Sans', fontSize: '.75rem', textTransform: 'capitalize', opacity: o.order_status === s ? .5 : 1
                                                    }}>{s}</button>
                                                ))}
                                                {o.payment_status !== 'paid' && <button onClick={() => updateOrder(o.id, { payment_status: 'paid' })} style={{ padding: '5px 14px', borderRadius: 8, border: '1px solid #27ae60', background: 'transparent', color: '#27ae60', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '.75rem' }}>💰 Mark Paid</button>}
                                                <button onClick={() => deleteItem('orders', o.id, 'orders')} style={{ padding: '5px 14px', borderRadius: 8, border: '1px solid #c0392b', background: 'transparent', color: '#c0392b', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '.78rem' }}>🗑️ Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        })()}

                        {/* ═══ MENU TAB ═══ */}
                        {tab === 'Menu' && (
                            <div>
                                <button onClick={() => setNewItem({ name: '', description: '', price: 0, category: 'Starters', image_url: '', is_veg: true, available: true, sort_order: 99 })} className="btn btn-gold" style={{ marginBottom: 20 }}>+ Add Menu Item</button>
                                {(newItem || editItem) && (
                                    <div className="glass" style={{ padding: 20, marginBottom: 20 }}>
                                        <h3 style={{ marginBottom: 16, color: 'var(--gold)' }}>{editItem ? 'Edit' : 'New'} Menu Item</h3>
                                        {(() => {
                                            const item = editItem || newItem; const setItem = editItem ? setEditItem : setNewItem; return (<>
                                                <Input label="Name" value={item.name} onChange={(v: string) => setItem({ ...item, name: v })} />
                                                <Input label="Description" value={item.description} onChange={(v: string) => setItem({ ...item, description: v })} type="textarea" />
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                                    <Input label="Price (₹)" value={item.price} onChange={(v: string) => setItem({ ...item, price: parseFloat(v) || 0 })} type="number" />
                                                    <div style={{ marginBottom: 12 }}>
                                                        <label style={{ display: 'block', fontFamily: 'DM Sans', fontSize: '.72rem', color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase' }}>Category</label>
                                                        <select value={item.category} onChange={e => setItem({ ...item, category: e.target.value })} style={{ width: '100%' }}>
                                                            {['Starters', 'Main Course (Veg)', 'Main Course (Non-Veg)', 'Biryani', 'Breads', 'Chinese', 'Soups', 'Desserts'].map(c => <option key={c} value={c}>{c}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                <Input label="Image URL" value={item.image_url} onChange={(v: string) => setItem({ ...item, image_url: v })} />
                                                <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
                                                    <label style={{ fontFamily: 'DM Sans', fontSize: '.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <input type="checkbox" checked={item.is_veg} onChange={e => setItem({ ...item, is_veg: e.target.checked })} /> Vegetarian
                                                    </label>
                                                    <label style={{ fontFamily: 'DM Sans', fontSize: '.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <input type="checkbox" checked={item.available} onChange={e => setItem({ ...item, available: e.target.checked })} /> Available
                                                    </label>
                                                </div>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button onClick={() => saveMenuItem(item)} className="btn btn-gold">Save</button>
                                                    <button onClick={() => { setEditItem(null); setNewItem(null); }} className="btn btn-outline">Cancel</button>
                                                </div>
                                            </>);
                                        })()}
                                    </div>
                                )}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
                                    {data.menu.map((m: any) => (
                                        <div key={m.id} className="glass" style={{ padding: 16 }}>
                                            <div style={{ display: 'flex', gap: 12 }}>
                                                {m.image_url && <img src={m.image_url} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />}
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <h4 style={{ fontSize: '.9rem', margin: 0 }}>{m.is_veg ? '🟢' : '🔴'} {m.name}</h4>
                                                        <span style={{ color: 'var(--gold)', fontWeight: 700 }}>₹{m.price}</span>
                                                    </div>
                                                    <p style={{ fontFamily: 'DM Sans', fontSize: '.72rem', color: 'var(--muted)', margin: '4px 0' }}>{m.category} {!m.available && '• UNAVAILABLE'}</p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                                                <button onClick={() => setEditItem({ ...m })} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid var(--gold)', background: 'transparent', color: 'var(--gold)', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '.72rem' }}>Edit</button>
                                                <button onClick={() => deleteItem('menu', m.id, 'menu')} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #e74c3c', background: 'transparent', color: '#e74c3c', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '.72rem' }}>Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ═══ GALLERY TAB ═══ */}
                        {tab === 'Gallery' && (
                            <div>
                                <button onClick={() => setNewItem({ caption: '', category: 'Ambiance', image_url: '', active: true, sort_order: 99 })} className="btn btn-gold" style={{ marginBottom: 20 }}>+ Add Photo</button>
                                {(newItem || editItem) && tab === 'Gallery' && (
                                    <div className="glass" style={{ padding: 20, marginBottom: 20 }}>
                                        <h3 style={{ marginBottom: 16, color: 'var(--gold)' }}>{editItem ? 'Edit' : 'New'} Photo</h3>
                                        {(() => {
                                            const item = editItem || newItem; const setItem = editItem ? setEditItem : setNewItem; return (<>
                                                <Input label="Caption" value={item.caption} onChange={(v: string) => setItem({ ...item, caption: v })} />
                                                <div style={{ marginBottom: 12 }}>
                                                    <label style={{ display: 'block', fontFamily: 'DM Sans', fontSize: '.72rem', color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase' }}>Category</label>
                                                    <select value={item.category} onChange={e => setItem({ ...item, category: e.target.value })} style={{ width: '100%' }}>
                                                        {['Food', 'Ambiance', 'Events'].map(c => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                </div>
                                                <Input label="Image URL" value={item.image_url} onChange={(v: string) => setItem({ ...item, image_url: v })} />
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button onClick={async () => {
                                                        if (item.id) await axios.patch(`${API}/gallery/${item.id}`, item);
                                                        else await axios.post(`${API}/gallery`, item);
                                                        setEditItem(null); setNewItem(null); fetchAll();
                                                    }} className="btn btn-gold">Save</button>
                                                    <button onClick={() => { setEditItem(null); setNewItem(null); }} className="btn btn-outline">Cancel</button>
                                                </div>
                                            </>);
                                        })()}
                                    </div>
                                )}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                                    {data.gallery.map((img: any) => (
                                        <div key={img.id} className="glass" style={{ padding: 0, overflow: 'hidden' }}>
                                            <img src={img.image_url} alt={img.caption} style={{ width: '100%', height: 150, objectFit: 'cover' }} />
                                            <div style={{ padding: '8px 12px' }}>
                                                <p style={{ fontFamily: 'DM Sans', fontSize: '.8rem', fontWeight: 500 }}>{img.caption}</p>
                                                <button onClick={() => deleteItem('gallery', img.id, 'gallery')} style={{ padding: '3px 10px', borderRadius: 6, border: '1px solid #e74c3c', background: 'transparent', color: '#e74c3c', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '.7rem', marginTop: 4 }}>Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ═══ BLOG TAB ═══ */}
                        {tab === 'Blog' && (
                            <div>
                                <button onClick={() => setNewItem({ title: '', slug: '', content: '', excerpt: '', category: 'Food', author: 'Spice Garden Team', featured_image_url: '', status: 'published' })} className="btn btn-gold" style={{ marginBottom: 20 }}>+ New Post</button>
                                {(newItem || editItem) && (
                                    <div className="glass" style={{ padding: 20, marginBottom: 20 }}>
                                        <h3 style={{ marginBottom: 16, color: 'var(--gold)' }}>{editItem ? 'Edit' : 'New'} Blog Post</h3>
                                        {(() => {
                                            const item = editItem || newItem; const setItem = editItem ? setEditItem : setNewItem; return (<>
                                                <Input label="Title" value={item.title} onChange={(v: string) => setItem({ ...item, title: v, slug: v.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} />
                                                <Input label="Excerpt" value={item.excerpt} onChange={(v: string) => setItem({ ...item, excerpt: v })} />
                                                <Input label="Content" value={item.content} onChange={(v: string) => setItem({ ...item, content: v })} type="textarea" />
                                                <Input label="Image URL" value={item.featured_image_url} onChange={(v: string) => setItem({ ...item, featured_image_url: v })} />
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button onClick={() => saveBlog(item)} className="btn btn-gold">Save</button>
                                                    <button onClick={() => { setEditItem(null); setNewItem(null); }} className="btn btn-outline">Cancel</button>
                                                </div>
                                            </>);
                                        })()}
                                    </div>
                                )}
                                {data.blog.map((p: any) => (
                                    <div key={p.id} className="glass" style={{ padding: 16, marginBottom: 12 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <h4 style={{ fontSize: '.95rem' }}>{p.title}</h4>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button onClick={() => setEditItem({ ...p })} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid var(--gold)', background: 'transparent', color: 'var(--gold)', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '.72rem' }}>Edit</button>
                                                <button onClick={() => deleteItem('blog', p.id, 'blog')} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #e74c3c', background: 'transparent', color: '#e74c3c', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '.72rem' }}>Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ═══ EVENTS TAB ═══ */}
                        {tab === 'Events' && (
                            <div>
                                <button onClick={() => setNewItem({ title: '', description: '', event_date: '', event_type: 'Special', ticket_url: '' })} className="btn btn-gold" style={{ marginBottom: 20 }}>+ New Event</button>
                                {(newItem || editItem) && (
                                    <div className="glass" style={{ padding: 20, marginBottom: 20 }}>
                                        <h3 style={{ marginBottom: 16, color: 'var(--gold)' }}>{editItem ? 'Edit' : 'New'} Event</h3>
                                        {(() => {
                                            const item = editItem || newItem; const setItem = editItem ? setEditItem : setNewItem; return (<>
                                                <Input label="Title" value={item.title} onChange={(v: string) => setItem({ ...item, title: v })} />
                                                <Input label="Description" value={item.description} onChange={(v: string) => setItem({ ...item, description: v })} type="textarea" />
                                                <Input label="Date" value={item.event_date} onChange={(v: string) => setItem({ ...item, event_date: v })} type="date" />
                                                <Input label="Type" value={item.event_type} onChange={(v: string) => setItem({ ...item, event_type: v })} />
                                                <Input label="Ticket Price (₹)" value={item.ticket_price} onChange={(v: string) => setItem({ ...item, ticket_price: parseFloat(v) || 0 })} type="number" />
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button onClick={() => saveEvent(item)} className="btn btn-gold">Save</button>
                                                    <button onClick={() => { setEditItem(null); setNewItem(null); }} className="btn btn-outline">Cancel</button>
                                                </div>
                                            </>);
                                        })()}
                                    </div>
                                )}
                                {data.events.map((e: any) => (
                                    <div key={e.id} className="glass" style={{ padding: 16, marginBottom: 12 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <div>
                                                <h4 style={{ fontSize: '.95rem' }}>{e.title}</h4>
                                                <p style={{ fontFamily: 'DM Sans', fontSize: '.78rem', color: 'var(--muted)' }}>{e.event_date ? new Date(e.event_date).toLocaleDateString('en-IN') : ''} • {e.event_type}</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button onClick={() => setEditItem({ ...e })} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid var(--gold)', background: 'transparent', color: 'var(--gold)', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '.72rem' }}>Edit</button>
                                                <button onClick={() => deleteItem('events', e.id, 'events')} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #e74c3c', background: 'transparent', color: '#e74c3c', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '.72rem' }}>Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ═══ EVENT TICKETS TAB ═══ */}
                        {tab === 'Event Tickets' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {data.eventBookings.length === 0 && <p style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>No event tickets booked yet</p>}
                                {data.eventBookings.map((b: any) => (
                                    <div key={b.id} className="glass" style={{ padding: 20 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.2rem', marginBottom: 4 }}>{b.events?.title || 'Unknown Event'}</h3>
                                                <p style={{ fontFamily: 'DM Sans', fontSize: '.8rem', color: 'var(--muted)' }}>Booking ID: {b.id.substring(0, 8).toUpperCase()}</p>
                                            </div>
                                            <StatusBadge status={b.payment_status || 'pending'} />
                                        </div>
                                        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
                                            <div>
                                                <p style={{ fontFamily: 'DM Sans', fontSize: '.75rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Customer</p>
                                                <p style={{ fontFamily: 'DM Sans', fontSize: '.9rem', fontWeight: 500 }}>{b.users?.name || 'Unknown'}</p>
                                                <p style={{ fontFamily: 'DM Sans', fontSize: '.8rem', color: 'var(--muted)' }}>{b.users?.phone}</p>
                                            </div>
                                            <div>
                                                <p style={{ fontFamily: 'DM Sans', fontSize: '.75rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Tickets</p>
                                                <p style={{ fontFamily: 'DM Sans', fontSize: '.9rem', fontWeight: 500 }}>{b.ticket_count}</p>
                                            </div>
                                            <div>
                                                <p style={{ fontFamily: 'DM Sans', fontSize: '.75rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Total / Payment</p>
                                                <p style={{ fontFamily: 'DM Sans', fontSize: '.9rem', fontWeight: 600, color: 'var(--gold)' }}>₹{b.total_amount}</p>
                                                <p style={{ fontFamily: 'DM Sans', fontSize: '.8rem', color: 'var(--muted)' }}>{b.payment_method?.toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: 16, borderTop: '1px solid rgba(212,168,67,0.1)', paddingTop: 16, display: 'flex', gap: 8 }}>
                                            <button disabled={b.payment_status === 'paid'} onClick={async () => {
                                                await axios.patch(`${API}/event-bookings/${b.id}`, { payment_status: 'paid' });
                                                setData({ ...data, eventBookings: data.eventBookings.map((eb: any) => eb.id === b.id ? { ...eb, payment_status: 'paid' } : eb) });
                                            }} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: b.payment_status === 'paid' ? 'rgba(255,255,255,0.05)' : 'rgba(39, 174, 96, 0.1)', color: b.payment_status === 'paid' ? 'var(--muted)' : '#27ae60', cursor: b.payment_status === 'paid' ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans', fontSize: '.8rem', fontWeight: 600 }}>Mark Paid</button>
                                            <button onClick={() => deleteItem('event-bookings', b.id, 'eventBookings')} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #c0392b', background: 'transparent', color: '#c0392b', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '.8rem', fontWeight: 600 }}>Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ═══ SETTINGS TAB ═══ */}
                        {tab === 'Settings' && (
                            <div className="glass" style={{ padding: 24 }}>
                                <h3 style={{ marginBottom: 24, color: 'var(--gold)' }}>Restaurant Settings</h3>
                                <div style={{ display: 'grid', gap: 16 }}>
                                    {[
                                        { label: 'Restaurant Name', value: 'Spice Garden' },
                                        { label: 'Phone Number', value: '097418 00400' },
                                        { label: 'WhatsApp Number', value: '9741800400' },
                                        { label: 'UPI ID', value: '8050280065@fam' },
                                        { label: 'Address', value: 'Jadhav Farm, Gokak, Karnataka' },
                                        { label: 'Timings', value: 'Mon-Sun: 12:00 PM - 3:00 PM, 7:00 PM - 11:00 PM' },
                                    ].map(s => (
                                        <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(212,168,67,0.08)' }}>
                                            <span style={{ fontFamily: 'DM Sans', fontSize: '.85rem', color: 'var(--muted)' }}>{s.label}</span>
                                            <span style={{ fontFamily: 'DM Sans', fontSize: '.85rem', fontWeight: 500 }}>{s.value}</span>
                                        </div>
                                    ))}
                                </div>
                                <p style={{ fontFamily: 'DM Sans', fontSize: '.78rem', color: 'var(--muted)', marginTop: 20 }}>
                                    To update these settings, contact the developer or update the source code directly.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
