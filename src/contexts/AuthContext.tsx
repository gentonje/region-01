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

    const initSession = async () => {
      try {
        console.log('Initializing session...');
        
        // Get the current session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session initialization error:', sessionError);
          if (mounted) {
            setSession(null);
            setUser(null);
          }
          return;
        }

        // If we have a session, refresh it to ensure it's valid
        if (currentSession) {
          const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error('Session refresh error:', refreshError);
            if (mounted) {
              setSession(null);
              setUser(null);
              toast.error("Session expired. Please log in again.");
            }
            return;
          }

          if (mounted && refreshedSession) {
            console.log('Session refreshed successfully');
            setSession(refreshedSession);
            setUser(refreshedSession.user);
          }
        } else {
          console.log('No valid session found');
          if (mounted) {
            setSession(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Session initialization error:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          toast.error("Session error. Please try logging in again.");
        }
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
          toast.info("You have been signed out.");
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('Session updated');
          if (currentSession) {
            setSession(currentSession);
            setUser(currentSession.user);
          }
        } else if (event === 'USER_UPDATED') {
          console.log('User updated');
          if (currentSession?.user) {
            setUser(currentSession.user);
          }
        }
        setLoading(false);
      }
    });

    // Set up periodic session refresh
    const refreshInterval = setInterval(async () => {
      if (session) {
        const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('Periodic session refresh error:', error);
          if (mounted) {
            setSession(null);
            setUser(null);
            toast.error("Session expired. Please log in again.");
          }
        } else if (mounted && refreshedSession) {
          setSession(refreshedSession);
          setUser(refreshedSession.user);
        }
      }
    }, 4 * 60 * 1000); // Refresh every 4 minutes

    // Cleanup function
    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearInterval(refreshInterval);
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