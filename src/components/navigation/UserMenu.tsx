
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
import { User, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { AccountTypeBadge } from "./AccountTypeBadge";
import { toast } from "sonner";
import { AccountType } from "@/types/profile";

export const UserMenu = () => {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { theme, setTheme } = useTheme();

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

  // Get user's avatar URL and account type
  const { data: profile } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("avatar_url, username, full_name, account_type")
          .eq("id", user.id)
          .single();
        
        if (error) {
          console.error("Error fetching profile:", error);
          toast.error("Failed to load user profile");
          return {
            avatar_url: null,
            username: null,
            full_name: null,
            account_type: "basic" as const
          };
        }

        return {
          ...data,
          account_type: (data.account_type || 'basic') as AccountType
        };
      } catch (err) {
        console.error("Error in profile query:", err);
        return {
          avatar_url: null,
          username: null,
          full_name: null,
          account_type: "basic" as AccountType
        };
      }
    },
    enabled: !!user,
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const displayName = profile?.full_name || profile?.username || user?.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full overflow-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none">
          <Avatar>
            <AvatarImage
              src={profile?.avatar_url || ""}
              alt={displayName || "User"}
            />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center justify-between px-2">
          <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
          {profile?.account_type && <AccountTypeBadge accountType={profile.account_type as AccountType} />}
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
          {theme === "dark" ? (
            <div className="flex items-center w-full">
              <Sun className="mr-2 h-4 w-4" />
              <span>Light Mode</span>
            </div>
          ) : (
            <div className="flex items-center w-full">
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark Mode</span>
            </div>
          )}
        </DropdownMenuItem>
        
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
              <Link to="/admin/accounts">Account Management</Link>
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
