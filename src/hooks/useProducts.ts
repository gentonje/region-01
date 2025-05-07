
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product, ProductCategory } from "@/types/product";
import { useMemo } from "react";

interface UseProductsProps {
  searchQuery: string;
  selectedCategory: string;
  selectedRegion?: string;
  selectedCountry?: string;
  sortOrder: string;
  showOnlyPublished?: boolean;
  userOnly?: boolean;
  limit?: number;
}

export const useProducts = ({ 
  searchQuery, 
  selectedCategory, 
  selectedRegion = "all",
  selectedCountry = "1", // Default to Kenya (id: 1)
  sortOrder,
  showOnlyPublished = false,
  userOnly = false,
  limit = 10
}: UseProductsProps) => {
  const queryClient = useQueryClient();

  // Memoize the queryKey to prevent unnecessary re-renders
  const queryKey = useMemo(() => 
    ["products", searchQuery, selectedCategory, selectedRegion, selectedCountry, sortOrder, showOnlyPublished, userOnly],
    [searchQuery, selectedCategory, selectedRegion, selectedCountry, sortOrder, showOnlyPublished, userOnly]
  );

  const fetchProducts = async ({ pageParam = 0 }) => {
    const startRange = Number(pageParam) * limit;
    const endRange = startRange + (limit - 1);

    // Build query with optimized filters
    let query = supabase
      .from("products")
      .select("*, product_images(*), profiles:user_id(username, full_name, avatar_url)")
      .range(startRange, endRange);

    // Apply filters only when needed
    if (searchQuery) {
      query = query.ilike("title", `%${searchQuery}%`);
    }

    if (selectedCategory !== "all") {
      query = query.eq("category", selectedCategory as ProductCategory);
    }

    if (selectedRegion && selectedRegion !== "all") {
      query = query.eq("county", selectedRegion);
    }

    // Filter by country_id
    if (selectedCountry && selectedCountry !== "all") {
      query = query.eq("country_id", selectedCountry);
    }

    if (showOnlyPublished) {
      query = query.eq('product_status', 'published');
    }

    if (userOnly) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        query = query.eq('user_id', user.id);
      }
    }

    // Optimize sorting
    if (sortOrder === "asc") {
      query = query.order('price', { ascending: true });
    } else if (sortOrder === "desc") {
      query = query.order('price', { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching products:", error);
      throw error;
    }

    // Use consistent type casting approach
    return data as any[] as Product[];
  };

  const result = useInfiniteQuery({
    queryKey,
    queryFn: fetchProducts,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length < limit ? undefined : allPages.length;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10,   // Garbage collect after 10 minutes
  });

  // Prefetch next page if we have data
  const prefetchNextPage = async () => {
    if (result.data && !result.isFetchingNextPage && result.hasNextPage) {
      const nextPageParam = result.data.pages.length;
      await queryClient.prefetchInfiniteQuery({
        queryKey,
        queryFn: fetchProducts,
        initialPageParam: 0,
      });
    }
  };

  return {
    ...result,
    prefetchNextPage,
  };
};
