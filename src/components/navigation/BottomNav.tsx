
import { Link, useLocation } from "react-router-dom";
import { Heart, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { Toggle } from "../ui/toggle";

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

  const handleCurrencyToggle = () => {
    if (onCurrencyChange) {
      onCurrencyChange(selectedCurrency === "SSP" ? "USD" : "SSP");
    }
  };

  // Don't render BottomNav on login page or if not authenticated
  if (!isAuthenticated || location.pathname === '/login') {
    return null;
  }

  // Mobile bottom nav
  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-14 bg-background/80 backdrop-blur-lg border-t border-border">
        {/* Both buttons are now within the same div instead of being in grid cells */}
        <div className="flex justify-around items-center h-full max-w-lg mx-auto">
          <Link 
            to="/wishlist" 
            className={cn(
              "flex flex-col items-center justify-center px-5 hover:bg-accent group transition-all duration-300",
              "relative backdrop-blur-sm bg-white/10 hover:bg-white/20 flex-1 h-full",
              isActive("/wishlist") && "text-orange-500 bg-white/20"
            )}
          >
            <Heart className="w-5 h-5 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
            <span className="text-xs">Wishlist</span>
          </Link>

          <Toggle
            pressed={selectedCurrency === "USD"}
            onPressedChange={handleCurrencyToggle}
            className={cn(
              "flex flex-col items-center justify-center px-5 hover:bg-accent group transition-all duration-300",
              "relative backdrop-blur-sm bg-white/10 hover:bg-white/20 flex-1 h-full"
            )}
          >
            <DollarSign className="w-5 h-5 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
            <span className="text-xs">{selectedCurrency}</span>
          </Toggle>
        </div>
      </nav>
    );
  }

  // Desktop bottom nav
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-14 bg-background/80 backdrop-blur-lg border-t border-border">
      {/* Same structure for desktop */}
      <div className="flex justify-around items-center h-full max-w-lg mx-auto">
        <Link 
          to="/wishlist" 
          className={cn(
            "flex flex-col items-center justify-center px-5 hover:bg-accent group transition-all duration-300",
            "relative backdrop-blur-sm bg-white/10 hover:bg-white/20 flex-1 h-full",
            isActive("/wishlist") && "text-orange-500 bg-white/20"
          )}
        >
          <Heart className="w-5 h-5 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
          <span className="text-xs">Wishlist</span>
        </Link>

        <Toggle
          pressed={selectedCurrency === "USD"}
          onPressedChange={handleCurrencyToggle}
          className={cn(
            "flex flex-col items-center justify-center px-5 hover:bg-accent group transition-all duration-300",
            "relative backdrop-blur-sm bg-white/10 hover:bg-white/20 flex-1 h-full"
          )}
        >
          <DollarSign className="w-5 h-5 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
          <span className="text-xs">{selectedCurrency}</span>
        </Toggle>
      </div>
    </nav>
  );
};

