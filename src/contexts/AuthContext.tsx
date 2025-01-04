import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;

    const handleAuthError = async () => {
      console.log('Handling auth error - clearing session');
      if (mounted) {
        setSession(null);
        setUser(null);
        // Clear any potentially invalid tokens
        localStorage.removeItem('supabase.auth.token');
        await supabase.auth.signOut();
        toast.error("Session expired. Please login again.");
      }
    };

    const initSession = async () => {
      try {
        console.log('Initializing session...');
        
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session initialization error:', error);
          await handleAuthError();
          return;
        }
        
        if (mounted) {
          if (currentSession) {
            console.log('Found valid session');
            setSession(currentSession);
            setUser(currentSession.user);
          } else {
            console.log('No valid session found');
            setSession(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Session initialization error:', error);
        await handleAuthError();
      } finally {
        if (mounted) {
          setLoading(false);
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
          setUser(null);
          localStorage.removeItem('supabase.auth.token');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed');
          if (currentSession) {
            setSession(currentSession);
            setUser(currentSession.user);
          }
        } else if (currentSession) {
          console.log('Session updated');
          setSession(currentSession);
          setUser(currentSession.user);
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
    <AuthContext.Provider value={{ session, user, loading }}>
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