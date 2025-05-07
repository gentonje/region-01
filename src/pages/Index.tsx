
import { useState, useEffect, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductList from "@/components/ProductList";
import { ProductFilters } from "@/components/ProductFilters";
import ProductDetail from "@/components/ProductDetail";
import { RegionSelector } from "@/components/RegionSelector";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Product, ProductCategory } from "@/types/product";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { useSelectedCountry } from "@/Routes";

interface IndexProps {
  selectedCurrency?: SupportedCurrency;
  selectedCountry?: string; // Add country prop
}

const Index = ({ 
  selectedCurrency = "USD",
  selectedCountry = "1", // Default to Kenya (id: 1)
}: IndexProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const pageSize = 12;
  
  // Get country from context if available
  const countryContext = useSelectedCountry();
  // Use context value if available, otherwise use prop
  const effectiveCountry = countryContext?.selectedCountry || selectedCountry;

  // Fetch products with infinite scrolling
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["products", searchQuery, selectedRegion, selectedCategory, effectiveCountry],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from("products")
        .select(`
          *,
          product_images (
            id,
            storage_path,
            is_main,
            display_order
          )
        `)
        .eq("product_status", "published")
        .eq("in_stock", true)
        .range(pageParam as number, (pageParam as number) + pageSize - 1)
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      if (selectedRegion !== "all") {
        query = query.eq("county", selectedRegion);
      }
      
      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory as ProductCategory);
      }
      
      if (effectiveCountry !== "all") {
        query = query.eq("country_id", effectiveCountry);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Use explicit type casting to avoid deep instantiation issues
      return (data || []) as unknown as Product[];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === pageSize
        ? allPages.length * pageSize
        : undefined;
    },
  });

  const products = data?.pages.flat() || [];

  const loadMoreProducts = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
  };

  const handleRegionChange = (region: string) => {
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
    <div className="pb-16 mx-1 sm:mx-auto">
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
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
      
      <div className="mt-6">
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
