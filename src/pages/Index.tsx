import { useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { ProductList } from "@/components/ProductList";
import { Navigation, BottomNavigation } from "@/components/Navigation";
import { SplashScreen } from "@/components/SplashScreen";
import { useInView } from "react-intersection-observer";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { ProductFilters } from "@/components/ProductFilters";
import { SupportedCurrency } from "@/utils/currencyConverter";

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const { ref, inView } = useInView();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>("USD");

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery<Product[]>({
    queryKey: ["products", searchQuery, selectedCategory],
    queryFn: async ({ pageParam = 0 }) => {
      const startRange = Number(pageParam) * 10;
      const endRange = startRange + 9;

      let query = supabase
        .from("products")
        .select("*, product_images(*)")
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

  const handleCurrencyChange = (currency: SupportedCurrency) => {
    setSelectedCurrency(currency);
  };

  return (
    <div className="min-h-screen bg-background">
      {showSplash ? (
        <SplashScreen onComplete={handleSplashComplete} />
      ) : (
        <>
          <Navigation onCurrencyChange={handleCurrencyChange} />
          <div className="container mx-auto px-4">
            <BreadcrumbNav
              items={[
                { label: "Products", href: "/" }
              ]}
            />
            <ProductFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
            <ProductList
              products={allProducts}
              getProductImageUrl={getProductImageUrl}
              onProductClick={handleProductClick}
              isLoading={isLoading}
              isFetchingNextPage={isFetchingNextPage}
              observerRef={ref}
              selectedCurrency={selectedCurrency}
            />
          </div>
          <BottomNavigation />
        </>
      )}
    </div>
  );
}
