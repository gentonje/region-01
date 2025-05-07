
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const UserMenu = () => {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const user = session?.user;

  // Check admin status
  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!user) return false;

      const { data } = await supabase.rpc("is_admin", {
        user_id: user.id,
      });

      return data as boolean;
    },
    enabled: !!user,
  });

  // Check super admin status
  const { data: superAdminStatus } = useQuery({
    queryKey: ["isSuperAdmin"],
    queryFn: async () => {
      if (!user) return false;

      const { data } = await supabase.rpc("is_super_admin", {
        user_id: user.id,
      });

      setIsSuperAdmin(!!data);
      return data as boolean;
    },
    enabled: !!user,
  });

  // Get user's avatar URL
  const { data: profile } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data } = await supabase
        .from("profiles")
        .select("avatar_url, username, full_name")
        .eq("id", user.id)
        .single();

      return data;
    },
    enabled: !!user,
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const displayName = profile?.full_name || profile?.username || user?.email;
  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full overflow-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none">
          <Avatar>
            <AvatarImage
              src={profile?.avatar_url || ""}
              alt={displayName || "User"}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/edit-profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/my-products">My Products</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/wishlist">Wishlist</Link>
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Admin</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to="/admin/users">User Management</Link>
            </DropdownMenuItem>
          </>
        )}
        {isSuperAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/admin/manage">Admin Management</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/districts">Districts Management</Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
