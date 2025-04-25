
import { Link, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { CurrencySelector } from "./CurrencySelector";

interface BottomNavProps {
  isAuthenticated: boolean;
  selectedCurrency?: SupportedCurrency;
  onCurrencyChange?: (currency: SupportedCurrency) => void;
}

export const BottomNav = ({
  isAuthenticated,
  selectedCurrency = "SSP",
  onCurrencyChange
}: BottomNavProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const isActive = (path: string) => location.pathname === path;

  // Don't render BottomNav on login page or if not authenticated
  if (!isAuthenticated || location.pathname === '/login') {
    return null;
  }

  // Mobile bottom nav showing Wishlist and Currency Selector
  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-14 bg-background/80 backdrop-blur-lg border-t border-border">
        <div className="grid h-full max-w-lg grid-cols-2 mx-auto">
          <Link 
            to="/wishlist" 
            className={cn(
              "inline-flex flex-col items-center justify-center px-5 hover:bg-accent group transition-all duration-300",
              "relative backdrop-blur-sm bg-white/10 hover:bg-white/20",
              isActive("/wishlist") && "text-orange-500 bg-white/20"
            )}
          >
            <Heart className="w-5 h-5 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
            <span className="text-xs">Wishlist</span>
          </Link>
          <div className="flex items-center justify-center">
            <CurrencySelector 
              onCurrencyChange={onCurrencyChange}
              currency={selectedCurrency}
            />
          </div>
        </div>
      </nav>
    );
  }

  // Desktop bottom nav showing Wishlist and Currency Selector
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-14 bg-background/80 backdrop-blur-lg border-t border-border">
      <div className="grid h-full max-w-lg grid-cols-2 mx-auto">
        <Link 
          to="/wishlist" 
          className={cn(
            "inline-flex flex-col items-center justify-center px-5 hover:bg-accent group transition-all duration-300",
            "relative backdrop-blur-sm bg-white/10 hover:bg-white/20",
            isActive("/wishlist") && "text-orange-500 bg-white/20"
          )}
        >
          <Heart className="w-5 h-5 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
          <span className="text-xs">Wishlist</span>
        </Link>
        <div className="flex items-center justify-center">
          <CurrencySelector 
            onCurrencyChange={onCurrencyChange}
            currency={selectedCurrency}
          />
        </div>
      </div>
    </nav>
  );
};
