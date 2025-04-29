
import { Heart } from "lucide-react";
import { Button } from "../ui/button";
import { ImageLoader } from "../ImageLoader";
import { Product } from "@/types/product";
import { Session } from "@supabase/supabase-js";
import { memo } from "react";
import { AspectRatio } from "../ui/aspect-ratio";

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
  return (
    <div 
      className="w-full relative overflow-hidden cursor-pointer bg-gray-900"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* Decorative orange element in top left with lower z-index */}
      <div className="absolute top-0 left-0 z-0 bg-orange-500 h-10 w-20 rounded-r-lg opacity-90"></div>
      
      {/* Using AspectRatio component for 4:3 ratio */}
      <AspectRatio ratio={4/3} className="bg-gray-900">
        <ImageLoader
          src={imageUrl}
          alt={product.title || ""}
          className="w-full h-full object-cover opacity-90"
          width={400}
          height={300}
          priority={false}
        />
      </AspectRatio>
      
      <span className="absolute bottom-1 left-2 text-xs px-2 py-0.5 rounded-full bg-blue-500/90 text-white font-medium truncate max-w-[90%] m-1">
        {product.category}
      </span>
      
      <span 
        className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full ${
          product.in_stock 
            ? 'bg-green-500/90 text-white' 
            : 'bg-red-500/90 text-white'
        } m-1`}
      >
        {product.in_stock ? 'In Stock' : 'Out of Stock'}
      </span>
      
      {showStatus && (
        <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full ${
          product.product_status === 'published' 
            ? 'bg-green-500/90 text-white' 
            : 'bg-yellow-500/90 text-white'
        } m-1`}>
          {product.product_status === 'published' ? 'Published' : 'Unpublished'}
        </span>
      )}
      
      {session && !isAdmin && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 z-10 m-1"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist();
          }}
          disabled={isPending}
        >
          <Heart 
            className={`w-4 h-4 ${isInWishlist ? 'fill-amber-400 text-amber-400 wishlist-heart-active' : 'text-white wishlist-heart-inactive'}`} 
          />
        </Button>
      )}
    </div>
  );
});

ProductCardImage.displayName = 'ProductCardImage';
