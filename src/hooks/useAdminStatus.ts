
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useAdminStatus = () => {
  const { session } = useAuth();
  
  // Fetch super admin status
  const { data: isSuperAdmin, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ["isSuperAdmin"],
    queryFn: async () => {
      if (!session?.user) return false;
      
      const { data, error } = await supabase.rpc('is_super_admin', {
        user_id: session.user.id
      });
      
      if (error) {
        console.error('Error checking super admin status:', error);
        return false;
      }
      
      return data;
    },
  });

  return { isSuperAdmin, isCheckingAdmin };
};
