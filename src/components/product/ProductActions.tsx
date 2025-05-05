
import { Button } from "../ui/button";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { useEffect, useState } from "react";
import { convertCurrencyAsync, refreshCurrencyRates } from "@/utils/currencyConverter";
import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

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
      // Force a refresh of currency rates
      await refreshCurrencyRates();
      
      // Convert the price again with fresh rates
      const freshConvertedPrice = await convertCurrencyAsync(
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
      <motion.p 
        className="text-xl font-bold text-gray-900 dark:text-gray-100"
        key={displayPrice}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {selectedCurrency} {Math.round(displayPrice).toLocaleString()}
      </motion.p>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button 
          onClick={onAddToCart}
          disabled={!inStock || isAddingToCart}
          className="flex items-center space-x-1 bg-violet-600 hover:bg-violet-700 text-white"
        >
          <ShoppingCart className="h-4 w-4 mr-1" />
          {isAddingToCart ? 'Adding...' : 'Add to Cart'}
        </Button>
      </motion.div>
    </div>
  );
};
