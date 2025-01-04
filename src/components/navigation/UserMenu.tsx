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

interface UserMenuProps {
  userName: string;
  onLogout: () => Promise<void>;
  isLoading?: boolean;
}

export const UserMenu = ({ userName, onLogout, isLoading }: UserMenuProps) => {
  const menuItems = [
    { icon: UserCog, label: "Edit Profile", path: "/edit-profile" },
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
          {isLoading ? (
            <Skeleton className="h-4 w-[200px]" />
          ) : userName ? (
            <p className="text-sm text-muted-foreground text-left">
              Logged in as {userName}
            </p>
          ) : null}
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