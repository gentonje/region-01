
import { Product } from "@/types/product";
import { CardContent, CardTitle } from "../ui/card";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { memo, useEffect, useState } from "react";
import { convertCurrency } from "@/utils/currencyConverter";
import { Badge } from "../ui/badge";

interface ProductCardContentProps {
  product: Product;
  selectedCurrency: SupportedCurrency;
}

export const ProductCardContent = memo(({ 
  product,
  selectedCurrency
}: ProductCardContentProps) => {
  const [convertedPrice, setConvertedPrice] = useState<number>(product.price || 0);
  const [isLoading, setIsLoading] = useState(false);

  // Update immediately when currency changes
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

  // Check if we need to show both prices
  const showBothPrices = product.currency !== selectedCurrency && product.currency;

  return (
    <CardContent className="p-1 space-y-1 m-1">
      <div className="pt-0">
        <CardTitle className="text-sm font-medium truncate text-gray-800 dark:text-gray-100 p-1 font-serif">
          {product.title}
        </CardTitle>
      </div>
      
      <div className="h-[20px] overflow-hidden p-1">
        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1 font-sans">
          {product.description}
        </p>
      </div>
      
      <div className="flex justify-between items-center pt-0 p-1 space-x-1">
        <div className="flex items-center space-x-1">
          {showBothPrices && (
            <span className="text-xs p-1 rounded-full bg-green-100 text-green-800 font-medium whitespace-nowrap inline-block">
              {product.currency} {Math.round(product.price || 0).toLocaleString()}
            </span>
          )}
          <span className={`text-xs p-1 rounded-full bg-orange-500 text-white font-bold whitespace-nowrap inline-block ${
            isLoading ? 'opacity-50' : ''
          }`}>
            {selectedCurrency} {Math.round(convertedPrice).toLocaleString()}
          </span>
        </div>
        
        {product.views !== undefined && product.views > 0 && (
          <Badge variant="secondary" className="text-xs">
            {Math.round(product.views)} Views
          </Badge>
        )}
      </div>
    </CardContent>
  );
});

ProductCardContent.displayName = 'ProductCardContent';
