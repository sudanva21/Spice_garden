import { Link } from 'react-router-dom';

const FOOTER_LINKS = [
    { label: 'Home', path: '/' },
    { label: 'Menu', path: '/menu' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Order Online', path: '/menu' },
    { label: 'Contact', path: '/contact' },
    { label: 'About', path: '/about' },
];

const LEGAL_LINKS = [
    { label: 'Terms and Conditions', path: '/terms' },
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Disclaimer', path: '/disclaimer' },
];

export default function Footer() {
    return (
        <footer style={{
            background: 'var(--surface)', borderTop: '1px solid rgba(212,168,67,0.08)',
            padding: '64px 0 32px'
        }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, marginBottom: 48 }}>
                    <div>
                        <h3 style={{ fontFamily: 'Cinzel', color: 'var(--gold)', letterSpacing: '3px', fontSize: '1.1rem', marginBottom: 16 }}>
                            SPICE GARDEN
                        </h3>
                        <p style={{ fontSize: '.9rem', lineHeight: 1.8 }}>
                            Gokak's premier family dining restaurant. Authentic Indian & Chinese cuisine.
                        </p>
                        <p style={{ fontFamily: 'DM Sans', fontSize: '.85rem', marginTop: 12 }}>
                            📞 <a href="tel:+919741800400" style={{ color: 'var(--gold)' }}>097418 00400</a>
                        </p>
                        <p style={{ fontFamily: 'DM Sans', fontSize: '.85rem', marginTop: 4, color: 'var(--muted)' }}>
                            📍 Jadhav Farm, Gokak, Karnataka
                        </p>
                    </div>
                    <div>
                        <h4 style={{ fontFamily: 'DM Sans', fontSize: '.75rem', letterSpacing: '2px', color: 'var(--muted)', marginBottom: 16 }}>LINKS</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {FOOTER_LINKS.map(l => (
                                <Link key={l.label} to={l.path} style={{ fontFamily: 'DM Sans', fontSize: '.9rem', color: 'var(--text)' }}>{l.label}</Link>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 style={{ fontFamily: 'DM Sans', fontSize: '.75rem', letterSpacing: '2px', color: 'var(--muted)', marginBottom: 16 }}>LEGAL</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {LEGAL_LINKS.map(l => (
                                <Link key={l.path} to={l.path} style={{ fontFamily: 'DM Sans', fontSize: '.9rem', color: 'var(--text)' }}>{l.label}</Link>
                            ))}
                        </div>
                    </div>
                </div>
                <div style={{ borderTop: '1px solid rgba(212,168,67,0.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '.8rem', color: 'var(--muted)' }}>
                        © {new Date().getFullYear()} Spice Garden. All rights reserved.
                    </p>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <a href="https://www.instagram.com/spicegarrden?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', textDecoration: 'none', fontFamily: 'DM Sans', fontSize: '.9rem' }}>Instagram</a>
                        <a href="https://www.facebook.com/spicegarrdengokak" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', textDecoration: 'none', fontFamily: 'DM Sans', fontSize: '.9rem' }}>Facebook</a>
                    </div>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '.8rem', color: 'var(--muted)' }}>
                        info@spicegarden.info
                    </p>
                </div>
            </div>
        </footer>
    );
}
