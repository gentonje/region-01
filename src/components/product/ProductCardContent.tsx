import { Product } from "@/types/product";
import { CardContent, CardFooter, CardTitle } from "../ui/card";
import { SupportedCurrency } from "@/utils/currencyConverter";

interface ProductCardContentProps {
  product: Product;
  selectedCurrency: SupportedCurrency;
  convertedPrice: number;
}

export const ProductCardContent = ({ 
  product,
  selectedCurrency,
  convertedPrice
}: ProductCardContentProps) => {
  return (
    <>
      <CardContent className="px-4 space-y-1 relative">
        <div className="pt-1">
          <CardTitle className="text-sm font-medium truncate text-gray-900 dark:text-gray-50 min-w-[100px] text-center max-w-[90%] mx-auto">
            {product.title}
          </CardTitle>
        </div>
        <div className="h-[42px] overflow-hidden">
          <p className="text-xs text-gray-700 dark:text-gray-200 line-clamp-2">{product.description}</p>
        </div>
        <div className="pt-0 text-center">
          <span className="text-xs px-2 py-0 rounded-full bg-white/80 backdrop-blur-sm text-orange-500 font-medium whitespace-nowrap border border-orange-500/50">
            {selectedCurrency} {convertedPrice.toFixed(2)}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center absolute bottom-0 left-0 right-0 -mb-8">
        <span 
          className={`text-xs px-3 py-1.5 rounded-full font-medium 
            ${product.in_stock 
              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
              : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
            } transition-colors`}
        >
          {product.in_stock ? 'In Stock' : 'Out of Stock'}
        </span>
      </CardFooter>
    </>
  );
};