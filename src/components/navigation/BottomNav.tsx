
import { Link, useLocation } from "react-router-dom";
import { Home, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  isAuthenticated: boolean;
}

export const BottomNav = ({ isAuthenticated }: BottomNavProps) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-14 bg-background/50 backdrop-blur-sm border-t border-border">
      <div className="grid h-full max-w-lg grid-cols-2 mx-auto">
        <Link
          to="/"
          className={cn(
            "inline-flex flex-col items-center justify-center px-5 hover:bg-accent group transition-all duration-300",
            "before:absolute before:inset-0 before:rounded-lg before:bg-white/5 before:opacity-0 hover:before:opacity-100",
            "relative backdrop-blur-sm bg-white/10 hover:bg-white/20",
            isActive("/") && "text-orange-500 bg-white/20"
          )}
        >
          <Home className="w-5 h-5 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
          <span className="text-xs">Home</span>
        </Link>

        {isAuthenticated && (
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
        )}
      </div>
    </nav>
  );
};
