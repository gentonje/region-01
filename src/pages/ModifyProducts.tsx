import React, { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { ProductListingSection } from "@/components/products/ProductListingSection";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";

interface ModifyProductsProps {
  userOnly?: boolean;
}

export default function ModifyProducts({ userOnly = true }: ModifyProductsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCurrency] = useState<SupportedCurrency>("SSP");
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
    userOnly, // This will be used in the hook to filter products
  });

  const allProducts = data?.pages.flat() || [];

  const getProductImageUrl = (product: Product) => {
    if (!product.product_images?.length) return "/placeholder.svg";
    
    const mainImage = product.product_images.find(img => img.is_main) || product.product_images[0];
    if (!mainImage) return "/placeholder.svg";

    return supabase.storage
      .from("images")
      .getPublicUrl(mainImage.storage_path).data.publicUrl;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 mt-8">
        {userOnly ? "My Products" : "All Products"}
      </h1>
      <ProductListingSection
        products={allProducts}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onProductClick={() => {}}
        isFetchingNextPage={isFetchingNextPage}
        observerRef={() => {}}
        selectedCurrency={selectedCurrency}
        onPriceRangeChange={(min, max) => setPriceRange({ min, max })}
        onSortChange={setSortOrder}
        getProductImageUrl={getProductImageUrl}
        showStatus={true}
      />
    </div>
  );
}