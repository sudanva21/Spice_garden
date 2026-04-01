import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const T = {
    bg: '#f5f5f0', surface: '#ffffff', border: '#e8e5dd',
    text: '#1e1e1e', textSec: '#6b6b6b', textMuted: '#9a9a9a',
    gold: '#b8860b', goldBg: '#fdf8ef', red: '#dc2626',
    font: "'DM Sans', -apple-system, system-ui, sans-serif",
    fontHead: "'Cormorant Garamond', Georgia, serif",
};

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem('admin_token'); // Ensure legacy tokens are destroyed
        if (window.ADMIN_TOKEN === '805520' || window.ADMIN_TOKEN === 'a805520') navigate('/admin');
    }, [navigate]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password === '805520' || password === 'a805520') {
            window.ADMIN_TOKEN = password;
            navigate('/admin');
        } else {
            setError('Invalid access code.');
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(135deg, ${T.bg} 0%, #e8e5dd 100%)`,
            fontFamily: T.font,
        }}>
            <div style={{
                background: T.surface, borderRadius: 20, padding: 48, width: '100%', maxWidth: 400,
                textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,.08)', border: `1px solid ${T.border}`,
            }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🌿</div>
                <h2 style={{ fontFamily: T.fontHead, fontSize: '2rem', color: T.gold, marginBottom: 8 }}>Spice Garden</h2>
                <p style={{ fontSize: '.85rem', color: T.textMuted, marginBottom: 28 }}>Admin Dashboard Login</p>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '.75rem', color: T.textSec, marginBottom: 6, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>
                            Access Code
                        </label>
                        <input
                            type="password" required value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Enter admin code"
                            style={{
                                width: '100%', padding: '14px 16px', borderRadius: 10,
                                border: `1px solid ${T.border}`, background: '#fafaf7',
                                color: T.text, fontFamily: T.font, fontSize: '.95rem',
                                outline: 'none', transition: 'border-color .2s',
                            }}
                        />
                    </div>
                    {error && <p style={{ color: T.red, fontSize: '.85rem', margin: 0 }}>{error}</p>}
                    <button type="submit" style={{
                        width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                        background: `linear-gradient(135deg, ${T.gold}, #d4a843)`, color: '#fff',
                        fontFamily: T.font, fontSize: '.95rem', fontWeight: 700,
                        cursor: 'pointer', boxShadow: '0 4px 12px rgba(184,134,11,.3)',
                        transition: 'transform .15s, box-shadow .15s',
                        marginTop: 4,
                    }}>
                        Enter Dashboard →
                    </button>
                </form>
            </div>
        </div>
    );
}
