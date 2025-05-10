
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
import { ProductCardContent } from "./ProductCardContent";
import { Skeleton } from "../ui/skeleton";

interface ProductSimilarProps {
  products: Product[];
  getProductImageUrl: (product: Product) => string;
  onProductClick: (product: Product) => void;
  selectedCurrency: SupportedCurrency;
  isLoading?: boolean;
}

const ProductSimilarSkeleton = () => (
  <div className="w-full">
    <div className="w-full rounded-xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1 shadow-sm">
      <Skeleton className="h-[120px] w-full" />
      <Skeleton className="h-5 w-2/3 m-1" />
      <Skeleton className="h-3 w-full m-1" />
      <div className="flex justify-between m-1 space-x-1">
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-12 rounded-md" />
      </div>
    </div>
  </div>
);

export const ProductSimilar = ({ 
  products, 
  getProductImageUrl, 
  onProductClick,
  selectedCurrency,
  isLoading = false
}: ProductSimilarProps) => {
  const { session } = useAuth();

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1">
          {[...Array(5)].map((_, index) => (
            <ProductSimilarSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!products?.length) return null;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1">
        {products.map((similarProduct) => {
          // Initialize wishlist functionality for each product
          const { isInWishlist, toggleWishlist, isPending } = useWishlistMutation(similarProduct.id);
          
          return (
            <div key={similarProduct.id} className="w-full">
              <Card 
                className="w-full overflow-hidden group relative transition-all duration-300 hover:shadow-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 cursor-pointer"
                onClick={() => onProductClick(similarProduct)}
              >
                {/* Product Image Section - Matching main card design */}
                <div className="w-full relative overflow-hidden bg-gray-100 dark:bg-gray-900 flex justify-center">
                  {/* Decorative orange element in top left */}
                  <div className="absolute top-0 left-0 z-0 bg-orange-500 h-10 w-20 rounded-r-lg opacity-90"></div>
                  
                  <AspectRatio ratio={4/3} className="bg-gray-100 dark:bg-gray-900 w-full">
                    <ImageLoader
                      src={getProductImageUrl(similarProduct)}
                      alt={similarProduct.title || ""}
                      className="w-full h-full object-contain opacity-100 dark:opacity-90"
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
                
                {/* Use the ProductCardContent component without add to cart button */}
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
