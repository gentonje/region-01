import { Routes as RouterRoutes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Home from "@/pages/Home";
import AddProduct from "@/pages/AddProduct";
import ModifyProducts from "@/pages/ModifyProducts";
import Login from "@/pages/Login";
import EditProfile from "@/pages/EditProfile";
import Cart from "@/pages/Cart";
import EditProduct from "@/pages/EditProduct";
import AdminUsers from "@/pages/AdminUsers";
import { WishlistPage } from "@/pages/Wishlist";
import { PrivateRoute } from "@/components/PrivateRoute";

export const Routes = () => {
  return (
    <>
      <Navigation />
      <RouterRoutes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/add-product"
          element={
            <PrivateRoute>
              <AddProduct />
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
          path="/edit-profile"
          element={
            <PrivateRoute>
              <EditProfile />
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
          path="/edit-product/:id"
          element={
            <PrivateRoute>
              <EditProduct />
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
          path="/wishlist"
          element={
            <PrivateRoute>
              <WishlistPage />
            </PrivateRoute>
          }
        />
      </RouterRoutes>
    </>
  );
};