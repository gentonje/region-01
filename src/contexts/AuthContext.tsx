import { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        console.log('Initializing session...');
        
        // Get fresh session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session initialization error:', error);
          throw error;
        }
        
        if (mounted) {
          if (currentSession) {
            console.log('Found valid session');
            setSession(currentSession);
          } else {
            console.log('No valid session found');
            setSession(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Session initialization error:', error);
        if (mounted) {
          setSession(null);
          setLoading(false);
          // Clear any potentially invalid tokens
          localStorage.removeItem('supabase.auth.token');
          await supabase.auth.signOut();
          toast.error("Session expired. Please login again.");
        }
      }
    };

    // Initialize the session
    initSession();

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event);
      
      if (mounted) {
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          console.log('User signed out or token refreshed');
          setSession(currentSession);
          if (!currentSession) {
            localStorage.removeItem('supabase.auth.token');
          }
        } else if (currentSession) {
          console.log('Session updated');
          setSession(currentSession);
        }
        setLoading(false);
      }
    });

    // Cleanup function
    return () => {
      console.log('Cleaning up auth subscription');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};