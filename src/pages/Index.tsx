
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
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
import { supabase } from "@/integrations/supabase/client";
import { CountrySelector } from "@/components/navigation/CountrySelector";

interface IndexProps {
  selectedCurrency?: SupportedCurrency;
  selectedCountry?: string;
}

const Index = ({ 
  selectedCurrency = "USD",
  selectedCountry: propSelectedCountry = "all", // Default to "all"
}: IndexProps) => {
  // Initialize currency fix
  const { isFixing } = useCurrencyFix();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [localSelectedCountry, setLocalSelectedCountry] = useState(propSelectedCountry);
  const location = useLocation();
  
  // Get country from context if available
  const countryContext = useSelectedCountry();
  // Use context value if available, otherwise use prop or "all" as default
  const effectiveCountry = countryContext?.selectedCountry || localSelectedCountry || "all";

  useEffect(() => {
    if (propSelectedCountry !== "all" && propSelectedCountry !== localSelectedCountry) {
      setLocalSelectedCountry(propSelectedCountry);
    }
    
    if (countryContext?.selectedCountry && countryContext.selectedCountry !== localSelectedCountry) {
      setLocalSelectedCountry(countryContext.selectedCountry);
    }
  }, [propSelectedCountry, countryContext?.selectedCountry, localSelectedCountry]);

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

  // Effect to handle loading a product from navigation state
  useEffect(() => {
    // Check if we have a selectedProductId in the location state
    const locationState = location.state as { selectedProductId?: string } | null;
    
    if (locationState?.selectedProductId) {
      const loadProductDetails = async () => {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*, product_images(*), profiles(*)')
            .eq('id', locationState.selectedProductId)
            .single();
            
          if (error) {
            console.error('Error loading product from notification:', error);
          } else if (data) {
            setSelectedProduct(data as unknown as Product);
          }
        } catch (err) {
          console.error('Error fetching product details:', err);
        }
      };
      
      loadProductDetails();
      
      // Clear the location state to prevent reloading on future navigations
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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
  
  const handleCountryChange = (country: string) => {
    console.log("Country changed in Index to:", country);
    setLocalSelectedCountry(country);
    // Reset region when country changes
    setSelectedRegion("all");
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
      <div className="w-full mx-0 px-0 py-0">
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
    <div className="w-full">
      <div>
        <BreadcrumbNav
          items={[
            { href: "/", label: "Home" },
            { label: "Products", isCurrent: true }
          ]}
        />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <div className="w-full max-w-xs">
              <CountrySelector 
                selectedCountry={effectiveCountry} 
                onCountryChange={handleCountryChange} 
              />
            </div>
            
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
