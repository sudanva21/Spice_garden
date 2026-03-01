import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function AuthModal() {
    const { isAuthModalOpen, closeAuthModal } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isAuthModalOpen) return null;

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Failed to sign in with Google');
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 9999
        }}>
            <div style={{
                backgroundColor: '#1E231F', padding: '32px', borderRadius: '12px',
                width: '100%', maxWidth: '400px', border: '1px solid var(--gold)',
                position: 'relative'
            }}>
                <button
                    onClick={closeAuthModal}
                    style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', color: 'var(--gold)', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                >×</button>

                <h2 style={{ color: 'var(--gold)', marginBottom: '8px', fontFamily: '"Playfair Display", serif', textAlign: 'center' }}>
                    Welcome to Spice Garden
                </h2>
                <p style={{ color: '#ccc', marginBottom: '32px', fontSize: '0.9rem', textAlign: 'center' }}>
                    Sign in or create an account to manage your bookings and orders.
                </p>

                {error && <p style={{ color: '#ff4d4f', fontSize: '0.9rem', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}

                <button
                    onClick={handleGoogleSignIn}
                    className="btn"
                    style={{
                        width: '100%',
                        padding: '12px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '12px',
                        background: 'white',
                        color: 'black',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                    disabled={loading}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    {loading ? 'Redirecting...' : 'Sign in with Google'}
                </button>
            </div>
        </div>
    );
}
