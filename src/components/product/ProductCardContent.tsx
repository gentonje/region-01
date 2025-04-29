
import { Product } from "@/types/product";
import { CardContent, CardTitle } from "../ui/card";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { memo, useEffect, useState } from "react";
import { convertCurrency } from "@/utils/currencyConverter";
import { Button } from "../ui/button";
import { ShoppingCart } from "lucide-react";

interface ProductCardContentProps {
  product: Product;
  selectedCurrency: SupportedCurrency;
  onAddToCart?: (e: React.MouseEvent) => void;
}

export const ProductCardContent = memo(({ 
  product,
  selectedCurrency,
  onAddToCart
}: ProductCardContentProps) => {
  const [convertedPrice, setConvertedPrice] = useState<number>(product.price || 0);
  const [isLoading, setIsLoading] = useState(false);

  // Use both product price and selectedCurrency as dependencies to trigger updates
  useEffect(() => {
    const updatePrice = async () => {
      setIsLoading(true);
      try {
        console.log(`Converting price for ${product.title} from ${product.currency} to ${selectedCurrency}`);
        const converted = await convertCurrency(
          product.price || 0,
          (product.currency || "SSP") as SupportedCurrency,
          selectedCurrency
        );
        console.log(`Converted price: ${converted}`);
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
      <div className="flex justify-between items-center pt-0 px-2 pb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full bg-orange-500 text-white font-bold whitespace-nowrap inline-block ${
          isLoading ? 'opacity-50' : ''
        }`}>
          {selectedCurrency} {Math.round(convertedPrice).toLocaleString()}
        </span>
        
        <Button 
          size="sm" 
          className="h-7 px-2 py-0 text-xs"
          variant="secondary"
          onClick={onAddToCart}
          disabled={!product.in_stock}
        >
          <ShoppingCart className="h-3 w-3 mr-1" />
          Add
        </Button>
      </div>
    </CardContent>
  );
});

ProductCardContent.displayName = 'ProductCardContent';
