import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CartIndicator } from "./navigation/CartIndicator";
import { UserMenu } from "./navigation/UserMenu";
import { Logo } from "./navigation/Logo";
import { ThemeToggle } from "./navigation/ThemeToggle";
import { BottomNav } from "./navigation/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

interface NavigationProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const Navigation = ({ searchQuery = "", onSearchChange }: NavigationProps) => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Error fetching user:", userError);
          setError("Could not fetch user details");
          return;
        }

        if (!user) {
          setUserName("");
          return;
        }

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
        toast.error("Network error. Please check your internet connection.");
      } finally {
        setIsLoading(false);
      }
    };

    getUser();
  }, [session]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            <div className="flex justify-center">
              <Logo />
            </div>

            <div className="flex items-center gap-2">
              {session && (
                <>
                  <CartIndicator />
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleLogout}
                    className="hidden md:flex items-center gap-1"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </>
              )}
              <ThemeToggle />
              <UserMenu 
                userName={userName} 
                onLogout={handleLogout}
                isLoading={isLoading}
                isAuthenticated={!!session}
              />
            </div>
          </div>
        </div>
      </div>
      <BottomNav isAuthenticated={!!session} />
    </>
  );
};

// Export BottomNav as BottomNavigation for backward compatibility
export const BottomNavigation = BottomNav;
