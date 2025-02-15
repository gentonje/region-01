
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { supabase } from "@/integrations/supabase/client";

type TableNames = "cart_items" | "products" | "categories" | "currencies" | 
  "onboarding_progress" | "orders" | "product_images" | "product_views" | 
  "shops" | "profiles" | "review_replies" | "reviews" | "wishlist_items" | 
  "wishlists";

// Optimized select query builder
export const optimizedSelect = <T>(
  table: TableNames,
  columns: string = "*",
  options: {
    limit?: number;
    page?: number;
    filters?: Record<string, any>;
  } = {}
) => {
  const { limit = 10, page = 0, filters = {} } = options;

  let query = supabase
    .from(table)
    .select(columns, { count: "exact" })
    .range(page * limit, (page + 1) * limit - 1);

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = (query as PostgrestFilterBuilder<any, any, any>).eq(key, value);
    }
  });

  return query;
};

// Function to generate consistent query keys
export const generateQueryKey = (
  table: TableNames,
  params: Record<string, any> = {}
): TableNames[] => {
  const baseKey = [table];
  Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        baseKey.push(table); // Use the table name instead of string concatenation
      }
    });
  return baseKey;
};

// Prefetch helper for common queries
export const prefetchCommonQueries = async (queryClient: any) => {
  const commonQueries = [
    {
      table: "products" as TableNames,
      columns: "id,title,price,category",
      options: { limit: 10 },
    },
    {
      table: "cart_items" as TableNames,
      columns: "*",
    },
    {
      table: "wishlist_items" as TableNames,
      columns: "*",
    },
  ];

  await Promise.all(
    commonQueries.map(async ({ table, columns, options = {} }) => {
      const query = optimizedSelect(table, columns, options);
      const queryKey = generateQueryKey(table, options);
      await queryClient.prefetchQuery({
        queryKey,
        queryFn: () => query,
        staleTime: 1000 * 60 * 5, // 5 minutes
      });
    })
  );
};
