import { Link, useLocation } from "react-router-dom";
import { Home, Package, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BottomNavProps {
  isAuthenticated: boolean;
}

export const BottomNav = ({ isAuthenticated }: BottomNavProps) => {
  const location = useLocation();

  return (
    <div className="btm-nav bg-background border-t border-border">
      <Link to="/">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex flex-col h-16 w-16",
            location.pathname === "/" && "text-primary"
          )}
        >
          <Home className="h-5 w-5" />
          <span className="btm-nav-label">Home</span>
        </Button>
      </Link>

      {isAuthenticated && (
        <>
          <Link to="/modify-products">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col h-16 w-16",
                location.pathname === "/modify-products" && "text-primary"
              )}
            >
              <Package className="h-5 w-5" />
              <span className="btm-nav-label">Products</span>
            </Button>
          </Link>

          <Link to="/cart">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col h-16 w-16",
                location.pathname === "/cart" && "text-primary"
              )}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="btm-nav-label">Cart</span>
            </Button>
          </Link>
        </>
      )}
    </div>
  );
};