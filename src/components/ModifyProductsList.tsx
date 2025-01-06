import { ProductModifyCard } from "@/components/ProductModifyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { Product } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ModifyProductsListProps {
  products: Product[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onDelete: (productId: string) => Promise<void>;
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

  // Check if user is admin or super admin
  const { data: isAdminOrSuper } = useQuery({
    queryKey: ["isAdminOrSuper"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin', {
        user_id: user.id
      });
      
      if (adminError) {
        console.error('Error checking admin status:', adminError);
        return false;
      }

      const { data: isSuperAdmin, error: superError } = await supabase.rpc('is_super_admin', {
        user_id: user.id
      });
      
      if (superError) {
        console.error('Error checking super admin status:', superError);
        return false;
      }
      
      return isAdmin || isSuperAdmin;
    }
  });

  useEffect(() => {
    if (isMobile && inView && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [inView, hasMore, isMobile, isLoading, onLoadMore]);

  // Debug log for products
  console.log("ModifyProductsList - Products:", products);

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(3).fill(null).map((_, index) => (
        <ProductSkeleton key={`skeleton-${index}`} />
      ))}
    </div>
  );

  // Create a Set of unique product IDs to prevent duplicates
  const uniqueProducts = Array.from(
    new Map(products.map(product => [product.id, product])).values()
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {uniqueProducts.map((product) => (
          <ProductModifyCard
            key={`product-${product.id}`}
            product={product}
            onDelete={onDelete}
            isAdminOrSuper={isAdminOrSuper}
          />
        ))}
      </div>

      {isLoading && renderSkeletons()}

      {!isLoading && uniqueProducts.length === 0 && (
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