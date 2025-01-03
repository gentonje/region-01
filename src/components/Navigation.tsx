import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Settings, DollarSign, Moon, Sun, Smartphone, Tablet, Monitor, Users } from "lucide-react";
import { useTheme } from "next-themes";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export const Navigation = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-calligraphy font-bold">
            <span className="text-vivo-orange">Vivo</span>
            <span className="text-navy-blue dark:text-white">Shop</span>
          </Link>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <Settings className="mr-2 h-4 w-4" />
                    Manage
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-64 p-4 origin-top-left transition-all duration-200 ease-in-out">
                      <Link
                        to="/add-product"
                        className="block px-4 py-2 text-sm hover:bg-accent rounded-md"
                      >
                        <Settings className="mr-2 h-4 w-4 inline-block" />
                        Add Product
                      </Link>
                      <Link
                        to="/modify-products"
                        className="block px-4 py-2 text-sm hover:bg-accent rounded-md"
                      >
                        <Settings className="mr-2 h-4 w-4 inline-block" />
                        Modify Products
                      </Link>
                      <Link
                        to="/admin/users"
                        className="block px-4 py-2 text-sm hover:bg-accent rounded-md"
                      >
                        <Users className="mr-2 h-4 w-4 inline-block" />
                        Manage Users
                      </Link>
                      <Link
                        to="/revenue"
                        className="block px-4 py-2 text-sm hover:bg-accent rounded-md"
                      >
                        <DollarSign className="mr-2 h-4 w-4 inline-block" />
                        Revenue
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
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