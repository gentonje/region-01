
import { Product } from "@/types/product";
import { CardContent, CardTitle } from "../ui/card";
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
      <CardContent className="px-1 space-y-0.5 relative">
        <div className="pt-0.5">
          <CardTitle className="text-sm font-medium truncate text-gray-900 dark:text-gray-50 min-w-[100px] text-center max-w-[90%] mx-auto">
            {product.title}
          </CardTitle>
        </div>
        <div className="h-[32px] overflow-hidden">
          <p className="text-xs text-gray-700 dark:text-gray-200 line-clamp-2">{product.description}</p>
        </div>
        <div className="flex flex-col items-center gap-y-0">
          <span className="text-xs px-2 py-0 rounded-full bg-white/80 backdrop-blur-sm text-orange-500 font-bold whitespace-nowrap border border-orange-500/50">
            {selectedCurrency} {convertedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-0">
            by {product.profiles?.username || product.profiles?.full_name || "Unknown Seller"}
          </span>
        </div>
      </CardContent>
    </>
  );
};
