
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";
import { convertCurrency, SupportedCurrency } from "@/utils/currencyConverter";
import { Eye } from "lucide-react";

interface ProductCardContentProps {
  product: Product;
  selectedCurrency: SupportedCurrency;
  onAddToCart: (e: React.MouseEvent) => void;
}

export const ProductCardContent = ({ 
  product, 
  selectedCurrency
}: ProductCardContentProps) => {
  const { price = 0, currency = "SSP", title = "", view_count = 0 } = product;
  
  // Use synchronous conversion that returns a number directly
  const convertedPrice = convertCurrency(price, currency || "SSP", selectedCurrency);
  const formattedPrice = Math.round(convertedPrice).toLocaleString();
  
  return (
    <div className="p-3 space-y-2">
      <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem] text-left">{title}</h3>
      
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
          {currency} {Math.round(price).toLocaleString()}
        </Badge>
        
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          {selectedCurrency} {formattedPrice}
        </Badge>
        
        {typeof view_count === 'number' && (
          <Badge variant="outline" className="flex gap-1 items-center bg-blue-50 text-blue-700 border-blue-200">
            <Eye className="h-3 w-3" />
            <span>{view_count}</span>
          </Badge>
        )}
      </div>
    </div>
  );
};
