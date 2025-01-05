import { Button } from "@/components/ui/button";
import { ArrowLeft, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  onBack,
}: ProductInfoProps) => {
  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600 dark:text-gray-300"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="ml-1 text-sm text-gray-600 dark:text-gray-300">
              {averageRating.toFixed(1)}
            </span>
          </div>
          <Badge variant={inStock ? "default" : "destructive"}>
            {inStock ? "In Stock" : "Out of Stock"}
          </Badge>
        </div>

        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{category}</p>
      </div>

      <div className="rounded-md border border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800/50 mt-4 mb-2">
        <p className="text-sm text-gray-500 dark:text-gray-300 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};