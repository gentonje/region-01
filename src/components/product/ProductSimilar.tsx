
import { Card } from "../ui/card";
import { Product } from "@/types/product";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { useState, useEffect } from "react";
import { ImageLoader } from "../ImageLoader";
import { MapPin, Heart } from "lucide-react";
import { Button } from "../ui/button";
import { AspectRatio } from "../ui/aspect-ratio";
import { useWishlistMutation } from "@/hooks/useWishlistMutation";
import { useAuth } from "@/contexts/AuthContext";
import { convertCurrency } from "@/utils/currencyConverter";
import { ProductCardContent } from "./ProductCardContent";

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
  const { session } = useAuth();

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
                  
                  {/* Display category and county in the same row */}
                  <div className="absolute bottom-1 left-1 flex flex-row gap-1 max-w-[90%]">
                    <span className="text-xs px-1 py-0.5 rounded-full bg-blue-500/90 text-white font-medium truncate">
                      {similarProduct.category}
                    </span>
                    
                    {similarProduct.county && (
                      <span className="text-xs px-1 py-0.5 rounded-full bg-green-500/90 text-white font-medium truncate flex items-center">
                        <MapPin className="h-2 w-2 mr-0.5" />
                        {similarProduct.county}
                      </span>
                    )}
                  </div>
                  
                  <span 
                    className={`absolute top-1 right-1 text-xs px-1 py-0.5 rounded-full ${
                      similarProduct.in_stock 
                        ? 'bg-green-500/90 text-white' 
                        : 'bg-red-500/90 text-white'
                    }`}
                  >
                    {similarProduct.in_stock ? 'In Stock' : 'Out of Stock'}
                  </span>

                  {/* Wishlist button */}
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
                
                {/* Use the same ProductCardContent component as the main product card */}
                <ProductCardContent 
                  product={similarProduct}
                  selectedCurrency={selectedCurrency}
                />
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};
