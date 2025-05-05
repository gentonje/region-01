
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { convertCurrency, SupportedCurrency } from "@/utils/currencyConverter";
import { ShoppingBag, Eye } from "lucide-react";

interface ProductCardContentProps {
  product: Product;
  selectedCurrency: SupportedCurrency;
  onAddToCart: (e: React.MouseEvent) => void;
}

export const ProductCardContent = ({ 
  product, 
  selectedCurrency,
  onAddToCart 
}: ProductCardContentProps) => {
  const { price = 0, currency = "SSP", title = "", view_count = 0 } = product;
  
  // Convert price to selected currency
  const convertedPrice = convertCurrency(price, currency || "SSP", selectedCurrency);
  const formattedPrice = Math.round(convertedPrice).toLocaleString();
  
  return (
    <div className="p-3 space-y-2">
      <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem] text-left">{title}</h3>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="font-bold text-base">
            {selectedCurrency} {formattedPrice}
          </p>
          
          {typeof view_count === 'number' && (
            <Badge variant="outline" className="flex gap-1 items-center bg-blue-50 text-blue-700 border-blue-200">
              <Eye className="h-3 w-3" />
              <span>{view_count}</span>
            </Badge>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className="px-2 py-1 h-8 border-primary/30 bg-primary/5 hover:bg-primary/10"
          onClick={onAddToCart}
          disabled={!product.in_stock}
        >
          <ShoppingBag className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Add</span>
        </Button>
      </div>
    </div>
  );
};
