
import { ModifyProductsList } from "@/components/ModifyProductsList";
import { ModifyProductsPagination } from "@/components/ModifyProductsPagination";
import { Product } from "@/types/product";
import { useIsMobile } from "@/hooks/use-mobile";
import { EmptyProductsList } from "./EmptyProductsList";
import { LoadingIndicator } from "./LoadingIndicator";

interface ProductsDisplayProps {
  products: Product[] | undefined;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onDelete: (productId: string) => Promise<void>;
  isProfileComplete: boolean;
}

export const ProductsDisplay = ({
  products,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onDelete,
  isProfileComplete
}: ProductsDisplayProps) => {
  const isMobile = useIsMobile();

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (!products || products.length === 0) {
    return <EmptyProductsList isProfileComplete={isProfileComplete} />;
  }

  return (
    <div className="space-y-1">
      <ModifyProductsList
        products={products}
        onDelete={onDelete}
        isLoading={false}
        hasMore={false}
        onLoadMore={() => {}}
      />
      <ModifyProductsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        isMobile={isMobile}
      />
    </div>
  );
};
