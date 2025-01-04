import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Settings, DollarSign, Moon, Sun, Users, LogOut, Menu, Smartphone, Tablet, Monitor, ShoppingCart } from "lucide-react";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { CurrencySelector } from "./CurrencySelector";
import { SupportedCurrency } from "@/utils/currencyConverter";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "./ui/badge";

interface NavigationProps {
  onCurrencyChange?: (currency: SupportedCurrency) => void;
}

export const Navigation = ({ onCurrencyChange }: NavigationProps) => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [currency, setCurrency] = useState<SupportedCurrency>("USD");

  const { data: cartItemsCount = 0 } = useQuery({
    queryKey: ["cartItems", "count"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count } = await supabase
        .from("cart_items")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      return count || 0;
    },
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        
        setUserName(profile?.full_name || user.email || "");
      }
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  const handleCurrencyChange = (newCurrency: SupportedCurrency) => {
    setCurrency(newCurrency);
    onCurrencyChange?.(newCurrency);
  };

  const menuItems = [
    { icon: Settings, label: "Add Product", path: "/add-product" },
    { icon: Settings, label: "Modify Products", path: "/modify-products" },
    { icon: Users, label: "Manage Users", path: "/admin/users" },
    { icon: DollarSign, label: "Revenue", path: "/revenue" },
  ];

  return (
    <div className="md:hidden">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-calligraphy font-bold">
              <span className="text-vivo-orange">Vivo</span>
              <span className="text-navy-blue">Shop</span>
            </Link>

            <div className="flex items-center gap-4">
              {onCurrencyChange && (
                <CurrencySelector value={currency} onValueChange={handleCurrencyChange} />
              )}

              <Link to="/cart" className="relative">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {cartItemsCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

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
                      onClick={handleLogout}
                      className="flex items-center px-4 py-2 text-sm rounded-md hover:bg-accent transition-colors text-red-600"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Log Out
                    </button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BottomNavigation = () => {
  const getDeviceIcon = () => {
    if (window.innerWidth < 640) return <Smartphone className="w-4 h-4 mr-2" />;
    if (window.innerWidth < 768) return <Tablet className="w-4 h-4 mr-2" />;
    return <Monitor className="w-4 h-4 mr-2" />;
  };

  const getDeviceText = () => {
    if (window.innerWidth < 640) return "Mobile";
    if (window.innerWidth < 768) return "Tablet";
    return "Desktop";
  };

  const [deviceInfo, setDeviceInfo] = useState({ icon: getDeviceIcon(), text: getDeviceText() });

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo({
        icon: getDeviceIcon(),
        text: getDeviceText()
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Only render on mobile screens
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-sm border-t border-border md:hidden">
      <div className="grid grid-cols-2 h-16">
        <div className="flex items-center justify-center">
          {deviceInfo.icon}
          <span className="text-sm">{deviceInfo.text}</span>
        </div>
        <Link 
          to="/admin/users" 
          className="flex items-center justify-center hover:bg-accent/50 transition-colors"
        >
          <Users className="w-4 h-4 mr-2" />
          <span className="text-sm">Users</span>
        </Link>
      </div>
    </div>
  );
};
