import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { SupportedCurrency, convertCurrency } from "@/utils/currencyConverter";
import { toast } from "sonner";

export const useProductDetail = (product: Product, selectedCurrency: SupportedCurrency = "USD") => {
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [convertedPrice, setConvertedPrice] = useState<number>(product.price || 0);
  const [activeTab, setActiveTab] = useState("details");
  
  const queryClient = useQueryClient();

  // Set the selected image whenever the product changes
  useEffect(() => {
    // Reset the selected image when product changes
    const mainImagePath = product.product_images?.find(img => img.is_main)?.storage_path || 
      product.product_images?.[0]?.storage_path || '';
    setSelectedImage(mainImagePath);
  }, [product.id, product.product_images]);

  useEffect(() => {
    const updatePrice = async () => {
      try {
        // If selected currency is SSP, use the exact database price
        if (selectedCurrency === "SSP") {
          setConvertedPrice(product.price || 0);
          return;
        }
        
        // Otherwise convert from SSP to the selected currency
        const converted = await convertCurrency(
          product.price || 0,
          (product.currency || "SSP") as SupportedCurrency,
          selectedCurrency
        );
        setConvertedPrice(converted);
      } catch (error) {
        console.error("Error converting price:", error);
        setConvertedPrice(product.price || 0);
      }
    };
    updatePrice();
  }, [product.price, product.currency, selectedCurrency]);

  const { data: similarProducts } = useQuery({
    queryKey: ['similar-products', product.id, product.category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .eq('category', product.category)
        .neq('id', product.id)
        .limit(4);
      
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!product.category,
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to add items to cart');

      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: product.id,
          quantity: 1,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
      toast.success('Added to cart successfully');
    },
    onError: (error) => {
      console.error('Error adding to cart:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to add to cart');
      }
    },
  });

  const handleAddToCart = () => {
    if (!product.in_stock) {
      toast.error('This product is out of stock');
      return;
    }
    addToCartMutation.mutate();
  };

  // Track product view while handling potential conflicts
  useEffect(() => {
    const trackProductView = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error } = await supabase.from('product_views').insert({
          product_id: product.id,
          viewer_id: user?.id || null,
        });

        // Conflict errors (409) are expected when the unique constraint is violated
        // This happens if the user views the same product multiple times in a day
        // We can safely ignore this specific error
        if (error && error.code !== '23505' && error.code !== '409') {
          console.error('Error tracking product view:', error);
        }
      } catch (error) {
        // Silent fail for view tracking as it's not critical
        console.warn('Error tracking product view:', error);
      }
    };

    if (product.id) {
      trackProductView();
    }
  }, [product.id]);

  return {
    selectedImage,
    setSelectedImage,
    convertedPrice,
    activeTab,
    setActiveTab,
    similarProducts,
    addToCartMutation,
    handleAddToCart
  };
};
