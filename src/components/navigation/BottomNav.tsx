import { Link, useLocation } from "react-router-dom";
import { Home, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { CurrencySelector } from "@/components/CurrencySelector";
import { SupportedCurrency } from "@/utils/currencyConverter";

interface BottomNavProps {
  isAuthenticated: boolean;
}

export const BottomNav = ({ isAuthenticated }: BottomNavProps) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleCurrencyChange = (currency: SupportedCurrency) => {
    console.log("Currency changed to:", currency);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-14 bg-background/50 backdrop-blur-sm border-t border-border">
      <div className="grid h-full max-w-lg grid-cols-3 mx-auto">
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
            <div className="inline-flex flex-col items-center justify-center px-5">
              <CurrencySelector 
                value="SSP"
                onValueChange={handleCurrencyChange}
              />
            </div>
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