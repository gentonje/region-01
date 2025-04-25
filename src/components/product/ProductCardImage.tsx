
import { Heart } from "lucide-react";
import { Button } from "../ui/button";
import { ImageLoader } from "../ImageLoader";
import { Product } from "@/types/product";
import { Session } from "@supabase/supabase-js";
import { memo } from "react";
import { UseMutateFunction } from "@tanstack/react-query";

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
      className="h-36 sm:h-36 w-full relative overflow-hidden rounded-t-lg aspect-[4/3] sm:aspect-auto cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <ImageLoader
        src={imageUrl}
        alt={product.title || ""}
        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
        width={400}
        height={208}
        priority={false}
      />
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded-full bg-white/80 backdrop-blur-sm text-gray-900 font-medium min-w-[100px] text-center truncate max-w-[90%] border border-blue-500/50">
        {product.category}
      </span>
      <span 
        className={`absolute top-3 right-3 text-xs px-2 py-0 rounded-full backdrop-blur-sm font-medium ${
          product.in_stock 
            ? 'bg-green-100/80 text-green-800 border border-green-500/50' 
            : 'bg-red-100/80 text-red-800 border border-red-500/50'
        }`}
      >
        {product.in_stock ? 'In Stock' : 'Out of Stock'}
      </span>
      {showStatus && (
        <span className={`absolute top-3 left-3 text-xs px-2 py-1 rounded-full backdrop-blur-sm font-medium border border-neutral-100/50 ${
          product.product_status === 'published' 
            ? 'bg-green-100/80 text-green-800 border-green-500/50' 
            : 'bg-yellow-100/80 text-yellow-800 border-yellow-500/50'
        }`}>
          {product.product_status === 'published' ? 'Published' : 'Unpublished'}
        </span>
      )}
      {session && !isAdmin && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 -left-1 -mt-4 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white border border-neutral-200/50"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist();
          }}
          disabled={isPending}
        >
          <Heart 
            className={`w-4 h-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} 
          />
        </Button>
      )}
    </div>
  );
});

ProductCardImage.displayName = 'ProductCardImage';

