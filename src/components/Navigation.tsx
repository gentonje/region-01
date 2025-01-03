import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Settings, DollarSign, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
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
          <Link to="/" className="text-xl font-calligraphy">
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
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-sm border-t border-border md:hidden">
      <div className="grid grid-cols-1 h-16">
        <Link to="/add-product" className="flex items-center justify-center">
          <Button variant="ghost" size="sm">
            Manage Products
          </Button>
        </Link>
      </div>
    </div>
  );
};