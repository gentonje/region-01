
import React from 'react';
import { Routes as RouterRoutes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { PrivateRoute } from '@/components/PrivateRoute';
import { AdminRoute } from '@/components/routes/AdminRoute';
import { SuperAdminRoute } from '@/components/routes/SuperAdminRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';

// Page imports
import Index from './pages/Index';
import Home from './pages/Home';
import Login from './pages/Login';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import AdminUsers from './pages/AdminUsers';
import AdminManagement from './pages/AdminManagement';
import Cart from './pages/Cart';
import EditProfile from './pages/EditProfile';
import Wishlist from './pages/Wishlist';

export const Routes = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <RouterRoutes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route 
          path="/login" 
          element={session ? <Navigate to="/" replace /> : <Login />} 
        />

        {/* Protected Routes */}
        <Route 
          path="/products" 
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

        {/* Admin Routes */}
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

        {/* Super Admin Routes */}
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

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </RouterRoutes>
      <Toaster />
    </BrowserRouter>
  );
};
