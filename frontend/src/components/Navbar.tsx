import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { ADMIN_EMAILS } from '../constants/admin';

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
    const navigate = useNavigate();

    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdmin = () => localStorage.getItem('admin_token') === '805520';
        setIsAdmin(checkAdmin());

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            const emailMatches = currentUser?.email ? ADMIN_EMAILS.includes(currentUser.email) : false;
            setIsAdmin(checkAdmin() || emailMatches);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSignOut = async () => {
        await signOut(auth);
        navigate('/');
        setMobileOpen(false);
    };

    const AuthActions = ({ mobile = false }: { mobile?: boolean }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: mobile ? '20px' : '1rem', flexDirection: mobile ? 'column' : 'row', width: '100%', justifyContent: 'center' }}>
            {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexDirection: mobile ? 'column' : 'row' }}>
                    {user.photoURL && (
                        <img src={user.photoURL} alt="Avatar" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                    )}
                    <span style={{ color: 'var(--gold)', fontWeight: 'bold', fontFamily: 'DM Sans', fontSize: mobile ? '1.15rem' : 'inherit' }}>
                        {user.displayName || 'User'}
                    </span>
                    {isAdmin && (
                        <Link to="/admin" onClick={() => setMobileOpen(false)} style={{ color: 'var(--text)', fontSize: '.85rem' }}>Admin Panel</Link>
                    )}
                    <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '.85rem' }}>Sign Out</button>
                </div>
            ) : (
                <button
                    onClick={() => { handleGoogleSignIn(); setMobileOpen(false); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'DM Sans', fontSize: mobile ? '1.15rem' : 'inherit' }}
                >
                    Sign in with Google
                </button>
            )}
        </div>
    );

    return (
        <>
            <div className="progress-bar" style={{ width: `${scrollProgress}%` }} />
            <nav className={`navbar${scrolled ? ' scrolled' : ''}${mobileOpen ? ' menu-open' : ''}`}>
                <Link to="/" className="navbar-logo">SPICE<br />GARDEN</Link>
                <button className={`hamburger${mobileOpen ? ' open' : ''}`} onClick={() => setMobileOpen(!mobileOpen)}>
                    <span /><span /><span />
                </button>
                <ul className={`navbar-links${mobileOpen ? ' mobile-open' : ''}`}>
                    {NAV_LINKS.map(l => (
                        <li key={l.path} style={{ listStyle: 'none', width: '100%', textAlign: 'center' }}>
                            <Link to={l.path} onClick={() => setMobileOpen(false)} style={{ color: location.pathname === l.path ? 'var(--gold)' : undefined }}>
                                {l.label}
                            </Link>
                        </li>
                    ))}
                    {/* Show auth actions inside mobile menu */}
                    <li className="mobile-only-actions" style={{ listStyle: 'none', width: '100%' }}>
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
