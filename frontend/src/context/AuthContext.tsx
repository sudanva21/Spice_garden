import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface User {
    id: string;
    phone: string;
    name: string | null;
    email: string | null;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthModalOpen: boolean;
    login: (userData: User, tokenStr: string) => void;
    logout: () => void;
    openAuthModal: () => void;
    closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    useEffect(() => {
        // Load auth from local storage on mount
        const savedUser = localStorage.getItem('spice_garden_user');
        const savedToken = localStorage.getItem('spice_garden_token');
        if (savedUser && savedToken) {
            try {
                setUser(JSON.parse(savedUser));
                setToken(savedToken);
            } catch (e) {
                console.error('Failed to parse user session');
            }
        }

        const syncGoogleUser = async (session: any) => {
            try {
                const API = import.meta.env.VITE_API_URL || '/api/v1';
                // Sync Google account with our custom Postgres users table
                const res = await fetch(`${API}/auth/sync`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                    },
                    body: JSON.stringify({
                        email: session.user.email,
                        name: session.user.user_metadata?.full_name || 'Google User'
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    login(data.user, data.token);
                    closeAuthModal();
                } else {
                    const data = await res.json();
                    console.error('Sync failed:', data.error);
                    alert(`Login Sync Failed: ${data.error}`);
                }
            } catch (err) {
                console.error('Failed to sync Google user', err);
            }
        };

        // Listen for Supabase OAuth redirects / sign-ins
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                await syncGoogleUser(session);
            } else if (event === 'INITIAL_SESSION' && session) {
                const savedUser = localStorage.getItem('spice_garden_user');
                if (!savedUser) {
                    await syncGoogleUser(session);
                }
            } else if (event === 'SIGNED_OUT') {
                logout();
            }
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    const login = (userData: User, tokenStr: string) => {
        setUser(userData);
        setToken(tokenStr);
        localStorage.setItem('spice_garden_user', JSON.stringify(userData));
        localStorage.setItem('spice_garden_token', tokenStr);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('spice_garden_user');
        localStorage.removeItem('spice_garden_token');
    };

    const openAuthModal = () => setIsAuthModalOpen(true);
    const closeAuthModal = () => setIsAuthModalOpen(false);

    return (
        <AuthContext.Provider value={{
            user, token, isAuthModalOpen,
            login, logout, openAuthModal, closeAuthModal
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
