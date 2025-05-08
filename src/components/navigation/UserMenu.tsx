import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const UserMenu = () => {
  const { signOut, user } = useAuth();

  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase.rpc("is_admin", {
        user_id: user.id,
      });
      if (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
      return data;
    },
  });

  const { data: isSuperAdmin } = useQuery({
    queryKey: ["isSuperAdmin"],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase.rpc("is_super_admin", {
        user_id: user.id,
      });
      if (error) {
        console.error("Error checking super admin status:", error);
        return false;
      }
      return data;
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={user?.user_metadata?.avatar_url as string} />
          <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/my-shop">My Shop</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut()}>Sign out</DropdownMenuItem>

          {/* Admin Section */}
          {(isAdmin || isSuperAdmin) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Admin</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to="/admin/users">User Management</Link>
              </DropdownMenuItem>
              {isSuperAdmin && (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/districts">Districts Management</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/categories">Categories Management</Link>
                  </DropdownMenuItem>
                </>
              )}
            </>
          )}
          
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
