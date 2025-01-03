import { useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { ProductList } from "@/components/ProductList";
import { Navigation, BottomNavigation } from "@/components/Navigation";
import { SplashScreen } from "@/components/SplashScreen";
import { useInView } from "react-intersection-observer";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async ({ pageParam }) => {
      const startRange = (pageParam as number) * 10;
      const endRange = startRange + 9;

      const { data: products, error } = await supabase
        .from("products")
        .select("*, product_images(*)")
        .range(startRange, endRange)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return products as Product[];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < 10) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allProducts = data?.pages.flat() || [];

  const getProductImageUrl = (product: Product) => {
    if (!product.product_images?.length) return "/placeholder.svg";
    
    const mainImage = product.product_images.find(img => img.is_main) || product.product_images[0];
    if (!mainImage) return "/placeholder.svg";

    return supabase.storage
      .from("images")
      .getPublicUrl(mainImage.storage_path).data.publicUrl;
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
            <BreadcrumbNav
              items={[
                { label: "Products", href: "/" }
              ]}
            />
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