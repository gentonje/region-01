import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();

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