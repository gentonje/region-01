import { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

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
        
        // First try to recover the session from localStorage
        const { data: { session: storedSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (storedSession) {
            console.log('Found stored session');
            setSession(storedSession);
          } else {
            console.log('No stored session found');
            setSession(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Session initialization error:', error);
        if (mounted) {
          // Clear the session if there's an error
          setSession(null);
          setLoading(false);
          
          // Clear any invalid session data
          await supabase.auth.signOut();
        }
      }
    };

    // Initialize the session
    initSession();

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event);
      
      if (mounted) {
        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setSession(null);
          // Clear any potentially invalid session data
          localStorage.removeItem('supabase.auth.token');
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