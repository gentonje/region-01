import { Button } from "../ui/button";
import { ChevronLeft, Star } from "lucide-react";

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
    <div className="space-y-3">
      <div className="flex items-center justify-between mt-4">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          onClick={onBack}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {averageRating.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="-mt-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{title}</h1>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{category}</p>
      </div>

      <div className="rounded-md border border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800/50 mt-2">
        <p className="text-sm text-gray-500 dark:text-gray-300 leading-relaxed">{description}</p>
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
          inStock ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-100'
        }`}>
          {inStock ? 'In Stock' : 'Out of Stock'}
        </span>
      </div>
    </div>
  );
};