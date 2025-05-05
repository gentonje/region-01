
import React, { useCallback, memo } from "react";
import { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { useInView } from "react-intersection-observer";

interface ProductListProps {
  products: Product[];
  getProductImageUrl: (product: Product) => string;
  onProductClick: (product: Product) => void;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  observerRef?: (node?: Element | null) => void;
  selectedCurrency: SupportedCurrency;
  showStatus?: boolean;
  onDelete?: (productId: string) => Promise<void>;
  isAdmin?: boolean;
  emptyMessage?: string;
}

export const ProductList = ({
  products,
  getProductImageUrl,
  onProductClick,
  isLoading,
  isFetchingNextPage,
  observerRef,
  selectedCurrency,
  showStatus = false,
  onDelete,
  isAdmin,
  emptyMessage = "No products found"
}: ProductListProps) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const setLastElementRef = useCallback((node: Element | null) => {
    ref(node);
    if (inView && observerRef) {
      observerRef(node);
    }
  }, [ref, inView, observerRef]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-40">
        <p className="text-lg text-gray-500">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-1 rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 w-full mx-1">
        <div className="max-w-md mx-auto px-1 space-y-1">
          <h3 className="text-xl md:text-2xl font-bold text-gray-700 dark:text-gray-300">{emptyMessage}</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters to find what you're looking for</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 w-full mx-0 px-0">
      {products.map((product, index) => (
        <div
          key={product.id}
          ref={index === products.length - 1 ? setLastElementRef : undefined}
          className="p-1 transform transition-transform hover:-translate-y-1 duration-300"
        >
          <ProductCard
            product={product}
            getProductImageUrl={getProductImageUrl}
            onClick={() => onProductClick(product)}
            selectedCurrency={selectedCurrency}
            showStatus={showStatus}
            onDelete={onDelete}
            isAdmin={isAdmin}
          />
        </div>
      ))}
      
      {isFetchingNextPage && (
        <div className="col-span-full flex justify-center p-4">
          <p className="text-gray-500">Loading more products...</p>
        </div>
      )}
    </div>
  );
};

export default memo(ProductList);
