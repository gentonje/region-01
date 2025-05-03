
import { Link, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";
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
  selectedCurrency = "USD",
  onCurrencyChange
}: BottomNavProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const isActive = (path: string) => location.pathname === path;

  // Don't render BottomNav on login page or if not authenticated
  if (!isAuthenticated || location.pathname === '/login') {
    return null;
  }

  // Only display on mobile devices
  if (!isMobile) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-14 bg-background/80 backdrop-blur-lg border-t border-border">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto">
        <Link 
          to="/wishlist" 
          className={cn(
            "flex items-center justify-center px-2 hover:bg-accent group transition-all duration-300",
            "relative backdrop-blur-sm bg-white/10 hover:bg-white/20 flex-1 h-full",
            isActive("/wishlist") && "text-orange-500 bg-white/20"
          )}
          aria-label="Wishlist"
        >
          <Heart className={cn(
            "w-6 h-6 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]",
            isActive("/wishlist") ? "fill-orange-500" : ""
          )} />
        </Link>
      </div>
    </nav>
  );
};
