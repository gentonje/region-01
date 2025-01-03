import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { ProductList } from "@/components/ProductList";
import { Navigation, BottomNavigation } from "@/components/Navigation";
import { SplashScreen } from "@/components/SplashScreen";
import { useInView } from "react-intersection-observer";

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const { ref, inView } = useInView();

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useQuery({
      queryKey: ["products"],
      queryFn: async ({ pageParam = 1 }) => {
        const from = (pageParam - 1) * 10;
        const to = from + 9;

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .range(from, to)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data as Product[];
      },
      getNextPageParam: (lastPage, allPages) => {
        return lastPage?.length === 10 ? allPages.length + 1 : undefined;
      },
      initialPageSize: 10,
    });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (data) {
      const allProducts = data.pages.flat();
      setProducts(allProducts);
    }
  }, [data]);

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
    // Wait for 3 seconds after animation completes
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
              products={products}
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