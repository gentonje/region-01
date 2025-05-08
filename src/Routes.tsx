
import React, { Suspense } from 'react';
import { Routes as RouterRoutes, Route, Navigate, Outlet } from 'react-router-dom';
import { SuperAdminRoute } from '@/components/routes/SuperAdminRoute';
import { MainLayout } from '@/components/layouts/MainLayout';

// Pages
import Home from '@/pages/Home';
import AdminUsers from '@/pages/AdminUsers';
import AdminCategories from '@/pages/AdminCategories';

export const Routes = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RouterRoutes>
        <Route path="/" element={<MainLayout><Outlet /></MainLayout>}>
          <Route index element={<Home />} />
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
        </Route>
      </RouterRoutes>
    </Suspense>
  );
};

export default Routes;
