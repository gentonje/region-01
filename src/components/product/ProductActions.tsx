
import { Button } from "../ui/button";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { useEffect, useState } from "react";
import { convertCurrency } from "@/utils/currencyConverter";

interface ProductActionsProps {
  price: number;
  currency: string;
  selectedCurrency: SupportedCurrency;
  convertedPrice: number;
  inStock: boolean;
  onAddToCart: () => void;
  isAddingToCart: boolean;
}

export const ProductActions = ({
  price,
  currency,
  selectedCurrency,
  convertedPrice,
  inStock,
  onAddToCart,
  isAddingToCart
}: ProductActionsProps) => {
  const [displayPrice, setDisplayPrice] = useState(convertedPrice);
  
  // Update display price when selected currency changes
  useEffect(() => {
    setDisplayPrice(convertedPrice);
  }, [convertedPrice, selectedCurrency]);

  return (
    <div className="flex justify-between items-center w-full">
      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
        {selectedCurrency} {Math.round(displayPrice).toLocaleString()}
      </p>
      <Button 
        onClick={onAddToCart}
        disabled={!inStock || isAddingToCart}
      >
        {isAddingToCart ? 'Adding...' : 'Add to Cart'}
      </Button>
    </div>
  );
};
