import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '/api/v1';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('admin_token')) {
            navigate('/admin');
        }
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post(`${API}/admin/login`, { username, password });
            if (res.data.success) {
                localStorage.setItem('admin_token', res.data.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
                navigate('/admin');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed. Invalid credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-enter" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#081109' }}>
            <div className="glass" style={{ padding: 40, width: '100%', maxWidth: 400, textAlign: 'center' }}>
                <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '2rem', color: 'var(--gold)', marginBottom: 24 }}>Admin Login</h2>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ fontFamily: 'DM Sans', fontSize: '.8rem', color: 'var(--muted)', marginBottom: 6, display: 'block' }}>Username</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid rgba(212,168,67,0.2)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontFamily: 'DM Sans' }}
                        />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ fontFamily: 'DM Sans', fontSize: '.8rem', color: 'var(--muted)', marginBottom: 6, display: 'block' }}>Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid rgba(212,168,67,0.2)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontFamily: 'DM Sans' }}
                        />
                    </div>
                    {error && <p style={{ color: '#e74c3c', fontSize: '.9rem', fontFamily: 'DM Sans' }}>{error}</p>}
                    <button type="submit" disabled={loading} className="btn btn-gold" style={{ width: '100%', marginTop: 8 }}>
                        {loading ? 'Authenticating...' : 'Enter Admin Panel'}
                    </button>
                </form>
            </div>
        </div>
    );
}
