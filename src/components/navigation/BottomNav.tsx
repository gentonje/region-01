import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingCart, Settings, Package, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export const BottomNav = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-background/50 backdrop-blur-sm border-t border-border">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
        <Link
          to="/all_products"
          className={cn(
            "inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group transition-colors",
            location.pathname === "/all_products" && "text-primary"
          )}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">Browse</span>
        </Link>
        
        <Link
          to="/"
          className={cn(
            "inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group transition-colors",
            location.pathname === "/" && "text-primary"
          )}
        >
          <Package className="w-5 h-5" />
          <span className="text-xs">My Products</span>
        </Link>

        <Link
          to="/cart"
          className={cn(
            "inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group transition-colors",
            location.pathname === "/cart" && "text-primary"
          )}
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-xs">Cart</span>
        </Link>

        {isAdmin && (
          <Link
            to="/admin/users"
            className={cn(
              "inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group transition-colors",
              location.pathname === "/admin/users" && "text-primary"
            )}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs">Users</span>
          </Link>
        )}

        <Link
          to="/edit-profile"
          className={cn(
            "inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group transition-colors",
            location.pathname === "/edit-profile" && "text-primary"
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="text-xs">Profile</span>
        </Link>
      </div>
    </nav>
  );
};