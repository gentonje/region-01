
import { useState, useEffect, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductList from "@/components/ProductList";
import { ProductFilters } from "@/components/ProductFilters";
import ProductDetail from "@/components/ProductDetail";
import { Product } from "@/types/product";
import { SupportedCurrency } from "@/utils/currencyConverter";

interface IndexProps {
  selectedCurrency?: SupportedCurrency;
}

interface FetchProductsParams {
  pageParam: number;
}

const Index = ({ selectedCurrency = "USD" }: IndexProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCounty, setSelectedCounty] = useState("");
  const pageSize = 12;

  // Fetch products with infinite scrolling
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["products", searchQuery, selectedCounty],
    queryFn: async ({ pageParam = 0 }: FetchProductsParams) => {
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

      if (selectedCounty) {
        query = query.eq("county", selectedCounty);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === pageSize
        ? allPages.length * pageSize
        : undefined;
    },
    initialPageParam: 0
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

  const handleCountyChange = (county: string) => {
    setSelectedCounty(county);
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
      <h1 className="text-2xl font-bold my-6">All Products</h1>
      
      <ProductFilters 
        onSearchChange={handleSearchChange}
        onCountyChange={handleCountyChange} 
      />
      
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
