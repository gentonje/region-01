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
      <div className="flex items-center justify-between">
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
          <span className="text-sm font-medium text-gray-600">
            {averageRating.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="-mt-2">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm font-medium text-gray-800">{category}</p>
      </div>

      <div className="rounded-md border p-4 bg-gray-50/50">
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
          inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {inStock ? 'In Stock' : 'Out of Stock'}
        </span>
      </div>
    </div>
  );
};