import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Confetti from "@/components/Confetti";

const Login = () => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Initializing auth state...");
    
    // Initialize session state
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session initialization error:", error);
          setLoading(false);
          return;
        }

        console.log("Initial session state:", session ? "Active session" : "No session");
        
        if (session) {
          setShowConfetti(true);
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
        }
      } catch (err) {
        console.error("Unexpected error during session init:", err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session ? "Session exists" : "No session");
      
      if (event === 'SIGNED_IN' && session) {
        try {
          // Verify session is valid
          const { data: { user }, error } = await supabase.auth.getUser();
          
          if (error) {
            console.error("Error verifying user session:", error);
            return;
          }

          if (user) {
            console.log("Valid user session established");
            setShowConfetti(true);
            setTimeout(() => {
              navigate('/', { replace: true });
            }, 2000);
          }
        } catch (err) {
          console.error("Error during sign-in handling:", err);
        }
      }
    });

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">Please sign in to your account</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="light"
          providers={[]}
          redirectTo={window.location.origin}
        />
      </div>
      <Confetti isActive={showConfetti} />
    </div>
  );
};

export default Login;