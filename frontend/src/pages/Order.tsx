import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageReveal } from '../hooks/useReveal';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '/api/v1';

function getCart(): any[] { try { return JSON.parse(localStorage.getItem('sg_cart') || '[]'); } catch { return []; } }
function setCartStorage(items: any[]) { localStorage.setItem('sg_cart', JSON.stringify(items)); }

export default function Order() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [cart, setCart] = useState<any[]>(getCart());
    const [step, setStep] = useState(0); // 0=cart, 1=details, 2=payment, 3=confirmed
    const [form, setForm] = useState({ name: '', phone: '', address: '', pincode: '', payment: 'cod' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [suggestions, setSuggestions] = useState<any[]>([]);

    usePageReveal();

    useEffect(() => {
        // Fetch menu to show suggestions
        axios.get(`${API}/menu`).then(r => {
            const allItems = r.data.items || [];
            // filter for desserts or popular items to suggest
            const suggestable = allItems.filter((i: any) => i.category === 'Desserts' || i.category === 'Starters' || i.category === 'Soups');
            // Shuffle and pick 3
            setSuggestions(suggestable.sort(() => 0.5 - Math.random()).slice(0, 3));
        }).catch(() => { });
    }, []);

    const updateQty = (id: string, delta: number) => {
        const updated = cart.map(c => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter(c => c.qty > 0);
        setCart(updated);
        setCartStorage(updated);
    };

    const addSuggestion = (item: any) => {
        const existing = cart.find(c => c.id === item.id);
        let updated;
        if (existing) {
            updated = cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
        } else {
            updated = [...cart, { ...item, qty: 1 }];
        }
        setCart(updated);
        setCartStorage(updated);
    };

    const total = cart.reduce((s, c) => s + c.price * c.qty, 0);

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Name is required';
        if (!form.phone.trim() || !/^[+]?[\d\s\-()]{10,15}$/.test(form.phone)) errs.phone = 'Valid phone number required';
        if (!form.address.trim() || form.address.trim().length < 10) errs.address = 'Please enter your full delivery address';

        // Delivery radius validation based on Pincode (Gokak area)
        const allowedPincodes = ['591307', '591308', '591344']; // Example Gokak pincodes
        if (!form.pincode.trim()) {
            errs.pincode = 'Pincode is required to check delivery area';
        } else if (!allowedPincodes.includes(form.pincode.trim())) {
            errs.pincode = 'Sorry, we do not deliver to this location yet.';
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const placeOrder = async () => {
        try {
            const payload: any = {
                customer_name: form.name, customer_phone: form.phone, customer_address: form.address,
                items: cart.map(c => ({ id: c.id, name: c.name, qty: c.qty, price: c.price })),
                total, payment_method: form.payment
            };
            if (user?.id) payload.user_id = user.id;

            const { data } = await axios.post(`${API}/orders`, payload);
            const newOrderId = data.orderId || 'SG' + Date.now();
            localStorage.removeItem('sg_cart');
            navigate(`/order/${newOrderId}`);
        } catch {
            const newOrderId = 'SG' + Date.now();
            localStorage.removeItem('sg_cart');
            navigate(`/order/${newOrderId}`);
        }
    };

    const FieldError = ({ field }: { field: string }) => errors[field] ? <p style={{ color: '#e74c3c', fontSize: '.78rem', fontFamily: 'DM Sans', marginTop: 4 }}>{errors[field]}</p> : null;

    return (
        <div className="page-enter" style={{ paddingTop: 120, minHeight: '100vh' }}>
            <div className="container" style={{ maxWidth: 640 }}>
                <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
                    <p className="section-eyebrow">YOUR ORDER</p>
                    <h1>{step === 0 ? 'Cart' : step === 1 ? 'Delivery Details' : 'Payment'}</h1>
                </div>

                {step === 0 && (
                    <div>
                        {cart.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 60 }}>
                                <p style={{ fontSize: '3rem', marginBottom: 16 }}>🛒</p>
                                <p style={{ color: 'var(--muted)' }}>Your cart is empty</p>
                            </div>
                        ) : (
                            <div className="glass" style={{ padding: 24 }}>
                                {cart.map(item => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(212,168,67,0.08)' }}>
                                        <div>
                                            <span style={{ width: 10, height: 10, borderRadius: 2, display: 'inline-block', border: `2px solid ${item.is_veg ? '#27ae60' : '#e74c3c'}`, marginRight: 8, verticalAlign: 'middle' }}>
                                                <span style={{ display: 'block', width: 4, height: 4, borderRadius: '50%', background: item.is_veg ? '#27ae60' : '#e74c3c', margin: '1px auto' }} />
                                            </span>
                                            <span style={{ fontFamily: 'DM Sans', fontWeight: 500 }}>{item.name}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(212,168,67,0.2)', borderRadius: 20, padding: '2px 4px' }}>
                                                <button onClick={() => updateQty(item.id, -1)} style={{ width: 28, height: 28, border: 'none', background: 'transparent', color: 'var(--gold)', cursor: 'pointer', fontSize: '1rem' }}>−</button>
                                                <span style={{ fontFamily: 'DM Sans', fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                                                <button onClick={() => updateQty(item.id, 1)} style={{ width: 28, height: 28, border: 'none', background: 'transparent', color: 'var(--gold)', cursor: 'pointer', fontSize: '1rem' }}>+</button>
                                            </div>
                                            <span style={{ fontFamily: 'DM Sans', fontWeight: 600, color: 'var(--gold)', minWidth: 60, textAlign: 'right' }}>₹{item.price * item.qty}</span>
                                        </div>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0 0', fontFamily: 'Cormorant Garamond', fontSize: '1.4rem', fontWeight: 700 }}>
                                    <span>Total</span>
                                    <span style={{ color: 'var(--gold)' }}>₹{total}</span>
                                </div>

                                {suggestions.filter(s => !cart.find(c => c.id === s.id)).length > 0 && (
                                    <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px dashed rgba(212,168,67,0.2)' }}>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: 16, color: 'var(--gold)' }}>Complete your meal</h3>
                                        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
                                            {suggestions.filter(s => !cart.find(c => c.id === s.id)).map(s => (
                                                <div key={s.id} style={{ minWidth: 160, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    {s.image_url && <img src={s.image_url} alt={s.name} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />}
                                                    <p style={{ fontSize: '.85rem', fontWeight: 600, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</p>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '.9rem' }}>₹{s.price}</span>
                                                        <button onClick={() => addSuggestion(s)} style={{ background: 'transparent', color: '#27ae60', border: '1px solid #27ae60', borderRadius: 12, padding: '2px 10px', fontSize: '.75rem', cursor: 'pointer', fontWeight: 600 }}>+ ADD</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button onClick={() => setStep(1)} className="btn btn-gold" style={{ width: '100%', marginTop: 24 }}>Proceed to Checkout →</button>
                            </div>
                        )}
                    </div>
                )}

                {step === 1 && (
                    <div className="glass">
                        <div className="form-group"><label>YOUR NAME *</label><input value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: '' }); }} placeholder="Full name" style={errors.name ? { borderColor: '#e74c3c' } : {}} /><FieldError field="name" /></div>
                        <div className="form-group"><label>PHONE NUMBER *</label><input value={form.phone} onChange={e => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: '' }); }} placeholder="+91 98765 43210" style={errors.phone ? { borderColor: '#e74c3c' } : {}} /><FieldError field="phone" /></div>

                        <div className="form-group">
                            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span>DELIVERY LOCATION *</span>
                                <button type="button" onClick={() => {
                                    setForm({ ...form, address: 'Spice Garden Gokak, near Falls Road, Gokak, Karnataka 591307' });
                                    setErrors({ ...errors, address: '' });
                                }} style={{ background: 'rgba(39, 174, 96, 0.15)', border: '1px solid #27ae60', color: '#27ae60', padding: '4px 10px', borderRadius: '12px', cursor: 'pointer', fontSize: '.75rem', fontWeight: 'bold' }}>📍 Locate Me</button>
                            </label>

                            <div style={{ width: '100%', height: 160, borderRadius: 8, overflow: 'hidden', marginBottom: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1m3!1d3835.61730799464!2d74.82110597463282!3d16.164344584252535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcbb7ef22ad7ba7%3A0xe5263d6b79c3ac83!2sSpice%20Garden%20Gokak!5e0!3m2!1sen!2sin"
                                    width="100%" height="100%" style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }} loading="lazy" referrerPolicy="no-referrer-when-downgrade">
                                </iframe>
                            </div>

                            <textarea value={form.address} onChange={e => { setForm({ ...form, address: e.target.value }); setErrors({ ...errors, address: '' }); }} placeholder="House/Flat, Street, Landmark, City" rows={3} style={errors.address ? { borderColor: '#e74c3c', width: '100%', marginBottom: 8 } : { width: '100%', marginBottom: 8 }} />
                            <FieldError field="address" />

                            <input value={form.pincode} onChange={e => { setForm({ ...form, pincode: e.target.value }); setErrors({ ...errors, pincode: '' }); }} placeholder="Enter 6-digit Pincode (e.g. 591307)" style={errors.pincode ? { borderColor: '#e74c3c', width: '100%' } : { width: '100%' }} maxLength={6} />
                            <FieldError field="pincode" />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '16px', marginTop: 24 }}>
                            <button onClick={() => setStep(0)} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>← Back</button>
                            <button onClick={() => { if (validate()) setStep(2); }} className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>Choose Payment →</button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="glass">
                        <h3 style={{ marginBottom: 20, color: 'var(--gold)' }}>Select Payment Method</h3>
                        {[
                            { key: 'cod', icon: '💵', label: 'Cash on Delivery', desc: 'Pay when your food arrives' },
                            { key: 'upi', icon: '📱', label: 'UPI Payment', desc: 'Google Pay, PhonePe, Paytm, etc.' },
                        ].map(m => (
                            <div key={m.key} onClick={() => setForm({ ...form, payment: m.key })} style={{
                                padding: '18px 20px', borderRadius: 12, cursor: 'pointer', marginBottom: 12,
                                border: `2px solid ${form.payment === m.key ? 'var(--gold)' : 'rgba(212,168,67,0.1)'}`,
                                background: form.payment === m.key ? 'rgba(212,168,67,0.05)' : 'transparent',
                                transition: 'all .3s ease', display: 'flex', alignItems: 'center', gap: 16
                            }}>
                                <span style={{ fontSize: '1.8rem' }}>{m.icon}</span>
                                <div>
                                    <p style={{ fontFamily: 'DM Sans', fontWeight: 600, marginBottom: 2 }}>{m.label}</p>
                                    <p style={{ fontFamily: 'DM Sans', fontSize: '.8rem', color: 'var(--muted)' }}>{m.desc}</p>
                                </div>
                            </div>
                        ))}
                        <div style={{ background: 'rgba(212,168,67,0.06)', borderRadius: 12, padding: 16, marginTop: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontFamily: 'DM Sans', color: 'var(--muted)', fontSize: '.85rem' }}>Subtotal</span>
                                <span style={{ fontFamily: 'DM Sans' }}>₹{total}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Cormorant Garamond', fontSize: '1.3rem', fontWeight: 700, paddingTop: 8, borderTop: '1px solid rgba(212,168,67,0.1)' }}>
                                <span>Total</span>
                                <span style={{ color: 'var(--gold)' }}>₹{total}</span>
                            </div>
                        </div>

                        {form.payment === 'upi' && (
                            <div style={{ marginTop: 20, textAlign: 'center', background: '#fff', padding: 20, borderRadius: 12, color: '#000' }}>
                                <p style={{ fontWeight: 'bold', marginBottom: 12 }}>Scan to Pay ₹{total}</p>
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=spicegarden@upi&pn=Spice%20Garden&am=${total}&cu=INR`} alt="UPI QR" style={{ width: '100%', maxWidth: 150, height: 'auto', aspectRatio: '1/1' }} />
                                <p style={{ fontSize: '.8rem', color: '#666', marginTop: 12 }}>Use any UPI app (GPay, PhonePe, Paytm)</p>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '16px', marginTop: 24 }}>
                            <button onClick={() => setStep(1)} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>← Back</button>
                            <button onClick={placeOrder} className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>Place Order ✓</button>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
