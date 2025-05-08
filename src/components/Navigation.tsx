
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CartIndicator } from "./navigation/CartIndicator";
import UserMenu from "./navigation/UserMenu";
import { CountrySelector } from "./navigation/CountrySelector";
import { ChatBubble } from "./navigation/ChatBubble";
import { NotificationIcon } from "./navigation/NotificationIcon";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useScrollDirection, ScrollDirection } from "@/hooks/useScrollDirection";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavigationProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedCountry?: string;
  onCountryChange?: (country: string) => void;
}

export const Navigation = ({ 
  searchQuery = "", 
  onSearchChange,
  selectedCountry = "1", // Default to Kenya (id: 1)
  onCountryChange = () => {}
}: NavigationProps) => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { scrollDirection, isAtTop } = useScrollDirection();
  
  // Keep top nav visible when at top of page or scrolling up
  const shouldShowNav = scrollDirection === ScrollDirection.UP || isAtTop;

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
      <AnimatePresence>
        <motion.div 
          className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-sm border-b border-border"
          initial={{ translateY: 0 }}
          animate={{ 
            translateY: shouldShowNav ? 0 : -72 // Hide nav when scrolling down
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-14">
              <div className="flex justify-center">
                <CountrySelector 
                  selectedCountry={selectedCountry} 
                  onCountryChange={onCountryChange} 
                />
              </div>

              <div className="flex items-center gap-2">
                {session && (
                  <>
                    <NotificationIcon />
                    <CartIndicator />
                  </>
                )}
                <UserMenu />
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {session && <ChatBubble />}
    </>
  );
};
