
import { useState, useEffect, useCallback } from "react";
import ProductList from "@/components/ProductList";
import { ProductFilters } from "@/components/ProductFilters";
import ProductDetail from "@/components/ProductDetail";
import { RegionSelector } from "@/components/RegionSelector";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Product } from "@/types/product";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { useSelectedCountry } from "@/Routes";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { useCurrencyFix } from "@/hooks/useCurrencyFix";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client"; // Added missing import

interface IndexProps {
  selectedCurrency?: SupportedCurrency;
  selectedCountry?: string;
}

const Index = ({ 
  selectedCurrency = "USD",
  selectedCountry = "all", // Default to "all"
}: IndexProps) => {
  // Initialize currency fix
  const { isFixing } = useCurrencyFix();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  
  // Get country from context if available
  const countryContext = useSelectedCountry();
  // Use context value if available, otherwise use prop
  const effectiveCountry = countryContext?.selectedCountry || selectedCountry;

  // Use our hook to fetch products with infinite scrolling
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useProducts({
    searchQuery,
    selectedCategory,
    selectedRegion,
    selectedCountry: effectiveCountry,
    sortOrder,
    showOnlyPublished: true,
    limit: 20 // Set a limit of 20 items per page
  });

  const products = data?.pages.flat() || [];

  const loadMoreProducts = useCallback((node?: Element | null) => {
    if (node && hasNextPage && !isFetchingNextPage) {
      console.log("Loading more products...");
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
  };

  const handleRegionChange = (region: string) => {
    console.log("Region changed to:", region);
    setSelectedRegion(region);
  };
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const getProductImageUrl = (product: Product) => {
    if (
      !product.product_images ||
      product.product_images.length === 0 ||
      !product.product_images[0].storage_path
    ) {
      return "/placeholder.svg";
    }

    return supabase.storage
      .from("images")
      .getPublicUrl(product.product_images[0].storage_path).data.publicUrl;
  };

  if (selectedProduct) {
    return (
      <div className="container mx-0 px-0 w-full max-w-none py-0 sm:py-6 sm:mx-auto sm:px-4">
        <ProductDetail
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
          getProductImageUrl={getProductImageUrl}
          selectedCurrency={selectedCurrency}
          setSelectedProduct={setSelectedProduct}
        />
      </div>
    );
  }

  return (
    <div className="mx-1 sm:mx-auto">
      <div className="space-y-1">
        <BreadcrumbNav
          items={[
            { href: "/", label: "Home" },
            { label: "Products", isCurrent: true }
          ]}
        />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex flex-row gap-2 w-full">
            <RegionSelector 
              selectedRegion={selectedRegion} 
              onRegionChange={handleRegionChange}
              selectedCountry={effectiveCountry}
            />
            
            <CategoryFilter 
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>
          
          <ProductFilters onSearchChange={handleSearchChange} />
        </div>
      </div>
      
      <div className="mt-1">
        <ProductList
          products={products}
          getProductImageUrl={getProductImageUrl}
          onProductClick={setSelectedProduct}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          observerRef={loadMoreProducts}
          selectedCurrency={selectedCurrency}
        />
      </div>
    </div>
  );
};

export default Index;
