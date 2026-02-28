import { useState } from 'react';
import { usePageReveal } from '../hooks/useReveal';
import { submitBooking } from '../api';

const TIME_SLOTS = ['12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM'];
const STEPS = ['Guest Info', 'Date & Time', 'Preferences', 'Confirm'];

export default function BookTicket() {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState({ name: '', email: '', phone: '', visit_date: '', time_slot: '', group_size: '2', occasion: '', special_requirements: '' });
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    usePageReveal();

    const update = (field: string, value: any) => { setForm({ ...form, [field]: value }); setErrors({ ...errors, [field]: '' }); };

    const validateStep = (): boolean => {
        const errs: Record<string, string> = {};
        if (step === 0) {
            if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Please enter your full name';
            if (!form.phone.trim() || !/^[+]?[\d\s\-()]{10,15}$/.test(form.phone)) errs.phone = 'Valid phone number is required for reservation';
            if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Please enter a valid email address';
        }
        if (step === 1) {
            if (!form.visit_date) errs.visit_date = 'Please select a date';
            else {
                const sel = new Date(form.visit_date); const today = new Date(); today.setHours(0, 0, 0, 0);
                if (sel < today) errs.visit_date = 'Date must be today or later';
            }
            if (!form.time_slot) errs.time_slot = 'Please select a time slot';
            const size = parseInt(form.group_size);
            if (!size || size < 1) errs.group_size = 'At least 1 guest';
            else if (size > 20) errs.group_size = 'For groups larger than 20, please call us at 097418 00400';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const nextStep = () => { if (validateStep()) setStep(step + 1); };

    const handleSubmit = async () => {
        try { await submitBooking({ ...form, group_size: parseInt(form.group_size), tour_type: 'dine-in' }); } catch { }
        setSubmitted(true);
    };

    const today = new Date().toISOString().split('T')[0];

    const FieldError = ({ field }: { field: string }) => errors[field] ? <p style={{ color: '#e74c3c', fontSize: '.78rem', fontFamily: 'DM Sans', marginTop: 4 }}>{errors[field]}</p> : null;

    if (submitted) {
        return (
            <div className="page-enter" style={{ paddingTop: 120, minHeight: '100vh' }}>
                <div className="container" style={{ maxWidth: 600, textAlign: 'center' }}>
                    <div className="glass reveal" style={{ padding: 60 }}>
                        <div style={{ fontSize: '4rem', marginBottom: 20, animation: 'float 3s ease-in-out infinite' }}>🍽️</div>
                        <h2 style={{ marginBottom: 12 }}>Table Reserved!</h2>
                        <p style={{ marginBottom: 8 }}>Thank you, <strong>{form.name}</strong>.</p>
                        <p style={{ marginBottom: 8 }}>📅 {form.visit_date ? new Date(form.visit_date).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : ''} at <strong>{form.time_slot}</strong></p>
                        <p style={{ marginBottom: 16 }}>👥 {form.group_size} {parseInt(form.group_size) === 1 ? 'guest' : 'guests'}</p>
                        <p style={{ color: 'var(--muted)', fontFamily: 'DM Sans', fontSize: '.85rem' }}>We'll send a confirmation to {form.phone}</p>
                        <p style={{ color: 'var(--muted)', fontFamily: 'DM Sans', fontSize: '.8rem', marginTop: 12 }}>Need to change? Call <a href="tel:+919741800400" style={{ color: 'var(--gold)' }}>097418 00400</a></p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-enter" style={{ paddingTop: 120, minHeight: '100vh' }}>
            <div className="container" style={{ maxWidth: 640 }}>
                <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
                    <p className="section-eyebrow">RESERVATION</p>
                    <h1>Book a Table</h1>
                    <p style={{ marginTop: 8 }}>Reserve your table at Spice Garden, Gokak</p>
                </div>

                <div className="reveal" style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 40 }}>
                    {STEPS.map((s, i) => (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: i <= step ? 'linear-gradient(135deg, var(--gold), var(--gold-light))' : 'var(--surface2)',
                                color: i <= step ? '#0D1A0F' : 'var(--muted)',
                                fontFamily: 'DM Sans', fontSize: '.8rem', fontWeight: 700, transition: 'all .4s var(--ease)'
                            }}>{i + 1}</div>
                            <span style={{ fontFamily: 'DM Sans', fontSize: '.75rem', color: i <= step ? 'var(--gold)' : 'var(--muted)' }}>{s}</span>
                            {i < STEPS.length - 1 && <div style={{ width: 32, height: 1, background: i < step ? 'var(--gold)' : 'var(--surface2)' }} />}
                        </div>
                    ))}
                </div>

                <div className="glass" style={{ animation: 'scaleIn .3s var(--ease)' }}>
                    {step === 0 && (
                        <div>
                            <div className="form-group"><label>FULL NAME *</label><input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Enter your name" style={errors.name ? { borderColor: '#e74c3c' } : {}} /><FieldError field="name" /></div>
                            <div className="form-group"><label>PHONE NUMBER *</label><input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+91 98765 43210" style={errors.phone ? { borderColor: '#e74c3c' } : {}} /><FieldError field="phone" /></div>
                            <div className="form-group"><label>EMAIL (OPTIONAL)</label><input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="your@email.com" style={errors.email ? { borderColor: '#e74c3c' } : {}} /><FieldError field="email" /></div>
                        </div>
                    )}
                    {step === 1 && (
                        <div>
                            <div className="form-group"><label>DATE *</label><input type="date" min={today} value={form.visit_date} onChange={e => update('visit_date', e.target.value)} style={errors.visit_date ? { borderColor: '#e74c3c' } : {}} /><FieldError field="visit_date" /></div>
                            <div className="form-group">
                                <label>TIME SLOT *</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {TIME_SLOTS.map(t => (
                                        <button key={t} onClick={() => update('time_slot', t)} style={{
                                            padding: '10px 18px', borderRadius: 20, cursor: 'pointer',
                                            border: `1.5px solid ${form.time_slot === t ? 'var(--gold)' : 'rgba(212,168,67,0.15)'}`,
                                            background: form.time_slot === t ? 'linear-gradient(135deg, var(--gold), var(--gold-light))' : 'transparent',
                                            color: form.time_slot === t ? '#0D1A0F' : 'var(--gold)',
                                            fontFamily: 'DM Sans', fontSize: '.82rem', fontWeight: 500, transition: 'all .25s ease'
                                        }}>{t}</button>
                                    ))}
                                </div>
                                <FieldError field="time_slot" />
                            </div>
                            <div className="form-group"><label>GUESTS (1–20) *</label><input type="number" min="1" max="20" value={form.group_size} onChange={e => update('group_size', e.target.value)} style={errors.group_size ? { borderColor: '#e74c3c' } : {}} /><FieldError field="group_size" /></div>
                        </div>
                    )}
                    {step === 2 && (
                        <div>
                            <div className="form-group">
                                <label>OCCASION (OPTIONAL)</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {['Birthday', 'Anniversary', 'Date Night', 'Family Dinner', 'Business Meal', 'Celebration'].map(o => (
                                        <button key={o} onClick={() => update('occasion', form.occasion === o ? '' : o)} style={{
                                            padding: '10px 18px', borderRadius: 20, cursor: 'pointer',
                                            border: `1.5px solid ${form.occasion === o ? 'var(--gold)' : 'rgba(212,168,67,0.15)'}`,
                                            background: form.occasion === o ? 'linear-gradient(135deg, var(--gold), var(--gold-light))' : 'transparent',
                                            color: form.occasion === o ? '#0D1A0F' : 'var(--gold)',
                                            fontFamily: 'DM Sans', fontSize: '.82rem', fontWeight: 500, transition: 'all .25s ease'
                                        }}>{o}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group"><label>SPECIAL REQUESTS</label><textarea value={form.special_requirements} onChange={e => update('special_requirements', e.target.value)} placeholder="High chair, wheelchair access, dietary needs..." /></div>
                        </div>
                    )}
                    {step === 3 && (
                        <div>
                            <h3 style={{ marginBottom: 20, color: 'var(--gold)' }}>Confirm Reservation</h3>
                            {[
                                ['Name', form.name], ['Phone', form.phone], ['Email', form.email || 'Not provided'],
                                ['Date', form.visit_date ? new Date(form.visit_date).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : ''],
                                ['Time', form.time_slot], ['Guests', form.group_size],
                                ['Occasion', form.occasion || 'None'], ['Requests', form.special_requirements || 'None'],
                            ].map(([l, v]) => (
                                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(212,168,67,0.08)' }}>
                                    <span style={{ fontFamily: 'DM Sans', fontSize: '.85rem', color: 'var(--muted)' }}>{l}</span>
                                    <span style={{ fontFamily: 'DM Sans', fontSize: '.85rem', fontWeight: 500 }}>{v}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
                        {step > 0 ? <button onClick={() => setStep(step - 1)} className="btn btn-outline">← Back</button> : <div />}
                        {step < 3
                            ? <button onClick={nextStep} className="btn btn-gold">Next →</button>
                            : <button onClick={handleSubmit} className="btn btn-gold">Confirm Reservation ✓</button>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
