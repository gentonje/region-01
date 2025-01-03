import { useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { ProductList } from "@/components/ProductList";
import { Navigation, BottomNavigation } from "@/components/Navigation";
import { SplashScreen } from "@/components/SplashScreen";
import { useInView } from "react-intersection-observer";

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["products"],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * 10;
      const to = from + 9;

      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(*)")
        .range(from, to)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.length === 10 ? allPages.length : undefined;
    },
    initialPageSize: 10,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allProducts = data?.pages.flat() || [];

  const getProductImageUrl = (product: Product) => {
    if (!product.storage_path) return "/placeholder.svg";
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/images/${
      product.storage_path
    }`;
  };

  const handleProductClick = (product: Product) => {
    console.log("Product clicked:", product);
  };

  const handleSplashComplete = () => {
    setTimeout(() => {
      setShowSplash(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {showSplash ? (
        <SplashScreen onComplete={handleSplashComplete} />
      ) : (
        <>
          <Navigation />
          <div className="container mx-auto px-4 pt-20">
            <ProductList
              products={allProducts}
              getProductImageUrl={getProductImageUrl}
              onProductClick={handleProductClick}
              isLoading={isLoading}
              isFetchingNextPage={isFetchingNextPage}
              observerRef={ref}
            />
          </div>
          <BottomNavigation />
        </>
      )}
    </div>
  );
}