
import { Product } from "@/types/product";
import { CardContent, CardTitle } from "../ui/card";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { memo } from "react";

interface ProductCardContentProps {
  product: Product;
  selectedCurrency: SupportedCurrency;
  convertedPrice: number;
}

export const ProductCardContent = memo(({ 
  product,
  selectedCurrency,
  convertedPrice
}: ProductCardContentProps) => {
  return (
    <CardContent className="px-1 space-y-0.5 relative">
      <div className="pt-0.5">
        <CardTitle className="text-sm font-medium truncate text-gray-900 dark:text-gray-50 min-w-[100px] text-center max-w-[90%] mx-auto">
          {product.title}
        </CardTitle>
      </div>
      <div className="h-[32px] overflow-hidden">
        <p className="text-xs text-gray-700 dark:text-gray-200 line-clamp-2">
          {product.description}
        </p>
      </div>
      <div className="pt-0 -mt-2 text-center">
        <span className="text-xs px-2 py-0 rounded-full bg-white/80 backdrop-blur-sm text-orange-500 font-bold whitespace-nowrap border border-orange-500/50">
          {selectedCurrency} {Math.round(convertedPrice).toLocaleString()}
        </span>
      </div>
    </CardContent>
  );
});

ProductCardContent.displayName = 'ProductCardContent';

