
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateQueryKey } from "@/utils/queryUtils";

export function useWishlistCount() {
  const { data: wishlistCount = 0, isLoading } = useQuery({
    queryKey: generateQueryKey("wishlist_count", {}),
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return 0;

      try {
        // First get the user's wishlist id
        const { data: userWishlist, error: wishlistError } = await supabase
          .from("wishlists")
          .select("id")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (wishlistError || !userWishlist) {
          console.log("No wishlist found or error:", wishlistError);
          return 0;
        }

        // Then count items in the wishlist
        const { count, error: countError } = await supabase
          .from("wishlist_items")
          .select("id", { count: "exact" })
          .eq("wishlist_id", userWishlist.id);

        if (countError) {
          console.error("Error counting wishlist items:", countError);
          return 0;
        }

        return count || 0;
      } catch (err) {
        console.error("Failed to fetch wishlist count:", err);
        return 0;
      }
    },
    staleTime: 1000 * 15, // 15 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    wishlistCount,
    isLoading
  };
}
