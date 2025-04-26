
import { Product } from "@/types/product";
import { CardContent, CardTitle } from "../ui/card";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { memo, useEffect, useState } from "react";
import { convertCurrency } from "@/utils/currencyConverter";

interface ProductCardContentProps {
  product: Product;
  selectedCurrency: SupportedCurrency;
}

export const ProductCardContent = memo(({ 
  product,
  selectedCurrency,
}: ProductCardContentProps) => {
  const [convertedPrice, setConvertedPrice] = useState<number>(product.price || 0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const updatePrice = async () => {
      setIsLoading(true);
      try {
        const converted = await convertCurrency(
          product.price || 0,
          (product.currency || "SSP") as SupportedCurrency,
          selectedCurrency
        );
        setConvertedPrice(converted);
      } catch (error) {
        console.error('Error converting price:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    updatePrice();
  }, [product.price, product.currency, selectedCurrency]);

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
        <span className={`text-xs px-2 py-0.5 rounded-full bg-orange-500 text-white font-bold whitespace-nowrap inline-block ${
          isLoading ? 'opacity-50' : ''
        }`}>
          {selectedCurrency} {Math.round(convertedPrice).toLocaleString()}
        </span>
      </div>
    </CardContent>
  );
});

ProductCardContent.displayName = 'ProductCardContent';
