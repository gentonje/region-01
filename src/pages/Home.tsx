import React from 'react';
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { ProductList } from "@/components/ProductList";
import { Navigation, BottomNavigation } from '@/components/Navigation';
import { useInView } from "react-intersection-observer";
import { SupportedCurrency } from "@/utils/currencyConverter";

export default function Home() {
  const { ref, inView } = useInView();
  const [selectedCurrency, setSelectedCurrency] = React.useState<SupportedCurrency>("SSP");

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["home-products"],
    queryFn: async ({ pageParam = 0 }) => {
      const startRange = Number(pageParam) * 10;
      const endRange = startRange + 9;

      const { data: products, error } = await supabase
        .from("products")
        .select("*, product_images(*)")
        .eq('product_status', 'published')
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

  React.useEffect(() => {
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
    // Product detail view will be handled by the ProductList component
  };

  const handleCurrencyChange = (currency: SupportedCurrency) => {
    setSelectedCurrency(currency);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation onCurrencyChange={handleCurrencyChange} />
      <div className="container mx-auto px-4">
        <div className="mt-20">
          <h1 className="text-3xl font-bold mb-8 text-center">Welcome to Our Marketplace</h1>
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
      </div>
      <BottomNavigation />
    </div>
  );
}