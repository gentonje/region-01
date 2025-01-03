import { Link } from "react-router-dom";
import { Home, ShoppingBag, User, Menu, PlusCircle, Settings } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const Navigation = () => {
  return (
    <>
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            <span className="font-bold">Store</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/add-product">
              <Button variant="ghost" size="icon" className="relative">
                <PlusCircle className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/add-product" className="w-full">
                    Add New Product
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/" className="w-full">
                    Manage Products
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <footer className="border-t fixed bottom-0 left-0 right-0 bg-white">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex justify-around">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <Home className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="ghost" size="icon">
                <ShoppingBag className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/add-product">
              <Button variant="ghost" size="icon">
                <PlusCircle className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </nav>
        </div>
      </footer>
    </>
  );
};