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
import { Package, User, Settings, LogOut, Users, Edit, Plus, LogIn, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CurrencyManager } from "../admin/CurrencyManager";

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

  if (isLoading) {
    return <Button variant="ghost" size="icon" disabled />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <User className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
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
                <Edit className="mr-2 h-4 w-4" />
                Modify Products
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/wishlist" className="cursor-pointer">
                <Heart className="mr-2 h-4 w-4" />
                Wishlist
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/edit-profile" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </DropdownMenuItem>
            {isAdmin && (
              <>
                <DropdownMenuItem asChild>
                  <Link to="/admin/users" className="cursor-pointer">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CurrencyManager />
                </DropdownMenuItem>
              </>
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