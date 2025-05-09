
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AccountType } from "@/types/profile";

interface User {
  id: string;
  username: string;
  full_name: string;
  account_type: AccountType;
  custom_product_limit: number | null;
}

export const useUserAccounts = (searchQuery: string) => {
  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users", searchQuery],
    queryFn: async () => {
      try {
        let query = supabase
          .from("profiles")
          .select("id, username, full_name, account_type, custom_product_limit")
          .order("username");
        
        if (searchQuery) {
          query = query.ilike("username", `%${searchQuery}%`);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching users:", error);
          toast.error("Failed to load users");
          return [];
        }
        
        // Ensure each user has at least basic properties
        return (data || []).map(user => ({
          id: user.id,
          username: user.username || '',
          full_name: user.full_name || '',
          account_type: (user.account_type as AccountType) || 'basic',
          custom_product_limit: user.custom_product_limit
        })) as User[];
      } catch (err) {
        console.error("Error in users query:", err);
        return [] as User[];
      }
    }
  });

  // Get product counts for each user
  const { data: productCounts = {} } = useQuery({
    queryKey: ["user-product-counts"],
    queryFn: async () => {
      if (!users?.length) return {};
      
      try {
        const counts: Record<string, number> = {};
        
        await Promise.all(
          users.map(async (user) => {
            const { count, error } = await supabase
              .from("products")
              .select("*", { count: 'exact', head: true })
              .eq("user_id", user.id);
              
            if (error) {
              console.error(`Error getting product count for user ${user.id}:`, error);
              counts[user.id] = 0;
            } else {
              counts[user.id] = count || 0;
            }
          })
        );
        
        return counts;
      } catch (err) {
        console.error("Error in product counts query:", err);
        return {};
      }
    },
    enabled: !!users?.length
  });

  return {
    users,
    productCounts,
    isLoading
  };
};
