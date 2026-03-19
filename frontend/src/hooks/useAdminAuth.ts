import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ADMIN_EMAILS } from '../constants/admin';
import toast from 'react-hot-toast';

interface AdminAuthState {
    isAdmin: boolean;
    loading: boolean;
    user: any;
}

export function useAdminAuth(): AdminAuthState {
    const navigate = useNavigate();
    const [state, setState] = useState<AdminAuthState>({ isAdmin: false, loading: true, user: null });

    useEffect(() => {
        let mounted = true;

        async function checkAdmin() {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session?.user) {
                    if (mounted) {
                        setState({ isAdmin: false, loading: false, user: null });
                        toast.error('Please sign in with Google to access the admin panel.');
                        navigate('/admin/login');
                    }
                    return;
                }

                const email = session.user.email?.toLowerCase() || '';
                const isAdmin = ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email);

                if (!isAdmin) {
                    if (mounted) {
                        setState({ isAdmin: false, loading: false, user: session.user });
                        toast.error('Access denied. You are not an authorized admin.');
                        navigate('/');
                    }
                    return;
                }

                if (mounted) {
                    setState({ isAdmin: true, loading: false, user: session.user });
                }
            } catch (err: any) {
                if (mounted) {
                    setState({ isAdmin: false, loading: false, user: null });
                    toast.error('Auth check failed: ' + err.message);
                    navigate('/admin/login');
                }
            }
        }

        checkAdmin();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session && mounted) {
                setState({ isAdmin: false, loading: false, user: null });
                navigate('/admin/login');
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [navigate]);

    return state;
}
