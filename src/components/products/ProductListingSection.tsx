
import { Product } from "@/types/product";
import { ProductList } from "@/components/ProductList";
import { ProductFilters } from "@/components/ProductFilters";
import { CountiesFilter } from "@/components/CountiesFilter";
import { CountryFilter } from "@/components/CountryFilter";
import { SupportedCurrency } from "@/utils/currencyConverter";

interface ProductListingSectionProps {
  products: Product[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedCounty: string;
  setSelectedCounty: (county: string) => void;
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  onProductClick: (product: Product) => void;
  isFetchingNextPage: boolean;
  observerRef: (node?: Element | null) => void;
  selectedCurrency: SupportedCurrency;
  onPriceRangeChange: (min: number, max: number) => void;
  onSortChange: (sort: string) => void;
  getProductImageUrl: (product: Product) => string;
  showStatus?: boolean;
  onDelete?: (productId: string) => Promise<void>;
  isAdmin?: boolean;
  emptyMessage?: string;
  isLoading?: boolean;
}

export const ProductListingSection = ({
  products,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedCounty,
  setSelectedCounty,
  selectedCountry,
  setSelectedCountry,
  onProductClick,
  isFetchingNextPage,
  observerRef,
  selectedCurrency,
  onPriceRangeChange,
  onSortChange,
  getProductImageUrl,
  showStatus = false,
  onDelete,
  isAdmin,
  emptyMessage = "No products found",
  isLoading = false
}: ProductListingSectionProps) => {
  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
  };

  const handleCountyChange = (county: string) => {
    setSelectedCounty(county);
  };

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
  };

  return (
    <div className="w-full space-y-1 p-1">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <CountryFilter 
            selectedCountry={selectedCountry}
            onCountryChange={handleCountryChange}
          />
          <CountiesFilter
            selectedCounty={selectedCounty}
            onCountyChange={handleCountyChange}
            selectedCountry={selectedCountry}
          />
        </div>
        <ProductFilters onSearchChange={handleSearchChange} />
      </div>
      
      <ProductList
        products={products}
        getProductImageUrl={getProductImageUrl}
        onProductClick={onProductClick}
        isFetchingNextPage={isFetchingNextPage}
        observerRef={observerRef}
        selectedCurrency={selectedCurrency}
        showStatus={showStatus}
        onDelete={onDelete}
        isAdmin={isAdmin}
        emptyMessage={emptyMessage}
        isLoading={isLoading}
      />
    </div>
  );
};
