import { Product } from "@/types/product";
import { ProductList } from "@/components/ProductList";
import { ProductFilters } from "@/components/ProductFilters";
import { SupportedCurrency } from "@/utils/currencyConverter";

interface ProductListingSectionProps {
  products: Product[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onProductClick: (product: Product) => void;
  isFetchingNextPage: boolean;
  observerRef: (node?: Element | null) => void;
  selectedCurrency: SupportedCurrency;
  onPriceRangeChange: (min: number, max: number) => void;
  onSortChange: (sort: string) => void;
  getProductImageUrl: (product: Product) => string;
  showStatus?: boolean;
}

export const ProductListingSection = ({
  products,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onProductClick,
  isFetchingNextPage,
  observerRef,
  selectedCurrency,
  onPriceRangeChange,
  onSortChange,
  getProductImageUrl,
  showStatus = false,
}: ProductListingSectionProps) => {
  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
  };

  return (
    <>
      <ProductFilters onSearchChange={handleSearchChange} />
      <ProductList
        products={products}
        getProductImageUrl={getProductImageUrl}
        onProductClick={onProductClick}
        isFetchingNextPage={isFetchingNextPage}
        observerRef={observerRef}
        selectedCurrency={selectedCurrency}
        showStatus={showStatus}
      />
    </>
  );
};