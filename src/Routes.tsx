import React from 'react';
import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from '@/components/PrivateRoute';
import Index from './pages/Index';
import Home from './pages/Home';
import Login from './pages/Login';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import ModifyProducts from './pages/ModifyProducts';
import AdminUsers from './pages/AdminUsers';
import AdminManagement from './pages/AdminManagement';
import Cart from './pages/Cart';
import EditProfile from './pages/EditProfile';
import Wishlist from './pages/Wishlist';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!session?.user) return false;
      
      const { data, error } = await supabase.rpc('is_admin', {
        user_id: session.user.id
      });
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      return data;
    },
    enabled: !!session?.user
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  const { data: isSuperAdmin, isLoading } = useQuery({
    queryKey: ["isSuperAdmin"],
    queryFn: async () => {
      if (!session?.user) return false;
      
      const { data, error } = await supabase.rpc('is_super_admin', {
        user_id: session.user.id
      });
      
      if (error) {
        console.error('Error checking super admin status:', error);
        return false;
      }
      
      return data;
    },
    enabled: !!session?.user
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const Routes = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <RouterRoutes>
      <Route path="/" element={<Home />} />
      <Route 
        path="/products" 
        element={
          <PrivateRoute>
            <Index />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/login" 
        element={
          session ? <Navigate to="/" replace /> : <Login />
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
            <ModifyProducts userOnly={true} />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <PrivateRoute>
            <AdminRoute>
              <ModifyProducts userOnly={false} />
            </AdminRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <PrivateRoute>
            <Cart />
          </PrivateRoute>
        }
      />
      <Route
        path="/wishlist"
        element={
          <PrivateRoute>
            <Wishlist />
          </PrivateRoute>
        }
      />
      <Route
        path="/edit-profile"
        element={
          <PrivateRoute>
            <EditProfile />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <PrivateRoute>
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/manage"
        element={
          <PrivateRoute>
            <SuperAdminRoute>
              <AdminManagement />
            </SuperAdminRoute>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </RouterRoutes>
  );
};