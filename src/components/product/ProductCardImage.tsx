
import { Heart } from "lucide-react";
import { Button } from "../ui/button";
import { ImageLoader } from "../ImageLoader";
import { Product } from "@/types/product";
import { Session } from "@supabase/supabase-js";
import { memo, useCallback, useState } from "react";
import { AspectRatio } from "../ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";

interface ProductCardImageProps {
  product: Product;
  imageUrl: string;
  showStatus?: boolean;
  session: Session | null;
  isAdmin: boolean;
  isInWishlist?: boolean;
  toggleWishlist: () => void;
  isPending: boolean;
  onClick?: () => void;
}

export const ProductCardImage = memo(({
  product,
  imageUrl,
  showStatus,
  session,
  isAdmin,
  isInWishlist,
  toggleWishlist,
  isPending,
  onClick,
}: ProductCardImageProps) => {
  // State to manage heart particles
  const [particles, setParticles] = useState<number[]>([]);

  // Handle wishlist button click with animation
  const handleWishlistClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Only create particles when adding to wishlist (not removing)
    if (!isInWishlist && !isPending) {
      // Create 5 particles for the burst effect
      setParticles([1, 2, 3, 4, 5]);
      
      // Clean up particles after animation completes
      setTimeout(() => {
        setParticles([]);
      }, 800);
    }
    
    toggleWishlist();
  }, [isInWishlist, isPending, toggleWishlist]);

  return (
    <div 
      className="w-full relative overflow-hidden cursor-pointer bg-gray-100 dark:bg-gray-900"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* Shop name badge at the top */}
      {product.shop_name && (
        <Badge 
          className="absolute top-1 left-1 z-10 bg-violet-600 text-white px-2 py-1 text-xs font-medium"
          variant="default"
        >
          {product.shop_name}
        </Badge>
      )}
      
      {/* Decorative orange element in top left with lower z-index */}
      <div className="absolute top-0 left-0 z-0 bg-orange-500 h-10 w-20 rounded-r-lg opacity-90"></div>
      
      {/* Using AspectRatio component for 4:3 ratio */}
      <AspectRatio ratio={1/1} className="bg-gray-100 dark:bg-gray-900">
        <ImageLoader
          src={imageUrl}
          alt={product.title || ""}
          className="w-full h-full object-contain opacity-100 dark:opacity-90" 
          width={400}
          height={300}
          priority={false}
          glowEffect={true}
        />
      </AspectRatio>
      
      {/* Display category and county in the same row */}
      <div className="absolute bottom-1 left-1 flex flex-row gap-1 max-w-[95%]">
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/90 text-white font-medium truncate button-glow">
          {product.category}
        </span>
        
        {product.county && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/90 text-white font-medium truncate flex items-center button-glow">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {product.county}
          </span>
        )}
      </div>
      
      {/* Stock status badge */}
      <span 
        className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full ${
          product.in_stock 
            ? 'bg-green-500/90 text-white button-glow' 
            : 'bg-red-500/90 text-white button-glow-destructive'
        }`}
      >
        {product.in_stock ? 'In Stock' : 'Out of Stock'}
      </span>
      
      {/* Product status badge */}
      {showStatus && (
        <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full ${
          product.product_status === 'published' 
            ? 'bg-green-500/90 text-white button-glow' 
            : 'bg-yellow-500/90 text-white button-glow-amber'
        }`}>
          {product.product_status === 'published' ? 'Published' : 'Unpublished'}
        </span>
      )}
      
      {/* Wishlist heart button */}
      {session && !isAdmin && (
        <div className="absolute top-2 left-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 button-shadow-none"
            onClick={handleWishlistClick}
            disabled={isPending}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart 
              className={`w-4 h-4 ${isInWishlist ? 'fill-amber-400 text-amber-400 wishlist-heart-active' : 'text-white'}`} 
            />
          </Button>
          
          {/* Render particles when active */}
          {particles.map((id) => (
            <div 
              key={`particle-${id}`} 
              className={`heart-particle heart-particle-${id}`} 
            />
          ))}
        </div>
      )}
    </div>
  );
});

ProductCardImage.displayName = 'ProductCardImage';
