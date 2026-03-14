import { useState } from 'react';
import { usePageReveal } from '../hooks/useReveal';
import { submitContact } from '../api';

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    usePageReveal();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try { await submitContact(form); setSent(true); } catch { setError('Could not send message. Please try again.'); }
    };

    return (
        <div className="page-enter" style={{ paddingTop: 120, minHeight: '100vh' }}>
            <div className="container">
                <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
                    <p className="section-eyebrow">GET IN TOUCH</p>
                    <h1>Contact</h1>
                </div>

                <div className="contact-main-grid">
                    <form onSubmit={handleSubmit} className="reveal-left">
                        {sent ? (
                            <div className="glass" style={{ textAlign: 'center', padding: 48 }}>
                                <div style={{ fontSize: '3rem', marginBottom: 16, animation: 'float 3s ease-in-out infinite' }}>🌿</div>
                                <h3 style={{ marginBottom: 8 }}>Message Received!</h3>
                                <p>Thank you for reaching out. We'll get back to you soon.</p>
                            </div>
                        ) : (
                            <>
                                <div className="form-group"><label>NAME</label><input name="name" value={form.name} onChange={handleChange} required /></div>
                                <div className="form-group"><label>EMAIL ADDRESS</label><input name="email" type="email" value={form.email} onChange={handleChange} required /></div>
                                <div className="form-group"><label>SUBJECT</label><input name="subject" value={form.subject} onChange={handleChange} /></div>
                                <div className="form-group"><label>MESSAGE</label><textarea name="message" value={form.message} onChange={handleChange} required /></div>
                                {error && <p style={{ color: 'var(--red)', marginBottom: 16, fontFamily: 'DM Sans', fontSize: '.85rem' }}>{error}</p>}
                                <button type="submit" className="btn btn-gold">Send Message</button>
                            </>
                        )}
                    </form>

                    <div className="reveal-right">
                        <div className="glass" style={{ marginBottom: 24 }}>
                            <h3 style={{ marginBottom: 20, color: 'var(--gold)' }}>Visit Us</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: '1.2rem' }}>📍</span>
                                    <div>
                                        <p style={{ fontFamily: 'DM Sans', fontSize: '.8rem', color: 'var(--muted)', marginBottom: 4 }}>ADDRESS</p>
                                        <p style={{ fontFamily: 'DM Sans', fontWeight: 500 }}>Spice Garden, Gokak, Belagavi District, Karnataka 591307</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: '1.2rem' }}>✉️</span>
                                    <div>
                                        <p style={{ fontFamily: 'DM Sans', fontSize: '.8rem', color: 'var(--muted)', marginBottom: 4 }}>EMAIL</p>
                                        <p style={{ fontFamily: 'DM Sans', fontWeight: 500 }}>info@spicegarden.info</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: '1.2rem' }}>🕐</span>
                                    <div>
                                        <p style={{ fontFamily: 'DM Sans', fontSize: '.8rem', color: 'var(--muted)', marginBottom: 4 }}>TIMINGS</p>
                                        <p style={{ fontFamily: 'DM Sans', fontWeight: 500 }}>Monday – Friday: 6–10 AM, 4–7:30 PM</p>
                                        <p style={{ fontFamily: 'DM Sans', fontWeight: 500 }}>Sunday: 6–10 AM, 4–7:30 PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', height: 280 }}>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30642.09!2d74.82!3d16.17!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc1097f0d81b84d%3A0x4c15b3ad1e4c8e00!2sGokak%2C+Karnataka!5e0!3m2!1sen!2sin!4v1705000000000"
                                width="100%" height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Spice Garden — Gokak, Karnataka"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
