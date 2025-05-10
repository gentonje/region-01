
import React, { useCallback, memo } from "react";
import { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { useInView } from "react-intersection-observer";
import { Skeleton } from "./ui/skeleton";

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

const ProductSkeleton = memo(() => (
  <div className="space-y-1 rounded-xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1 m-1 shadow-sm">
    <Skeleton className="h-[200px] w-full rounded-lg" />
    <Skeleton className="h-6 w-2/3 m-1" />
    <Skeleton className="h-4 w-full m-1" />
    <div className="flex justify-between mt-1 m-1 space-x-1">
      <Skeleton className="h-6 w-20 rounded-md" />
      <Skeleton className="h-6 w-16 rounded-md" />
    </div>
  </div>
));

ProductSkeleton.displayName = 'ProductSkeleton';

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 w-full max-w-7xl mx-auto p-1">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="flex justify-center p-1">
            <ProductSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-4 m-2 rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 max-w-3xl mx-auto space-y-2">
        <div className="max-w-md mx-auto px-4 py-6 space-y-2">
          <h3 className="text-xl md:text-2xl font-bold text-gray-700 dark:text-gray-300 font-serif">{emptyMessage}</h3>
          <p className="text-gray-500 dark:text-gray-400 font-sans">Sorry, we don't have that item in stock at the moment. Try adjusting your search or filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 w-full max-w-7xl mx-auto p-1">
      {products.map((product, index) => (
        <div
          key={product.id}
          ref={index === products.length - 1 ? setLastElementRef : undefined}
          className="transform transition-transform hover:-translate-y-1 duration-300 flex justify-center"
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
        <>
          <div className="flex justify-center p-1"><ProductSkeleton /></div>
          <div className="flex justify-center p-1"><ProductSkeleton /></div>
          <div className="flex justify-center p-1"><ProductSkeleton /></div>
          <div className="flex justify-center p-1"><ProductSkeleton /></div>
        </>
      )}
    </div>
  );
};

export default memo(ProductList);
