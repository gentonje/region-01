import React, { useState } from "react";
import { useInView } from "react-intersection-observer";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { SupportedCurrency } from "@/utils/currencyConverter";
import ProductDetail from "@/components/ProductDetail";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductListingSection } from "@/components/products/ProductListingSection";
import { useProducts } from "@/hooks/useProducts";

export default function Index() {
  const { ref, inView } = useInView();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>("SSP");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [sortOrder, setSortOrder] = useState<string>("none");

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useProducts({
    searchQuery,
    selectedCategory,
    priceRange,
    sortOrder,
    showOnlyPublished: true,
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
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mt-20">
        <BreadcrumbNav
          items={[
            { label: "All Products", href: "/" }
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
          <ProductListingSection
            products={allProducts}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onProductClick={handleProductClick}
            isFetchingNextPage={isFetchingNextPage}
            observerRef={ref}
            selectedCurrency={selectedCurrency}
            onPriceRangeChange={handlePriceRangeChange}
            onSortChange={handleSortChange}
            getProductImageUrl={getProductImageUrl}
          />
        )}
      </div>
    </div>
  );
}