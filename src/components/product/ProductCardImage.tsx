import { Heart } from "lucide-react";
import { Button } from "../ui/button";
import { ImageLoader } from "../ImageLoader";
import { Product } from "@/types/product";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { Session } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { convertCurrency } from "@/utils/currencyConverter";

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
  const [displayPrice, setDisplayPrice] = useState<string>("...");

  useEffect(() => {
    const updatePrice = async () => {
      try {
        const converted = await convertCurrency(
          product.price || 0,
          product.currency || "USD",
          selectedCurrency
        );
        setDisplayPrice(converted.toFixed(2));
      } catch (error) {
        console.error("Error converting price:", error);
        setDisplayPrice((product.price || 0).toFixed(2));
      }
    };
    updatePrice();
  }, [product.price, product.currency, selectedCurrency]);

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
      <span className="absolute top-3 right-3 text-sm px-2 py-1 rounded-full bg-white/80 backdrop-blur-sm text-orange-500 font-medium whitespace-nowrap z-50 border border-neutral-100/50">
        {selectedCurrency} {displayPrice}
      </span>
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded-full bg-white/80 backdrop-blur-sm text-gray-800 font-medium min-w-[100px] text-center truncate max-w-[90%] border border-neutral-100/50">
        {product.category}
      </span>
      {showStatus && (
        <span className={`absolute top-3 left-3 text-xs px-2 py-1 rounded-full backdrop-blur-sm font-medium border border-neutral-100/50 ${
          product.product_status === 'published' 
            ? 'bg-green-100/80 text-green-800' 
            : 'bg-yellow-100/80 text-yellow-800'
        }`}>
          {product.product_status === 'published' ? 'Published' : 'Unpublished'}
        </span>
      )}
      {session && !isAdmin && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
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