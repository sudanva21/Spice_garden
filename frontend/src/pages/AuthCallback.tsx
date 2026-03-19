import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.search);
        
        if (error) {
          throw error;
        }

        if (data.session) {
          toast.success('Successfully signed in!');
          // You could check if admin and redirect to /admin/events, but sending to / or the previous page is standard
          navigate('/');
        } else {
          toast.error('Login failed, please try again');
          navigate('/');
        }
      } catch (err: any) {
        toast.error('Login failed: ' + err.message);
        navigate('/');
      }
    }

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0f0d]">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[var(--gold)] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-[var(--gold)] font-['DM_Sans'] text-lg">Authenticating securely...</p>
      </div>
    </div>
  );
}
