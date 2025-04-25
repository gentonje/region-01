
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
    <CardContent className="p-0 space-y-0.5">
      <div className="pt-0">
        <CardTitle className="text-sm font-medium truncate text-gray-100 min-w-[100px] text-left px-2">
          {product.title}
        </CardTitle>
      </div>
      <div className="h-[20px] overflow-hidden px-2">
        <p className="text-xs text-gray-300 line-clamp-1">
          {product.description}
        </p>
      </div>
      <div className="pt-0 px-2 pb-2">
        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500 text-white font-bold whitespace-nowrap inline-block">
          {selectedCurrency} {Math.round(convertedPrice).toLocaleString()}
        </span>
      </div>
    </CardContent>
  );
});

ProductCardContent.displayName = 'ProductCardContent';
