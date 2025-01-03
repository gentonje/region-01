import { ProductModifyCard } from "@/components/ProductModifyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

interface ModifyProductsListProps {
  products: any[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onDelete: (productId: string) => void;
  isMobile: boolean;
}

const ProductSkeleton = () => (
  <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow space-y-4">
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <div className="flex justify-between items-center">
      <Skeleton className="h-6 w-24" />
      <div className="space-x-2">
        <Skeleton className="h-8 w-8 inline-block" />
        <Skeleton className="h-8 w-8 inline-block" />
      </div>
    </div>
  </div>
);

export const ModifyProductsList = ({
  products,
  isLoading,
  hasMore,
  onLoadMore,
  onDelete,
  isMobile
}: ModifyProductsListProps) => {
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (isMobile && inView && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [inView, hasMore, isMobile, isLoading, onLoadMore]);

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(3).fill(null).map((_, index) => (
        <ProductSkeleton key={`skeleton-${index}`} />
      ))}
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductModifyCard
            key={product.id}
            product={product}
            onDelete={onDelete}
          />
        ))}
      </div>

      {isLoading && renderSkeletons()}

      {!isLoading && products.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No products found</p>
        </div>
      )}

      {isMobile && (
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          {hasMore && <div className="loading">Loading more...</div>}
        </div>
      )}
    </>
  );
};