
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product, ProductCategory } from "@/types/product";

interface UseProductsProps {
  searchQuery: string;
  selectedCategory: string;
  sortOrder: string;
  showOnlyPublished?: boolean;
  userOnly?: boolean;
}

export const useProducts = ({ 
  searchQuery, 
  selectedCategory, 
  sortOrder,
  showOnlyPublished = false,
  userOnly = false
}: UseProductsProps) => {
  return useInfiniteQuery({
    queryKey: ["products", searchQuery, selectedCategory, sortOrder, showOnlyPublished, userOnly],
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
        query = query.eq("category", selectedCategory as ProductCategory);
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
