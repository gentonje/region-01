
import { useState, useEffect } from "react";
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
  const [open, setOpen] = useState(false);

  const user = session?.user;

  // Check admin status - improved with shorter staleTime
  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data } = await supabase.rpc("is_admin", {
        user_id: user.id,
      });

      return data as boolean;
    },
    enabled: !!user,
    staleTime: 1000 * 30, // 30 seconds instead of 5 minutes
  });

  // Check super admin status - improved with shorter staleTime
  const { data: superAdminStatus } = useQuery({
    queryKey: ["isSuperAdmin", user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data } = await supabase.rpc("is_super_admin", {
        user_id: user.id,
      });

      setIsSuperAdmin(!!data);
      return data as boolean;
    },
    enabled: !!user,
    staleTime: 1000 * 30, // 30 seconds instead of 5 minutes
  });

  // Get user's avatar URL and account type - improved with shorter staleTime and refetchOnMount
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
    staleTime: 1000 * 30, // 30 seconds instead of 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
    setOpen(false);
  };

  const handleMenuItemClick = (callback: () => void) => {
    callback();
    setOpen(false);
  };

  const displayName = profile?.full_name || profile?.username || user?.email;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
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
      <DropdownMenuContent align="end" className="w-56 bg-popover border border-border" sideOffset={5}>
        <div className="flex items-center justify-between px-2">
          <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
          {profile?.account_type && <AccountTypeBadge accountType={profile.account_type as AccountType} />}
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => handleMenuItemClick(toggleTheme)} className="cursor-pointer focus:bg-accent">
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
          <Link to="/edit-profile" onClick={() => setOpen(false)} className="w-full cursor-pointer">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/my-products" onClick={() => setOpen(false)} className="w-full cursor-pointer">My Products</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/wishlist" onClick={() => setOpen(false)} className="w-full cursor-pointer">Wishlist</Link>
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Admin</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to="/admin/users" onClick={() => setOpen(false)} className="w-full cursor-pointer">User Management</Link>
            </DropdownMenuItem>
          </>
        )}
        {isSuperAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/admin/manage" onClick={() => setOpen(false)} className="w-full cursor-pointer">Admin Management</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/accounts" onClick={() => setOpen(false)} className="w-full cursor-pointer">Account Management</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/districts" onClick={() => setOpen(false)} className="w-full cursor-pointer">Districts Management</Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleMenuItemClick(handleSignOut)} className="cursor-pointer focus:bg-accent">
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
