import { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
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
}

const ProductSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-[200px] w-full rounded-lg animate-[pulse_3s_ease-in-out_infinite]" />
    <Skeleton className="h-4 w-2/3 animate-[pulse_3s_ease-in-out_infinite]" />
    <Skeleton className="h-4 w-1/2 animate-[pulse_3s_ease-in-out_infinite]" />
  </div>
);

export const ProductList = ({
  products,
  getProductImageUrl,
  onProductClick,
  isLoading,
  isFetchingNextPage,
  observerRef,
  selectedCurrency,
  showStatus = false
}: ProductListProps) => {
  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView && observerRef) {
      observerRef();
    }
  }, [inView, observerRef]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 mt-4">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <ProductSkeleton key={n} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 mt-4">
      {products.map((product, index) => (
        <div
          key={product.id}
          ref={index === products.length - 1 ? ref : undefined}
        >
          <ProductCard
            product={product}
            getProductImageUrl={getProductImageUrl}
            onClick={() => onProductClick(product)}
            selectedCurrency={selectedCurrency}
            showStatus={showStatus}
          />
        </div>
      ))}
      {isFetchingNextPage && (
        <>
          <ProductSkeleton />
          <ProductSkeleton />
          <ProductSkeleton />
        </>
      )}
    </div>
  );
};