import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      if (error || !currentSession) {
        localStorage.removeItem('supabase.auth.token');
        await supabase.auth.signOut();
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    console.log('No active session, redirecting to login');
    // Clear any potentially invalid session data
    localStorage.removeItem('supabase.auth.token');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};