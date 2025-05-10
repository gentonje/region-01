
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ProductValidity {
  expires_at?: string | null;
  validity_period?: 'day' | 'week' | 'month' | null;
  daysRemaining?: number;
  title?: string;
  product_id?: string;
}

export const useProductValidity = (productId: string | undefined) => {
  return useQuery({
    queryKey: ["product-validity", productId],
    queryFn: async () => {
      if (!productId) return null;
      
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, title, expires_at, validity_period")
          .eq("id", productId)
          .single();
          
        if (error) {
          console.error("Error fetching product validity:", error);
          return { daysRemaining: 0 } as ProductValidity;
        }
        
        // Calculate days remaining
        if (data && data.expires_at) {
          const expiresAt = new Date(data.expires_at);
          const now = new Date();
          const diffTime = expiresAt.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          return {
            expires_at: data.expires_at,
            validity_period: data.validity_period,
            daysRemaining: Math.max(0, diffDays),
            title: data.title,
            product_id: data.id
          } as ProductValidity;
        }
        
        return data as ProductValidity;
      } catch (err) {
        console.error("Error in product validity query:", err);
        return { daysRemaining: 0 } as ProductValidity;
      }
    },
    enabled: !!productId
  });
};

// Hook to monitor product expiration and send notifications
export const useProductExpiryNotifications = () => {
  const { session } = useAuth();
  
  useEffect(() => {
    if (!session?.user) return;
    
    const checkExpiringProducts = async () => {
      try {
        // Get user's products that are published and have expiry dates
        const { data: products, error } = await supabase
          .from("products")
          .select("id, title, expires_at, validity_period")
          .eq("user_id", session.user.id)
          .eq("product_status", "published")
          .not("expires_at", "is", null);
          
        if (error) throw error;
        
        if (!products || products.length === 0) return;
        
        const now = new Date();
        const productsToNotify: {id: string, title: string, daysLeft: number}[] = [];
        
        // Check each product for expiration windows (1, 3, 5 days left)
        products.forEach(product => {
          if (!product.expires_at) return;
          
          const expiresAt = new Date(product.expires_at);
          const diffTime = expiresAt.getTime() - now.getTime();
          const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Only notify for 5, 3, or 1 days remaining
          if ([5, 3, 1].includes(daysLeft)) {
            productsToNotify.push({
              id: product.id,
              title: product.title || "Your product",
              daysLeft
            });
          }
        });
        
        // Create notifications for expiring products - but check if they can be inserted with current type options
        // We'll skip this part for now until the database schema is updated to support the new notification types
        /* 
        for (const product of productsToNotify) {
          // Skip creating notifications until the schema is updated
        }
        */
        
      } catch (err) {
        console.error("Error checking expiring products:", err);
      }
    };
    
    // Check once when component mounts
    checkExpiringProducts();
    
    // Setup interval to check daily
    const interval = setInterval(checkExpiringProducts, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [session]);
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
  
  if (data && data.length > 0) {
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
