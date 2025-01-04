import { Suspense } from "react";
import { Skeleton } from "../ui/skeleton";
import { ProductHeader } from "./ProductHeader";

interface ProductInfoProps {
  title: string;
  category: string;
  averageRating: number;
  inStock: boolean;
  description: string;
  onBack: () => void;
}

export const ProductInfo = ({
  title,
  category,
  averageRating,
  inStock,
  description,
  onBack
}: ProductInfoProps) => {
  return (
    <div className="space-y-6">
      <Suspense fallback={<Skeleton className="h-8 w-3/4" />}>
        <ProductHeader
          title={title}
          category={category}
          averageRating={averageRating}
          onBack={onBack}
        />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-6 w-24" />}>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
            inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
      </Suspense>

      <Suspense fallback={<Skeleton className="h-24 w-full" />}>
        <div className="rounded-md border p-4">
          <p className="text-sm text-gray-800">{description}</p>
        </div>
      </Suspense>
    </div>
  );
};