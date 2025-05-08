
import React, { Suspense } from 'react';
import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { SuperAdminRoute } from '@/components/routes/SuperAdminRoute';

// Pages
import Home from '@/pages/Home';
import AdminUsers from '@/pages/AdminUsers';
import AdminCategories from '@/pages/AdminCategories';

export const Routes = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RouterRoutes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/users" element={
          <SuperAdminRoute>
            <AdminUsers />
          </SuperAdminRoute>
        } />
        <Route path="/admin/categories" element={
          <SuperAdminRoute>
            <AdminCategories />
          </SuperAdminRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </RouterRoutes>
    </Suspense>
  );
};

export default Routes;
