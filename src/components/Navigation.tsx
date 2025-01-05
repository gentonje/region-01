import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { toast } from "sonner";
import { CartIndicator } from "./navigation/CartIndicator";
import { UserMenu } from "./navigation/UserMenu";
import { Logo } from "./navigation/Logo";
import { CurrencySelector } from "./navigation/CurrencySelector";
import { ThemeToggle } from "./navigation/ThemeToggle";
import { BottomNav } from "./navigation/BottomNav";

interface NavigationProps {
  onCurrencyChange?: (currency: SupportedCurrency) => void;
}

export const Navigation = ({ onCurrencyChange }: NavigationProps) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [currency, setCurrency] = useState<SupportedCurrency>("SSP");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Error fetching user:", userError);
          setError("Could not fetch user details");
          setIsAuthenticated(false);
          return;
        }

        if (!user) {
          setUserName("");
          setIsAuthenticated(false);
          return;
        }

        setIsAuthenticated(true);

        try {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .maybeSingle();

          if (profileError) {
            console.error("Error fetching profile:", profileError);
            toast.error("Could not fetch profile details. Using email instead.");
            setUserName(user.email || "");
            return;
          }

          setUserName(profile?.full_name || user.email || "");
        } catch (error) {
          console.error("Error in profile fetch:", error);
          toast.error("Network error while fetching profile. Using email instead.");
          setUserName(user.email || "");
        }
      } catch (error) {
        console.error("Error in user fetch:", error);
        setError("Could not fetch user details");
        setIsAuthenticated(false);
        toast.error("Network error. Please check your internet connection.");
      } finally {
        setIsLoading(false);
      }
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  const handleCurrencyChange = (newCurrency: SupportedCurrency) => {
    setCurrency(newCurrency);
    onCurrencyChange?.(newCurrency);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            <Logo />

            <div className="flex items-center gap-2">
              <CurrencySelector 
                onCurrencyChange={onCurrencyChange ? handleCurrencyChange : undefined}
                currency={currency}
              />

              {isAuthenticated && <CartIndicator />}
              
              <ThemeToggle />

              <UserMenu 
                userName={userName} 
                onLogout={handleLogout}
                isLoading={isLoading}
                isAuthenticated={isAuthenticated}
              />
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export { BottomNav as BottomNavigation };