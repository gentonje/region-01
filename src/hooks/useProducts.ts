import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";

interface UseProductsProps {
  searchQuery: string;
  selectedCategory: string;
  priceRange: { min: number; max: number };
  sortOrder: string;
}

export const useProducts = ({ 
  searchQuery, 
  selectedCategory, 
  priceRange, 
  sortOrder 
}: UseProductsProps) => {
  return useInfiniteQuery({
    queryKey: ["products", searchQuery, selectedCategory, priceRange, sortOrder],
    queryFn: async ({ pageParam = 0 }) => {
      const startRange = Number(pageParam) * 10;
      const endRange = startRange + 9;

      let query = supabase
        .from("products")
        .select("*, product_images(*)")
        .range(startRange, endRange);

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      if (priceRange.min > 0) {
        query = query.gte('price', priceRange.min);
      }
      if (priceRange.max < 1000) {
        query = query.lte('price', priceRange.max);
      }

      if (sortOrder === "asc") {
        query = query.order('price', { ascending: true });
      } else if (sortOrder === "desc") {
        query = query.order('price', { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data: products, error } = await query;

      if (error) throw error;
      return products as Product[];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < 10) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
  });
};