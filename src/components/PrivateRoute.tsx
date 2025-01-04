import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  const location = useLocation();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

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

  if (loading || profileLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    console.log('No active session, redirecting to login');
    localStorage.removeItem('supabase.auth.token');
    return <Navigate to="/login" replace />;
  }

  // Don't redirect to onboarding if already on onboarding page or if it's completed
  if (!profile?.onboarding_completed && 
      location.pathname !== "/onboarding" && 
      location.pathname !== "/login") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};