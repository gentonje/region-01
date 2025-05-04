
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateQueryKey } from "@/utils/queryUtils";

export interface CartItemType {
  id: string;
  quantity: number;
  product_id: string;
  product: {
    id: string;
    title: string;
    price: number;
    currency: string;
    in_stock: boolean;
    user_id: string;
  };
}

export function useCart() {
  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: generateQueryKey("cart", {}),
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not logged in");

      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          id, 
          quantity,
          product_id,
          product:products(
            id, 
            title, 
            price, 
            currency,
            in_stock,
            user_id
          )
        `)
        .eq("user_id", user.user.id);

      if (error) throw error;
      
      // Transform the data to match CartItemType
      const transformedData: CartItemType[] = data?.map(item => ({
        ...item,
        product: Array.isArray(item.product) && item.product.length > 0 
          ? item.product[0] 
          : { 
              id: "", 
              title: "", 
              price: 0, 
              currency: "SSP", 
              in_stock: false, 
              user_id: "" 
            }
      })) || [];
      
      return transformedData;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Calculate total amount ensuring all items are valid
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  return {
    cartItems,
    isLoading,
    totalAmount,
  };
}
