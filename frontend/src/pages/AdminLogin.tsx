import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('admin_token') === '805520') {
            navigate('/admin');
        }
    }, [navigate]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password === '805520') {
            localStorage.setItem('admin_token', '805520');
            navigate('/admin');
        } else {
            setError('Invalid access code.');
        }
    };

    return (
        <div className="page-enter" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#081109' }}>
            <div className="glass" style={{ padding: 40, width: '100%', maxWidth: 400, textAlign: 'center' }}>
                <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '2rem', color: 'var(--gold)', marginBottom: 24 }}>Admin Login</h2>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ fontFamily: 'DM Sans', fontSize: '.8rem', color: 'var(--muted)', marginBottom: 6, display: 'block' }}>Access Code</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid rgba(212,168,67,0.2)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontFamily: 'DM Sans' }}
                        />
                    </div>
                    {error && <p style={{ color: '#e74c3c', fontSize: '.9rem', fontFamily: 'DM Sans' }}>{error}</p>}
                    <button type="submit" className="btn btn-gold" style={{ width: '100%', marginTop: 8 }}>
                        Enter Admin Panel
                    </button>
                </form>
            </div>
        </div>
    );
}
