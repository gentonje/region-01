import React, { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { ProductList } from "@/components/ProductList";
import { Navigation, BottomNavigation } from '@/components/Navigation';
import { useInView } from "react-intersection-observer";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { ProductFilters } from "@/components/ProductFilters";
import { SupportedCurrency } from "@/utils/currencyConverter";
import ProductDetail from "@/components/ProductDetail";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { ref, inView } = useInView();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>("SSP");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [sortOrder, setSortOrder] = useState<string>("none");
  const { session } = useAuth();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["products", searchQuery, selectedCategory, priceRange, sortOrder],
    queryFn: async ({ pageParam = 0 }) => {
      const startRange = Number(pageParam) * 10;
      const endRange = startRange + 9;

      let query = supabase
        .from("products")
        .select("*, product_images(*)")
        .eq('user_id', session?.user.id)
        .range(startRange, endRange);

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      // Apply price range filter
      if (priceRange.min > 0) {
        query = query.gte('price', priceRange.min);
      }
      if (priceRange.max < 1000) {
        query = query.lte('price', priceRange.max);
      }

      // Apply sorting if specified
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
    setSelectedProduct(product);
  };

  const handleCurrencyChange = (currency: SupportedCurrency) => {
    setSelectedCurrency(currency);
  };

  const handleBack = () => {
    setSelectedProduct(null);
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange({ min, max });
  };

  const handleSortChange = (sort: string) => {
    setSortOrder(sort);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation onCurrencyChange={handleCurrencyChange} />
        <div className="container mx-auto px-4 mt-20">
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation onCurrencyChange={handleCurrencyChange} />
      <div className="container mx-auto px-4">
        <div className="mt-20">
          <BreadcrumbNav
            items={[
              { label: "My Products", href: "/" }
            ]}
          />
          {selectedProduct ? (
            <ProductDetail 
              product={selectedProduct}
              getProductImageUrl={getProductImageUrl}
              onBack={handleBack}
              selectedCurrency={selectedCurrency}
            />
          ) : (
            <>
              <ProductFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                onPriceRangeChange={handlePriceRangeChange}
                onSortChange={handleSortChange}
              />
              <ProductList
                products={allProducts}
                getProductImageUrl={getProductImageUrl}
                onProductClick={handleProductClick}
                isLoading={isLoading}
                isFetchingNextPage={isFetchingNextPage}
                observerRef={ref}
                selectedCurrency={selectedCurrency}
                showStatus={true}
              />
            </>
          )}
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}