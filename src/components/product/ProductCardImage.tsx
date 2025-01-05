import { Product } from "@/types/product";
import { CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Heart } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import { SupportedCurrency } from "@/utils/currencyConverter";

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
  showStatus = false,
  session,
  isAdmin,
  isInWishlist,
  toggleWishlist,
  isPending,
  onClick,
}: ProductCardImageProps) => {
  return (
    <CardHeader className="relative p-0 pb-0 space-y-0 overflow-hidden group h-[200px]" onClick={onClick}>
      <div className="absolute inset-0 bg-black/20 transition-opacity opacity-0 group-hover:opacity-100 z-10" />
      <img
        src={imageUrl}
        alt={product.title}
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
      />
      {session && (
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-2 right-2 z-20 transition-opacity ${
            isInWishlist ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist();
          }}
          disabled={isPending}
        >
          <Heart
            className={`h-5 w-5 ${
              isInWishlist ? "fill-red-500 stroke-red-500" : "fill-none stroke-white"
            }`}
          />
        </Button>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
        <p className="text-white font-semibold">
          {selectedCurrency} {convertedPrice.toFixed(2)}
        </p>
        {showStatus && (
          <span 
            className={`text-xs px-3 py-1.5 rounded-full font-medium mt-1 inline-block
              ${product.in_stock 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              } transition-colors`}
          >
            {product.in_stock ? 'In Stock' : 'Out of Stock'}
          </span>
        )}
      </div>
    </CardHeader>
  );
};