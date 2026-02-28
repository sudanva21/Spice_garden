import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
    const { isAuthModalOpen, closeAuthModal, login } = useAuth();

    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isAuthModalOpen) return null;

    const API = import.meta.env.VITE_API_URL || '/api/v1';

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${API}/auth/request-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
            if (!res.ok) throw new Error('Failed to request OTP');
            setStep('otp');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${API}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp, name })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to verify OTP');

            login(data.user, data.token);
            closeAuthModal();
            setStep('phone');
            setOtp('');
            setPhone('');
            setName('');
        } catch (err: any) {
            setError(err.message);
        } finally {
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

                <h2 style={{ color: 'var(--gold)', marginBottom: '8px', fontFamily: '"Playfair Display", serif' }}>
                    {step === 'phone' ? 'Login or Sign up' : 'Enter OTP'}
                </h2>

                {step === 'phone' && (
                    <form onSubmit={handleRequestOtp}>
                        <p style={{ color: '#ccc', marginBottom: '24px', fontSize: '0.9rem' }}>
                            We'll send you an OTP to verify your number
                        </p>
                        <input
                            type="text"
                            placeholder="Your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="form-control"
                            style={{ padding: '12px', fontSize: '1rem', width: '100%', marginBottom: '16px', boxSizing: 'border-box' }}
                            required
                        />
                        <input
                            type="tel"
                            placeholder="Phone Number (e.g. 9876543210)"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="form-control"
                            style={{ padding: '12px', fontSize: '1rem', width: '100%', marginBottom: '16px', boxSizing: 'border-box' }}
                            required
                        />
                        {error && <p style={{ color: '#ff4d4f', fontSize: '0.9rem', marginBottom: '16px' }}>{error}</p>}
                        <button type="submit" className="btn btn-gold" style={{ width: '100%', padding: '12px' }} disabled={loading}>
                            {loading ? 'Sending...' : 'Continue'}
                        </button>
                    </form>
                )}

                {step === 'otp' && (
                    <form onSubmit={handleVerifyOtp}>
                        <p style={{ color: '#ccc', marginBottom: '24px', fontSize: '0.9rem' }}>
                            Enter the 6-digit OTP sent to {phone}.
                        </p>
                        <input
                            type="text"
                            placeholder="OTP (e.g. 123456)"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="form-control"
                            style={{ padding: '12px', fontSize: '1rem', width: '100%', marginBottom: '16px', boxSizing: 'border-box' }}
                            required
                        />
                        {error && <p style={{ color: '#ff4d4f', fontSize: '0.9rem', marginBottom: '16px', fontFamily: '"Playfair Display", serif' }}>{error}</p>}
                        <button type="submit" className="btn btn-gold" style={{ width: '100%', padding: '12px' }} disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify & Proceed'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep('phone')}
                            style={{ background: 'none', border: 'none', color: '#ccc', width: '100%', marginTop: '16px', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Change Phone Number
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
