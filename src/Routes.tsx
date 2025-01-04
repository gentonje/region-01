import React from 'react';
import { Routes as RouterRoutes, Route } from 'react-router-dom';
import { PrivateRoute } from '@/components/PrivateRoute';
import Index from './pages/Index';
import Login from './pages/Login';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import ModifyProducts from './pages/ModifyProducts';
import AdminUsers from './pages/AdminUsers';
import Cart from './pages/Cart';
import EditProfile from './pages/EditProfile';

export const Routes = () => {
  return (
    <RouterRoutes>
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
      <Route
        path="/cart"
        element={
          <PrivateRoute>
            <Cart />
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
    </RouterRoutes>
  );
};