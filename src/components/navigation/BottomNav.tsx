import { Link, useLocation } from "react-router-dom";
import { Home, Package, ShoppingCart, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  isAuthenticated: boolean;
}

export const BottomNav = ({ isAuthenticated }: BottomNavProps) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-background/50 backdrop-blur-sm border-t border-border">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto">
        <Link
          to="/"
          className={cn(
            "inline-flex flex-col items-center justify-center px-5 hover:bg-accent group",
            isActive("/") && "text-orange-500"
          )}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">Home</span>
        </Link>
        {isAuthenticated && (
          <>
            <Link
              to="/products"
              className={cn(
                "inline-flex flex-col items-center justify-center px-5 hover:bg-accent group",
                isActive("/products") && "text-orange-500"
              )}
            >
              <Package className="w-5 h-5" />
              <span className="text-xs">Products</span>
            </Link>
            <Link
              to="/cart"
              className={cn(
                "inline-flex flex-col items-center justify-center px-5 hover:bg-accent group",
                isActive("/cart") && "text-orange-500"
              )}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-xs">Cart</span>
            </Link>
            <Link
              to="/wishlist"
              className={cn(
                "inline-flex flex-col items-center justify-center px-5 hover:bg-accent group",
                isActive("/wishlist") && "text-orange-500"
              )}
            >
              <Heart className="w-5 h-5" />
              <span className="text-xs">Wishlist</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};