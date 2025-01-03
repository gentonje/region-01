import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import ModifyProducts from "./pages/ModifyProducts";
import AdminUsers from "./pages/AdminUsers";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 1,
    },
  },
});

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        console.log('Initializing session...');
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setSession(null);
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          console.log('Session state:', currentSession ? 'Active' : 'No session');
          setSession(currentSession);
          setLoading(false);
        }
      } catch (error) {
        console.error('Session initialization error:', error);
        if (mounted) {
          setSession(null);
          setLoading(false);
        }
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event);
      
      if (mounted) {
        if (event === 'SIGNED_OUT') {
          setSession(null);
        } else if (currentSession) {
          setSession(currentSession);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    console.log('No active session, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Index />
                  </PrivateRoute>
                }
              />
              <Route
                path="/add-product"
                element={
                  <PrivateRoute>
                    <AddProduct />
                  </PrivateRoute>
                }
              />
              <Route
                path="/edit-product/:id"
                element={
                  <PrivateRoute>
                    <EditProduct />
                  </PrivateRoute>
                }
              />
              <Route
                path="/modify-products"
                element={
                  <PrivateRoute>
                    <ModifyProducts />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <PrivateRoute>
                    <AdminUsers />
                  </PrivateRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;