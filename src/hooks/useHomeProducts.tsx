
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";

export const useSession = () => {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });
};

export const useHomeProducts = (
  searchQuery: string,
  selectedCategory: string,
  session: any,
  PRODUCTS_PER_PAGE: number
) => {
  return useInfiniteQuery({
    queryKey: ["home-products", searchQuery, selectedCategory],
    queryFn: async ({ pageParam = 0 }) => {
      const startRange = Number(pageParam) * (session ? 10 : PRODUCTS_PER_PAGE);
      const endRange = startRange + (session ? 9 : PRODUCTS_PER_PAGE - 1);

      let query = supabase
        .from("products")
        .select("*, product_images(*), profiles(*)")
        .eq('product_status', 'published')
        .range(startRange, endRange)
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      const { data: products, error } = await query;

      if (error) throw error;
      return products as unknown as Product[];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < (session ? 10 : PRODUCTS_PER_PAGE)) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
  });
};
