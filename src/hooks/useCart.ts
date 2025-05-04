
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
          product:products(*)
        `)
        .eq("user_id", user.user.id);

      if (error) {
        console.error("Error fetching cart items:", error);
        throw error;
      }
      
      // Log the raw data from Supabase to help debug
      console.log("Raw cart data from Supabase:", data);
      
      // Transform the data to match CartItemType
      const transformedData: CartItemType[] = data?.map(item => {
        console.log("Processing cart item:", item);
        
        // Create a default product object with the required structure
        const defaultProduct = { 
          id: "", 
          title: "Product Not Found", 
          price: 0, 
          currency: "SSP", 
          in_stock: false, 
          user_id: "" 
        };
        
        // Handle the product object properly based on what we get from Supabase
        let productData = item.product;
        
        // If product is null or undefined, use the default product
        if (!productData) {
          productData = defaultProduct;
        }
        // If product is an array (from one-to-many relation), take the first item
        else if (Array.isArray(productData)) {
          productData = productData.length > 0 ? productData[0] : defaultProduct;
        }
        
        // Ensure the product has the correct type structure
        const product = {
          id: productData.id || "",
          title: productData.title || "Unnamed Product",
          price: typeof productData.price === 'number' ? productData.price : 0,
          currency: productData.currency || "SSP",
          in_stock: !!productData.in_stock,
          user_id: productData.user_id || ""
        };
        
        return {
          id: item.id,
          quantity: item.quantity,
          product_id: item.product_id,
          product
        };
      }) || [];
      
      console.log("Transformed cart data:", transformedData);
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
