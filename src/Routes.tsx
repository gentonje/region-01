
import React, { Suspense, createContext, useContext } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { SuperAdminRoute } from '@/components/SuperAdminRoute';
import AdminUsers from '@/pages/AdminUsers';
import Products from '@/pages/Products';
import ProductDetails from '@/pages/ProductDetails';
import CreateProduct from '@/pages/CreateProduct';
import EditProduct from '@/pages/EditProduct';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Shops from '@/pages/Shops';
import ShopDetails from '@/pages/ShopDetails';
import CreateShop from '@/pages/CreateShop';
import EditShop from '@/pages/EditShop';
import Home from '@/pages/Home';
import Districts from '@/pages/Districts';
import AdminCategories from '@/pages/AdminCategories';

// Create a context for selected country
export const SelectedCountryContext = createContext<{
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
}>({
  selectedCountry: "1",
  setSelectedCountry: () => {}
});

export const useSelectedCountry = () => useContext(SelectedCountryContext);

const Routes = () => {
  // Initial country state (will be managed by MainLayout)
  return (
    <BrowserRouter>
      <MainLayout>
        <Suspense fallback={<div>Loading...</div>}>
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route exact path="/products">
              <Products />
            </Route>
            <Route path="/products/:id">
              <ProductDetails />
            </Route>
            <Route path="/profile/:id">
              <Profile />
            </Route>
            <Route path="/settings">
              <Settings />
            </Route>
            <Route exact path="/shops">
              <Shops />
            </Route>
            <Route path="/shops/:id">
              <ShopDetails />
            </Route>
            <Route path="/create-product">
              <CreateProduct />
            </Route>
            <Route path="/edit-product/:id">
              <EditProduct />
            </Route>
            <Route path="/create-shop">
              <CreateShop />
            </Route>
            <Route path="/edit-shop/:id">
              <EditShop />
            </Route>
            <SuperAdminRoute path="/admin/users">
              <AdminUsers />
            </SuperAdminRoute>
            
            <SuperAdminRoute path="/admin/categories">
              <AdminCategories />
            </SuperAdminRoute>
            
            <SuperAdminRoute path="/admin/districts">
              <Districts />
            </SuperAdminRoute>
            <Route path="*">
              <Redirect to="/" />
            </Route>
          </Switch>
        </Suspense>
      </MainLayout>
    </BrowserRouter>
  );
};

export default Routes;
