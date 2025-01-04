import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, Users, LogOut, UserCog } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserMenuProps {
  userName: string;
  onLogout: () => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export const UserMenu = ({ userName, onLogout, isLoading, error }: UserMenuProps) => {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("user_type, onboarding_completed")
        .eq("id", user.id)
        .single();
        
      if (error) throw error;
      return data;
    }
  });

  const menuItems = [
    { icon: UserCog, label: "Edit Profile", path: "/edit-profile", alwaysShow: true },
    { 
      icon: Settings, 
      label: "Add Product", 
      path: "/add-product", 
      alwaysShow: true 
    },
    { 
      icon: Settings, 
      label: "Modify Products", 
      path: "/modify-products", 
      alwaysShow: false,
      showWhen: profile?.user_type === 'seller' && profile?.onboarding_completed 
    },
    { 
      icon: Users, 
      label: "Manage Users", 
      path: "/admin/users", 
      alwaysShow: false,
      showWhen: profile?.user_type === 'seller' && profile?.onboarding_completed 
    },
  ];

  const visibleMenuItems = menuItems.filter(item => 
    item.alwaysShow || item.showWhen
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-left">Menu</SheetTitle>
          {isLoading ? (
            <Skeleton className="h-4 w-[200px]" />
          ) : error ? (
            <p className="text-sm text-destructive text-left">{error}</p>
          ) : userName ? (
            <p className="text-sm text-muted-foreground text-left">
              Logged in as {userName}
            </p>
          ) : null}
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-4">
          {visibleMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center px-4 py-2 text-sm rounded-md hover:bg-accent transition-colors"
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <div className="h-px bg-border my-2" />
          <button
            onClick={onLogout}
            className="flex items-center px-4 py-2 text-sm rounded-md hover:bg-accent transition-colors text-red-600"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Log Out
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};