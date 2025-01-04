import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { convertCurrency, SupportedCurrency } from "@/utils/currencyConverter";
import { Product } from "@/types/product";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductCardProps {
  product: Product;
  getProductImageUrl: (product: Product) => string;
  onClick?: () => void;
  selectedCurrency: SupportedCurrency;
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={`${
            star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

const ProductCard = ({ product, getProductImageUrl, onClick, selectedCurrency }: ProductCardProps) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const convertedPrice = convertCurrency(
    product.price || 0,
    (product.currency || "SSP") as SupportedCurrency,
    selectedCurrency
  );

  // First try to find the main image from product_images
  const mainImage = product.product_images?.find(img => img.is_main === true);
  
  // If no main image is found in product_images, use the product's storage_path
  const imageUrl = mainImage 
    ? getProductImageUrl({ ...product, product_images: [mainImage] })
    : product.storage_path;

  return (
    <Card 
      className="w-full h-[380px] hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white/50 backdrop-blur-sm border-neutral-200/80"
      onClick={onClick}
    >
      <CardContent className="px-0 space-y-2 relative">
        <div 
          className="h-60 w-full relative overflow-hidden rounded-t-lg"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          {imageLoading && !imageError && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse">
              <Skeleton className="w-full h-full" />
            </div>
          )}
          <img
            src={imageUrl}
            alt={product.title || ""}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            loading="lazy"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <span className="text-gray-400">Image not available</span>
            </div>
          )}
          <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1">
            <StarRating rating={product.average_rating || 0} />
          </div>
          <span className="absolute top-3 left-3 text-xs px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm text-gray-800 font-medium">
            {product.category}
          </span>
        </div>
        <div className="px-4 pt-2">
          <CardTitle className="text-sm font-medium truncate text-gray-800">
            {product.title}
          </CardTitle>
        </div>
        <p className="text-base font-semibold text-orange-500 pl-4 pr-4">
          {selectedCurrency} {convertedPrice.toFixed(2)}
        </p>
        <div className="h-[42px] overflow-hidden">
          <p className="text-xs text-gray-600 line-clamp-2 px-4">{product.description}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pt-0 -mt-4">
        <span 
          className={`text-xs px-3 py-1.5 rounded-full font-medium 
            ${product.in_stock 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
            } transition-colors`}
        >
          {product.in_stock ? 'In Stock' : 'Out of Stock'}
        </span>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;