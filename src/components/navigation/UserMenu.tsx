import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, Users, LogOut } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UserMenuProps {
  userName: string;
  onLogout: () => Promise<void>;
}

export const UserMenu = ({ userName, onLogout }: UserMenuProps) => {
  const menuItems = [
    { icon: Settings, label: "Add Product", path: "/add-product" },
    { icon: Settings, label: "Modify Products", path: "/modify-products" },
    { icon: Users, label: "Manage Users", path: "/admin/users" },
  ];

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
          {userName && (
            <p className="text-sm text-muted-foreground text-left">
              Logged in as {userName}
            </p>
          )}
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-4">
          {menuItems.map((item) => (
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