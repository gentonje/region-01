
import React, { Suspense, createContext, useContext, useState } from 'react';
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { AdminRoute } from '@/components/routes/AdminRoute';
import { SuperAdminRoute } from '@/components/routes/SuperAdminRoute';
import AdminUsers from '@/pages/AdminUsers';
import Home from '@/pages/Home';
import AdminCategories from '@/pages/AdminCategories';
import Districts from '@/pages/Districts';

// Create a context for selected country
export const SelectedCountryContext = createContext<{
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
}>({
  selectedCountry: "1",
  setSelectedCountry: () => {}
});

export const useSelectedCountry = () => useContext(SelectedCountryContext);

const AppRoutes = () => {
  const [selectedCountry, setSelectedCountry] = useState("1");
  
  return (
    <BrowserRouter>
      <SelectedCountryContext.Provider value={{ selectedCountry, setSelectedCountry }}>
        <MainLayout>
          <Suspense fallback={<div>Loading...</div>}>
            <RouterRoutes>
              <Route path="/" element={<Home />} />
              
              {/* Admin routes */}
              <Route 
                path="/admin/users" 
                element={
                  <SuperAdminRoute>
                    <AdminUsers />
                  </SuperAdminRoute>
                } 
              />
              
              <Route 
                path="/admin/categories" 
                element={
                  <SuperAdminRoute>
                    <AdminCategories />
                  </SuperAdminRoute>
                } 
              />
              
              <Route 
                path="/admin/districts" 
                element={
                  <SuperAdminRoute>
                    <Districts />
                  </SuperAdminRoute>
                } 
              />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </RouterRoutes>
          </Suspense>
        </MainLayout>
      </SelectedCountryContext.Provider>
    </BrowserRouter>
  );
};

export default AppRoutes;
