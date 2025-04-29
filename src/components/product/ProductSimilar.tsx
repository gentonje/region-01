
import { Card } from "../ui/card";
import { Product } from "@/types/product";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { convertCurrency, refreshCurrencyRates } from "@/utils/currencyConverter";
import { useState, useEffect } from "react";
import { ImageLoader } from "../ImageLoader";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "../ui/button";
import { AspectRatio } from "../ui/aspect-ratio";
import { useWishlistMutation } from "@/hooks/useWishlistMutation";
import { useAuth } from "@/contexts/AuthContext";

interface ProductSimilarProps {
  products: Product[];
  getProductImageUrl: (product: Product) => string;
  onProductClick: (product: Product) => void;
  selectedCurrency: SupportedCurrency;
}

export const ProductSimilar = ({ 
  products, 
  getProductImageUrl, 
  onProductClick,
  selectedCurrency 
}: ProductSimilarProps) => {
  const [convertedPrices, setConvertedPrices] = useState<Record<string, number>>({});
  const { session } = useAuth();

  // Update prices immediately when selectedCurrency changes
  useEffect(() => {
    const updatePrices = async () => {
      // Force refresh currency rates when currency changes
      await refreshCurrencyRates();
      
      const prices: Record<string, number> = {};
      for (const product of products) {
        prices[product.id] = await convertCurrency(
          product.price || 0,
          (product.currency || "SSP") as SupportedCurrency,
          selectedCurrency
        );
      }
      setConvertedPrices(prices);
    };
    updatePrices();
  }, [products, selectedCurrency]);

  if (!products?.length) return null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {products.map((similarProduct) => {
          // Initialize wishlist functionality for each product
          const { isInWishlist, toggleWishlist, isPending } = useWishlistMutation(similarProduct.id);
          
          return (
            <Card 
              key={similarProduct.id}
              className="w-full overflow-hidden group relative transition-all duration-300 hover:shadow-xl bg-gray-900 border-gray-800 cursor-pointer"
              onClick={() => onProductClick(similarProduct)}
            >
              {/* Product Image Section - Matching main card design */}
              <div className="w-full relative overflow-hidden bg-gray-900">
                {/* Decorative orange element in top left */}
                <div className="absolute top-0 left-0 z-0 bg-orange-500 h-10 w-20 rounded-r-lg opacity-90"></div>
                
                <AspectRatio ratio={4/3} className="bg-gray-900">
                  <ImageLoader
                    src={getProductImageUrl(similarProduct)}
                    alt={similarProduct.title || ""}
                    className="w-full h-full object-cover opacity-90"
                    width={400}
                    height={300}
                    priority={false}
                  />
                </AspectRatio>
                
                <span className="absolute bottom-1 left-2 text-xs px-2 py-0.5 rounded-full bg-blue-500/90 text-white font-medium truncate max-w-[90%]">
                  {similarProduct.category}
                </span>
                
                <span 
                  className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full ${
                    similarProduct.in_stock 
                      ? 'bg-green-500/90 text-white' 
                      : 'bg-red-500/90 text-white'
                  }`}
                >
                  {similarProduct.in_stock ? 'In Stock' : 'Out of Stock'}
                </span>

                {/* Wishlist button - added to match main card */}
                {session && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist();
                    }}
                    disabled={isPending}
                  >
                    <Heart 
                      className={`w-4 h-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-white'}`} 
                    />
                  </Button>
                )}
              </div>
              
              {/* Product Content Section */}
              <div className="p-2 space-y-1">
                <div className="pt-0">
                  <h3 className="text-sm font-medium truncate text-gray-100 min-w-[100px] text-left">
                    {similarProduct.title}
                  </h3>
                </div>
                <div className="h-[20px] overflow-hidden">
                  <p className="text-xs text-gray-300 line-clamp-1">
                    {similarProduct.description}
                  </p>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500 text-white font-bold whitespace-nowrap inline-block">
                    {selectedCurrency} {Math.round(convertedPrices[similarProduct.id] || 0).toLocaleString()}
                  </span>
                  
                  <Button 
                    size="sm" 
                    className="h-7 px-3 py-0 text-xs"
                    variant="secondary"
                  >
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
