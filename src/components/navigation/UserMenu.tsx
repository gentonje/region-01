
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
          className="relative backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-all duration-300 m-1"
        >
          <User className="h-4 w-4 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="backdrop-blur-sm bg-background/95 space-y-1">
        <DropdownMenuLabel className="m-1">{isAuthenticated ? userName : "Visitor"}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAuthenticated ? (
          <>
            <DropdownMenuItem asChild className="m-1">
              <Link to="/add-product" className="cursor-pointer space-x-2">
                <Plus className="mr-2 h-4 w-4" />
                <span>Add Product</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="m-1">
              <Link to="/my-products" className="cursor-pointer space-x-2">
                <PenTool className="mr-2 h-4 w-4" />
                <span>My Products</span>
              </Link>
            </DropdownMenuItem>
            {(isAdmin || isSuperAdmin) && (
              <DropdownMenuItem asChild className="m-1">
                <Link to="/products" className="cursor-pointer space-x-2">
                  <UserCheck className="mr-2 h-4 w-4" />
                  <span>All Products</span>
                </Link>
              </DropdownMenuItem>
            )}
            {!isAdmin && (
              <DropdownMenuItem asChild className="m-1">
                <Link to="/wishlist" className="cursor-pointer space-x-2">
                  <Heart className="mr-2 h-4 w-4" />
                  <span>Wishlist</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild className="m-1">
              <Link to="/edit-profile" className="cursor-pointer space-x-2">
                <Settings className="mr-2 h-4 w-4" />
                <span>Edit Profile</span>
              </Link>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem asChild className="m-1">
                <Link to="/admin/users" className="cursor-pointer space-x-2">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Manage Users</span>
                </Link>
              </DropdownMenuItem>
            )}
            {isSuperAdmin && (
              <DropdownMenuItem asChild className="m-1">
                <Link to="/admin/manage" className="cursor-pointer space-x-2">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Manage Admins</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="cursor-pointer m-1 space-x-2">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem asChild className="m-1">
            <Link to="/login" className="cursor-pointer space-x-2">
              <LogIn className="mr-2 h-4 w-4" />
              <span>Login</span>
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
