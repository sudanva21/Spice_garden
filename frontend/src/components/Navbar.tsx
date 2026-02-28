import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
    { label: 'Home', path: '/' },
    { label: 'Menu', path: '/menu' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Blog', path: '/blog' },
    { label: 'Events', path: '/events' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
];

export default function Navbar() {
    const [scrollProgress, setScrollProgress] = useState(0);
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const { user, openAuthModal } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            const total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const AuthActions = ({ mobile = false }: { mobile?: boolean }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: mobile ? '16px' : '1rem', flexDirection: mobile ? 'column' : 'row' }}>
            {user ? (
                <Link to="/profile" onClick={() => setMobileOpen(false)} style={{ color: 'var(--gold)', fontWeight: 'bold', fontFamily: 'DM Sans' }}>
                    {user.name || 'Profile'}
                </Link>
            ) : (
                <button
                    onClick={() => { openAuthModal(); setMobileOpen(false); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'DM Sans', fontSize: mobile ? '1rem' : 'inherit' }}
                >
                    Login
                </button>
            )}
            <Link to="/book" onClick={() => setMobileOpen(false)} className="btn btn-gold" style={{ padding: '10px 24px', fontSize: '.8rem' }}>Book a Table</Link>
        </div>
    );

    return (
        <>
            <div className="progress-bar" style={{ width: `${scrollProgress}%` }} />
            <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
                <Link to="/" className="navbar-logo">SPICE<br />GARDEN</Link>
                <button className={`hamburger${mobileOpen ? ' open' : ''}`} onClick={() => setMobileOpen(!mobileOpen)}>
                    <span /><span /><span />
                </button>
                <ul className={`navbar-links${mobileOpen ? ' mobile-open' : ''}`}>
                    {NAV_LINKS.map(l => (
                        <li key={l.path}>
                            <Link to={l.path} onClick={() => setMobileOpen(false)} style={{ color: location.pathname === l.path ? 'var(--gold)' : undefined }}>
                                {l.label}
                            </Link>
                        </li>
                    ))}
                    {/* Show auth actions inside mobile menu */}
                    <li className="mobile-only-actions">
                        <AuthActions mobile />
                    </li>
                </ul>
                <div className="navbar-actions">
                    <AuthActions />
                </div>
            </nav>
        </>
    );
}
