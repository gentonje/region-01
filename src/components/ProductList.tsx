import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { useInView } from "react-intersection-observer";

interface ProductListProps {
  products: Product[];
  getProductImageUrl: (product: Product) => string;
  onProductClick: (product: Product) => void;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  observerRef: (node?: Element | null) => void;
  selectedCurrency: SupportedCurrency;
}

const ProductSkeleton = () => (
  <Card className="w-full h-[380px] m-1">
    <div className="p-4 space-y-3">
      <Skeleton className="h-60 w-full rounded-md" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  </Card>
);

export const ProductList = ({
  products,
  getProductImageUrl,
  onProductClick,
  isLoading,
  isFetchingNextPage,
  observerRef,
  selectedCurrency,
}: ProductListProps) => {
  const { ref: containerRef } = useInView({
    threshold: 0.1,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
        {Array(12)
          .fill(0)
          .map((_, index) => (
            <ProductSkeleton key={`skeleton-${index}`} />
          ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-2" ref={containerRef}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 pb-20">
        {products.map((product) => (
          <div key={product.id}>
            <ProductCard
              product={product}
              getProductImageUrl={getProductImageUrl}
              onClick={() => onProductClick(product)}
              selectedCurrency={selectedCurrency}
            />
          </div>
        ))}

        {isFetchingNextPage &&
          Array(4)
            .fill(0)
            .map((_, index) => (
              <ProductSkeleton key={`skeleton-loading-more-${index}`} />
            ))}

        <div ref={observerRef} style={{ height: "10px" }} />
      </div>
    </div>
  );
};