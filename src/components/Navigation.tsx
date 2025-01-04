import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Moon, Sun, DollarSign } from "lucide-react";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { CurrencySelector } from "./CurrencySelector";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { toast } from "sonner";
import { CartIndicator } from "./navigation/CartIndicator";
import { UserMenu } from "./navigation/UserMenu";
import { BottomNav } from "./navigation/BottomNav";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavigationProps {
  onCurrencyChange?: (currency: SupportedCurrency) => void;
}

export const Navigation = ({ onCurrencyChange }: NavigationProps) => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [currency, setCurrency] = useState<SupportedCurrency>("USD");

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

  return (
    <div className="md:hidden">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            <Link to="/" className="text-lg font-bold" style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}>
              <span style={{ color: '#F97316' }}>السوق</span>
              <span style={{ color: '#0EA5E9' }}> الحر</span>
            </Link>

            <div className="flex items-center gap-2">
              {onCurrencyChange && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCurrencyChange(currency === "USD" ? "SSP" : "USD")}
                      >
                        <DollarSign className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Toggle Currency ({currency})</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <CartIndicator />
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              <UserMenu userName={userName} onLogout={handleLogout} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { BottomNav as BottomNavigation };