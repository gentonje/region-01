
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut, Users, Shield, PenTool, Plus, LogIn, Heart, UserCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserMenuProps {
  userName: string;
  onLogout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const UserMenu = ({ userName, onLogout, isLoading, isAuthenticated }: UserMenuProps) => {
  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      const { data, error } = await supabase.rpc('is_admin', {
        user_id: user.id
      });
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      return data;
    },
    enabled: isAuthenticated
  });

  const { data: isSuperAdmin } = useQuery({
    queryKey: ["isSuperAdmin"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      const { data, error } = await supabase.rpc('is_super_admin', {
        user_id: user.id
      });
      
      if (error) {
        console.error('Error checking super admin status:', error);
        return false;
      }
      
      return data;
    },
    enabled: isAuthenticated
  });

  if (isLoading) {
    return <Button variant="ghost" size="icon" disabled />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-all duration-300"
        >
          <User className="h-4 w-4 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="backdrop-blur-sm bg-background/95">
        <DropdownMenuLabel>{isAuthenticated ? userName : "Visitor"}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAuthenticated ? (
          <>
            <DropdownMenuItem asChild>
              <Link to="/add-product" className="cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/modify-products" className="cursor-pointer">
                <PenTool className="mr-2 h-4 w-4" />
                My Products
              </Link>
            </DropdownMenuItem>
            {(isAdmin || isSuperAdmin) && (
              <DropdownMenuItem asChild>
                <Link to="/admin/products" className="cursor-pointer">
                  <UserCheck className="mr-2 h-4 w-4" />
                  All Products
                </Link>
              </DropdownMenuItem>
            )}
            {!isAdmin && (
              <DropdownMenuItem asChild>
                <Link to="/wishlist" className="cursor-pointer">
                  <Heart className="mr-2 h-4 w-4" />
                  Wishlist
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link to="/edit-profile" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem asChild>
                <Link to="/admin/users" className="cursor-pointer">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Link>
              </DropdownMenuItem>
            )}
            {isSuperAdmin && (
              <DropdownMenuItem asChild>
                <Link to="/admin/manage" className="cursor-pointer">
                  <Shield className="mr-2 h-4 w-4" />
                  Manage Admins
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem asChild>
            <Link to="/login" className="cursor-pointer">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
