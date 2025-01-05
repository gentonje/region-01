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
}: ProductListingSectionProps) => {
  return (
    <>
      <ProductFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onPriceRangeChange={onPriceRangeChange}
        onSortChange={onSortChange}
      />
      <ProductList
        products={products}
        getProductImageUrl={getProductImageUrl}
        onProductClick={onProductClick}
        isFetchingNextPage={isFetchingNextPage}
        observerRef={observerRef}
        selectedCurrency={selectedCurrency}
        showStatus={false}
      />
    </>
  );
};