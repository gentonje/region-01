
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProductValidity = (productId: string | undefined) => {
  return useQuery({
    queryKey: ["product-validity", productId],
    queryFn: async () => {
      if (!productId) return null;
      
      const { data, error } = await supabase
        .from("products")
        .select("expires_at, validity_period")
        .eq("id", productId)
        .single();
        
      if (error) throw error;
      
      // Calculate days remaining
      if (data.expires_at) {
        const expiresAt = new Date(data.expires_at);
        const now = new Date();
        const diffTime = expiresAt.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
          ...data,
          daysRemaining: Math.max(0, diffDays)
        };
      }
      
      return data;
    },
    enabled: !!productId
  });
};

// This can be used in a supabase edge function with cron scheduling to check and unpublish expired products
export const checkExpiredProducts = async () => {
  const now = new Date().toISOString();
  
  // Find all published products that have expired
  const { data, error } = await supabase
    .from("products")
    .select("id")
    .eq("product_status", "published")
    .lt("expires_at", now);
    
  if (error) {
    console.error("Error checking expired products:", error);
    return;
  }
  
  if (data.length > 0) {
    // Update status of expired products to unpublished
    const productIds = data.map(product => product.id);
    const { error: updateError } = await supabase
      .from("products")
      .update({ product_status: "draft" })
      .in("id", productIds);
      
    if (updateError) {
      console.error("Error unpublishing expired products:", updateError);
    } else {
      console.log(`Unpublished ${data.length} expired products`);
    }
  }
};
