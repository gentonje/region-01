
import React, { useCallback, memo } from "react";
import { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { useInView } from "react-intersection-observer";
import { Skeleton } from "./ui/skeleton";
import { Loader } from "lucide-react";

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
  <div className="space-y-2 rounded-xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-2 shadow-sm">
    {/* Image section matching ProductCardImage */}
    <div className="relative">
      {/* Orange decorative element in top left */}
      <div className="absolute top-0 left-0 z-0 bg-orange-500 h-10 w-20 rounded-r-lg opacity-90"></div>
      <Skeleton className="h-[200px] w-full rounded-lg" />
      {/* Bottom badges area */}
      <div className="absolute bottom-1 left-1 flex flex-row gap-1 max-w-[90%]">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-4 w-20 rounded-full" />
      </div>
      {/* Top right status badge */}
      <Skeleton className="absolute top-2 right-2 h-4 w-16 rounded-full" />
    </div>
    
    {/* Product info section matching ProductCardContent */}
    <Skeleton className="h-6 w-2/3" /> {/* Title */}
    <Skeleton className="h-4 w-full" /> {/* Description */}
    <div className="flex justify-between mt-2 space-x-2">
      <Skeleton className="h-6 w-20 rounded-md" /> {/* Price */}
      <Skeleton className="h-6 w-16 rounded-md" /> {/* Views badge */}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 w-full p-2">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="p-1">
            <ProductSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-6 rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 w-full mx-2">
        <div className="max-w-md mx-auto px-4 space-y-2">
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
        <>
          <div className="p-1"><ProductSkeleton /></div>
          <div className="p-1"><ProductSkeleton /></div>
          <div className="p-1"><ProductSkeleton /></div>
          <div className="p-1"><ProductSkeleton /></div>
        </>
      )}
    </div>
  );
};

export default memo(ProductList);
