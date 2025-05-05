
import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { SupportedCurrency, convertCurrency } from "@/utils/currencyConverter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCartMutations } from "./useCartMutations";

export const useProductDetail = (
  product: Product,
  selectedCurrency: SupportedCurrency = "USD"
) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(
    product.product_images?.[0]?.storage_path || null
  );
  const [activeTab, setActiveTab] = useState("details");
  
  const { addItemMutation } = useCartMutations();
  const queryClient = useQueryClient();

  // Convert price to selected currency - ensure this returns a number, not a Promise
  const convertedPrice = convertCurrency(
    product.price || 0,
    product.currency || "SSP",
    selectedCurrency
  );

  // Fetch similar products by category
  const { data: similarProducts = [] } = useQuery({
    queryKey: ["similarProducts", product.category, product.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("category", product.category)
        .neq("id", product.id)
        .eq("product_status", "published")
        .limit(6);
      return data || [];
    },
  });

  // Increment view count mutation
  const incrementViewCountMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { data, error } = await supabase.rpc('increment_product_view', {
        product_id: productId
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate product queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', product.id] });
    },
  });

  // Increment view count when product detail is opened
  useEffect(() => {
    if (product.id) {
      incrementViewCountMutation.mutate(product.id);
    }
  }, [product.id, incrementViewCountMutation]);

  // Add to cart handler
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.in_stock) {
      addItemMutation.mutate({ productId: product.id });
    }
  };

  return {
    selectedImage,
    setSelectedImage,
    convertedPrice,
    activeTab,
    setActiveTab,
    similarProducts,
    handleAddToCart,
    addToCartMutation: addItemMutation,
  };
};
