
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
import { useCartMutations } from "@/hooks/useCartMutations";
import { toast } from "sonner";

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
  const { addItemMutation } = useCartMutations();

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

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation(); // Prevent clicking through to the product detail
    
    if (!product.in_stock) {
      toast.error('This product is out of stock');
      return;
    }
    
    addItemMutation.mutate({ 
      productId: product.id,
      quantity: 1
    });
  };

  if (!products?.length) return null;

  return (
    <div className="w-full mx-auto px-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-0 mx-0 px-0">
        {products.map((similarProduct) => {
          // Initialize wishlist functionality for each product
          const { isInWishlist, toggleWishlist, isPending } = useWishlistMutation(similarProduct.id);
          
          return (
            <div key={similarProduct.id} className="p-1 mx-0">
              <Card 
                className="w-full overflow-hidden group relative transition-all duration-300 hover:shadow-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 cursor-pointer"
                onClick={() => onProductClick(similarProduct)}
              >
                {/* Product Image Section - Matching main card design */}
                <div className="w-full relative overflow-hidden bg-gray-100 dark:bg-gray-900">
                  {/* Decorative orange element in top left */}
                  <div className="absolute top-0 left-0 z-0 bg-orange-500 h-10 w-20 rounded-r-lg opacity-90"></div>
                  
                  <AspectRatio ratio={4/3} className="bg-gray-100 dark:bg-gray-900">
                    <ImageLoader
                      src={getProductImageUrl(similarProduct)}
                      alt={similarProduct.title || ""}
                      className="w-full h-full object-cover opacity-100 dark:opacity-90"
                      width={400}
                      height={300}
                      priority={false}
                    />
                  </AspectRatio>
                  
                  <span className="absolute bottom-1 left-1 text-xs px-1 py-0.5 rounded-full bg-blue-500/90 text-white font-medium truncate max-w-[90%]">
                    {similarProduct.category}
                  </span>
                  
                  <span 
                    className={`absolute top-1 right-1 text-xs px-1 py-0.5 rounded-full ${
                      similarProduct.in_stock 
                        ? 'bg-green-500/90 text-white' 
                        : 'bg-red-500/90 text-white'
                    }`}
                  >
                    {similarProduct.in_stock ? 'In Stock' : 'Out of Stock'}
                  </span>

                  {/* Wishlist button - Ensure golden color when selected */}
                  {session && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 left-1 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist();
                      }}
                      disabled={isPending}
                    >
                      <Heart 
                        className={`w-4 h-4 ${isInWishlist ? 'fill-amber-400 text-amber-400' : 'text-white'}`} 
                      />
                    </Button>
                  )}
                </div>
                
                {/* Product Content Section */}
                <div className="p-1 space-y-1">
                  <div className="pt-0">
                    <h3 className="text-sm font-medium truncate text-gray-800 dark:text-gray-100 min-w-[100px] text-left">
                      {similarProduct.title}
                    </h3>
                  </div>
                  <div className="h-[20px] overflow-hidden">
                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1">
                      {similarProduct.description}
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-xs px-1 py-0.5 rounded-full bg-orange-500 text-white font-bold whitespace-nowrap inline-block">
                      {selectedCurrency} {Math.round(convertedPrices[similarProduct.id] || 0).toLocaleString()}
                    </span>
                    
                    <Button 
                      size="sm" 
                      className="h-7 px-1 py-0 text-xs"
                      variant="secondary"
                      onClick={(e) => handleAddToCart(e, similarProduct)}
                      disabled={!similarProduct.in_stock || addItemMutation.isPending}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};
