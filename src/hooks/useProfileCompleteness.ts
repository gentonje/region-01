
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Profile } from "@/types/profile";

export function useProfileCompleteness() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setProfile(data as Profile);
        
        // Check if profile has required fields
        const hasRequiredFields = !!(
          data?.username && 
          data?.full_name
        );
        
        setIsComplete(hasRequiredFields);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setIsComplete(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return {
    profile,
    isProfileComplete: isComplete,
    isLoading,
    requiredFields: {
      username: profile?.username ? true : false,
      fullName: profile?.full_name ? true : false,
    }
  };
}
