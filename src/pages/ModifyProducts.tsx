
import React, { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { ModifyProductsList } from "@/components/ModifyProductsList";
import { Product } from "@/types/product";
import { deleteProduct } from "@/services/productService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ModifyProductsProps {
  userOnly?: boolean;
}

export default function ModifyProducts({ userOnly = true }: ModifyProductsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState<string>("none");
  const queryClient = useQueryClient();

  // Check if user is admin
  const { data: isAdmin, isLoading: isAdminLoading } = useQuery({
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
    error
  } = useProducts({
    searchQuery,
    selectedCategory,
    sortOrder,
    userOnly: !isAdmin && userOnly,
  });

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          Error loading products. Please try again later.
        </div>
      </div>
    );
  }

  const allProducts = data?.pages.flat() || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 mt-8">
        {userOnly ? "My Products" : "All Products"}
      </h1>
      
      <ModifyProductsList
        products={allProducts}
        isLoading={isLoading || isAdminLoading}
        hasMore={!!hasNextPage}
        onLoadMore={handleLoadMore}
        onDelete={handleDeleteProduct}
      />
    </div>
  );
};
