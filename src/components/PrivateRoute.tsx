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
        .select("onboarding_completed, user_type")
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

  // Redirect to user type selection if not set
  if (!profile?.user_type && location.pathname !== "/user-type") {
    return <Navigate to="/user-type" replace />;
  }

  // If user is trying to access Add Product and they're not a seller,
  // redirect them to onboarding
  if (location.pathname === "/add-product" && 
      profile?.user_type !== 'seller') {
    return <Navigate to="/onboarding" replace />;
  }

  // Only redirect to onboarding if user is a seller and hasn't completed it
  if (profile?.user_type === 'seller' && 
      !profile?.onboarding_completed && 
      location.pathname !== "/onboarding" && 
      location.pathname !== "/login") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};