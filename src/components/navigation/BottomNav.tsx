
import { Link, useLocation } from "react-router-dom";
import { Heart, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { SupportedCurrency } from "@/utils/currencyConverter";

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

  // Mobile bottom nav showing only Wishlist and currency converter
  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-14 bg-background/80 backdrop-blur-lg border-t border-border">
        <div className="grid h-full max-w-lg grid-cols-2 mx-auto">
          <Link
            to="/wishlist"
            className={cn(
              "inline-flex flex-col items-center justify-center px-5 hover:bg-accent group transition-all duration-300",
              "before:absolute before:inset-0 before:rounded-lg before:bg-white/5 before:opacity-0 hover:before:opacity-100",
              "relative backdrop-blur-sm bg-white/10 hover:bg-white/20",
              isActive("/wishlist") && "text-orange-500 bg-white/20"
            )}
          >
            <Heart className="w-5 h-5 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
            <span className="text-xs">Wishlist</span>
          </Link>

          {onCurrencyChange && (
            <button
              onClick={() => {
                // Toggle between SSP and USD
                const newCurrency = selectedCurrency === "SSP" ? "USD" : "SSP";
                onCurrencyChange(newCurrency);
              }}
              className={cn(
                "inline-flex flex-col items-center justify-center px-5 hover:bg-accent group transition-all duration-300",
                "before:absolute before:inset-0 before:rounded-lg before:bg-white/5 before:opacity-0 hover:before:opacity-100",
                "relative backdrop-blur-sm bg-white/10 hover:bg-white/20"
              )}
            >
              <DollarSign className="w-5 h-5 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
              <span className="text-xs">{selectedCurrency}</span>
            </button>
          )}
        </div>
      </nav>
    );
  }

  // Desktop bottom nav showing only Wishlist and currency converter button
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-14 bg-background/80 backdrop-blur-lg border-t border-border">
      <div className="grid h-full max-w-lg grid-cols-2 mx-auto">
        <Link
          to="/wishlist"
          className={cn(
            "inline-flex flex-col items-center justify-center px-5 hover:bg-accent group transition-all duration-300",
            "before:absolute before:inset-0 before:rounded-lg before:bg-white/5 before:opacity-0 hover:before:opacity-100",
            "relative backdrop-blur-sm bg-white/10 hover:bg-white/20",
            isActive("/wishlist") && "text-orange-500 bg-white/20"
          )}
        >
          <Heart className="w-5 h-5 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
          <span className="text-xs">Wishlist</span>
        </Link>

        {onCurrencyChange && (
          <button
            onClick={() => {
              const newCurrency = selectedCurrency === "SSP" ? "USD" : "SSP";
              onCurrencyChange(newCurrency);
            }}
            className={cn(
              "inline-flex flex-col items-center justify-center px-5 hover:bg-accent group transition-all duration-300",
              "before:absolute before:inset-0 before:rounded-lg before:bg-white/5 before:opacity-0 hover:before:opacity-100",
              "relative backdrop-blur-sm bg-white/10 hover:bg-white/20"
            )}
          >
            <DollarSign className="w-5 h-5 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
            <span className="text-xs">{selectedCurrency}</span>
          </button>
        )}
      </div>
    </nav>
  );
};

