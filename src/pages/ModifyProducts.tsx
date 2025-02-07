
import React, { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { ProductListingSection } from "@/components/products/ProductListingSection";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { deleteProduct } from "@/services/productService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ModifyProductsProps {
  userOnly?: boolean;
}

export default function ModifyProducts({ userOnly = true }: ModifyProductsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCurrency] = useState<SupportedCurrency>("SSP");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [sortOrder, setSortOrder] = useState<string>("none");
  const queryClient = useQueryClient();

  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      try {
        const { data: profile, error } = await supabase.rpc('is_admin', {
          user_id: user.id
        });

        if (error) {
          console.error('Error checking admin status:', error);
          return false;
        }

        return profile;
      } catch (error) {
        console.error('Error in admin check:', error);
        return false;
      }
    },
    retry: false
  });

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useProducts({
    searchQuery,
    selectedCategory,
    priceRange,
    sortOrder,
    userOnly: !isAdmin && userOnly, // Only filter by user if not admin and userOnly is true
  });

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      // Invalidate the products query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const allProducts = data?.pages.flat() || [];

  const getProductImageUrl = (product: Product) => {
    if (!product.product_images?.length) return "/placeholder.svg";
    
    const mainImage = product.product_images.find(img => img.is_main) || product.product_images[0];
    if (!mainImage) return "/placeholder.svg";

    return supabase.storage
      .from("images")
      .getPublicUrl(mainImage.storage_path).data.publicUrl;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 mt-8">
        {userOnly ? "My Products" : "All Products"}
      </h1>
      <ProductListingSection
        products={allProducts}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onProductClick={() => {}}
        isFetchingNextPage={isFetchingNextPage}
        observerRef={() => {}}
        selectedCurrency={selectedCurrency}
        onPriceRangeChange={(min, max) => setPriceRange({ min, max })}
        onSortChange={setSortOrder}
        getProductImageUrl={getProductImageUrl}
        showStatus={true}
        onDelete={handleDeleteProduct}
        isAdmin={isAdmin}
      />
    </div>
  );
}
