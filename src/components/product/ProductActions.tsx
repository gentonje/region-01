import { Button } from "../ui/button";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { useEffect, useState } from "react";
import { convertCurrency, refreshCurrencyRates } from "@/utils/currencyConverter";
import { ShoppingCart } from "lucide-react";

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
  
  // Update display price immediately when selected currency changes
  useEffect(() => {
    const updatePrice = async () => {
      // If selected currency is SSP, use the exact database price
      if (selectedCurrency === "SSP") {
        setDisplayPrice(price);
        return;
      }
      
      // Otherwise, refresh rates and convert from SSP to the selected currency
      await refreshCurrencyRates();
      
      // Convert the price with fresh rates
      const freshConvertedPrice = await convertCurrency(
        price,
        currency as SupportedCurrency,
        selectedCurrency
      );
      
      setDisplayPrice(freshConvertedPrice);
    };
    
    updatePrice();
  }, [convertedPrice, selectedCurrency, price, currency]);

  return (
    <div className="flex justify-between items-center w-full p-1 border-t border-gray-200 dark:border-gray-700">
      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
        {selectedCurrency} {Math.round(displayPrice).toLocaleString()}
      </p>
      <Button 
        onClick={onAddToCart}
        disabled={!inStock || isAddingToCart}
        className="flex items-center space-x-1"
      >
        <ShoppingCart className="h-4 w-4 mr-1" />
        {isAddingToCart ? 'Adding...' : 'Add to Cart'}
      </Button>
    </div>
  );
};
