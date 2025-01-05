import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Package, ShoppingCart, User } from "lucide-react";

interface BottomNavProps {
  isAuthenticated: boolean;
}

export const BottomNav = ({ isAuthenticated }: BottomNavProps) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/50 backdrop-blur-sm border-t border-border z-50">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-around py-2">
          <Link
            to="/"
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              isActive("/") ? "text-orange-500" : "text-gray-500 hover:text-orange-500"
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/my-products"
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  isActive("/my-products") ? "text-orange-500" : "text-gray-500 hover:text-orange-500"
                }`}
              >
                <Package className="h-5 w-5" />
                <span className="text-xs mt-1">My Products</span>
              </Link>

              <Link
                to="/cart"
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  isActive("/cart") ? "text-orange-500" : "text-gray-500 hover:text-orange-500"
                }`}
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="text-xs mt-1">Cart</span>
              </Link>

              <div className="flex flex-col items-center p-2 text-green-500">
                <User className="h-5 w-5" />
                <span className="text-xs mt-1">Member</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center p-2 text-gray-500">
              <User className="h-5 w-5" />
              <span className="text-xs mt-1">Visitor</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};