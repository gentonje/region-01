import { Heart } from "lucide-react";
import { Button } from "../ui/button";
import { ImageLoader } from "../ImageLoader";
import { Product } from "@/types/product";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { Session } from "@supabase/supabase-js";

interface ProductCardImageProps {
  product: Product;
  imageUrl: string;
  selectedCurrency: SupportedCurrency;
  convertedPrice: number;
  showStatus?: boolean;
  session: Session | null;
  isAdmin: boolean;
  isInWishlist?: boolean;
  toggleWishlist: () => void;
  isPending: boolean;
  onClick?: () => void;
}

export const ProductCardImage = ({
  product,
  imageUrl,
  selectedCurrency,
  convertedPrice,
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
      className="h-52 w-full relative overflow-hidden rounded-t-lg"
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
      <div className="absolute top-3 w-full px-3 flex justify-end items-center">
        <span className="text-sm px-2 py-1 rounded-full bg-white/80 backdrop-blur-sm text-orange-500 font-medium whitespace-nowrap border border-orange-500/50">
          {selectedCurrency} {convertedPrice.toFixed(2)}
        </span>
      </div>
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded-full bg-white/80 backdrop-blur-sm text-gray-900 font-medium min-w-[100px] text-center truncate max-w-[90%] border border-blue-500/50">
        {product.category}
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
          className="absolute top-3 left-3 -mt-4 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white border border-neutral-200/50"
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
};