import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { ProductList } from "@/components/ProductList";
import { Navigation, BottomNavigation } from "@/components/Navigation";
import { useInView } from "react-intersection-observer";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { ProductFilters } from "@/components/ProductFilters";
import { SupportedCurrency } from "@/utils/currencyConverter";
import ProductDetail from "@/components/ProductDetail";
import { useState } from "react";

export default function Index() {
  const { ref, inView } = useInView();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>("SSP");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["all-products", searchQuery, selectedCategory],
    queryFn: async ({ pageParam = 0 }) => {
      const startRange = Number(pageParam) * 10;
      const endRange = startRange + 9;

      let query = supabase
        .from("products")
        .select("*, product_images(*), profiles!products_user_id_fkey(username, full_name)")
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

      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation onCurrencyChange={handleCurrencyChange} />
      <div className="container mx-auto px-4">
        <div className="mt-20">
          <BreadcrumbNav
            items={[
              { label: "Home", href: "/" }
            ]}
          />
          {selectedProduct ? (
            <ProductDetail 
              product={selectedProduct}
              getProductImageUrl={getProductImageUrl}
              onBack={handleBack}
            />
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}