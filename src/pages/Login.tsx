import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const mounted = useRef(true);
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login';

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Checking for existing session on Login page');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session on Login page:', error);
          toast.error("Error checking session. Please try again.");
          return;
        }

        if (session && mounted.current) {
          console.log('Active session found on Login page, redirecting to home');
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Error in Login page session check:', error);
        toast.error("Session check failed. Please try again.");
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed on Login page:', event);
      
      if (event === 'SIGNED_IN' && session && mounted.current) {
        console.log('User signed in on Login page, redirecting to home');
        toast.success("Successfully signed in!");
        navigate('/', { replace: true });
      } else if (event === 'USER_DELETED') {
        toast.error("Account has been deleted.");
      } else if (event === 'PASSWORD_RECOVERY') {
        toast.info("Password recovery email sent.");
      }
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <Link to="/" className="text-3xl font-bold mb-8" style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}>
        <span style={{ color: '#F97316' }}>السوق</span>
        <span style={{ color: '#0EA5E9' }}> الحر</span>
      </Link>
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {mode === 'login' ? 'Please sign in to your account' : 'Please sign up for an account'}
          </p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            style: {
              button: { background: '#F97316', color: 'white' },
              anchor: { color: '#0EA5E9' },
            }
          }}
          theme="light"
          providers={[]}
          view={mode === 'login' ? 'sign_in' : 'sign_up'}
          redirectTo={window.location.origin}
          onError={(error) => {
            console.error('Auth error:', error);
            toast.error(error.message || "Authentication failed. Please try again.");
          }}
        />
      </div>
    </div>
  );
};

export default Login;