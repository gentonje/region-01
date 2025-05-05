
import { Link, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWishlistCount } from "@/hooks/useWishlistCount";
import { motion, AnimatePresence } from "framer-motion";

interface BottomNavProps {
  isAuthenticated: boolean;
  shouldShow?: boolean;
}

export const BottomNav = ({
  isAuthenticated,
  shouldShow = true
}: BottomNavProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const isActive = (path: string) => location.pathname === path;
  const { wishlistCount } = useWishlistCount();

  // Don't render BottomNav on login page or if not authenticated
  if (!isAuthenticated || location.pathname === '/login') {
    return null;
  }

  // Only display on mobile devices
  if (!isMobile) {
    return null;
  }

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 z-50 h-14 bg-background/80 backdrop-blur-lg border-t border-border"
      initial={{ translateY: 0 }}
      animate={{ 
        translateY: shouldShow ? 0 : 100 // Hide nav when not scrolling up
      }}
      transition={{ duration: 0.2 }}
    >
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
          <div className="relative">
            <Heart className={cn(
              "w-6 h-6 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]",
              isActive("/wishlist") ? "fill-orange-500" : ""
            )} />
            
            <AnimatePresence>
              {wishlistCount > 0 && (
                <motion.span 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </Link>
      </div>
    </motion.nav>
  );
};
