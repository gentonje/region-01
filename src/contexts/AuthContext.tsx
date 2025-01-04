import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  session: Session | null;
  user: User | null;  // Add the user property
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,  // Add default value for user
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);  // Add user state

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
            setUser(currentSession.user);  // Set the user when session is found
          } else {
            console.log('No valid session found');
            setSession(null);
            setUser(null);  // Clear user when no session
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Session initialization error:', error);
        if (mounted) {
          setSession(null);
          setUser(null);  // Clear user on error
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
          setUser(currentSession?.user || null);  // Update user on auth state change
          if (!currentSession) {
            localStorage.removeItem('supabase.auth.token');
          }
        } else if (currentSession) {
          console.log('Session updated');
          setSession(currentSession);
          setUser(currentSession.user);  // Update user when session changes
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