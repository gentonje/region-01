import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { convertCurrency, SupportedCurrency } from "@/utils/currencyConverter";
import { Product } from "@/types/product";
import { PRODUCT_COLORS, PRODUCT_CONSTANTS } from "@/constants/product";

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
          className={star <= rating ? PRODUCT_COLORS.starActive : PRODUCT_COLORS.starInactive}
        />
      ))}
    </div>
  );
};

const ProductCard = ({ product, getProductImageUrl, onClick, selectedCurrency }: ProductCardProps) => {
  const convertedPrice = convertCurrency(
    product.price || 0,
    (product.currency || "SSP") as SupportedCurrency,
    selectedCurrency
  );

  const mainImage = product.product_images?.find(img => img.is_main);
  const imageToUse = mainImage || product.product_images?.[0];
  const imageUrl = imageToUse 
    ? getProductImageUrl({ ...product, product_images: [imageToUse] }) 
    : getProductImageUrl(product);

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
          <img
            src={imageUrl}
            alt={product.title || ""}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1">
            <StarRating rating={product.average_rating || 0} />
          </div>
          <span className="absolute top-3 left-3 text-xs px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm text-gray-800 font-medium">
            {product.category}
          </span>
        </div>
        <div className="px-4 pt-2">
          <CardTitle className={`text-sm font-medium truncate ${PRODUCT_COLORS.title}`}>
            {product.title}
          </CardTitle>
        </div>
        <p className="text-base font-semibold text-orange-500 pl-4 pr-4">
          {selectedCurrency} {convertedPrice.toFixed(2)}
        </p>
        <div className="h-[42px] overflow-hidden">
          <p className={`text-xs line-clamp-2 px-4 ${PRODUCT_COLORS.description}`}>
            {product.description}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pt-0 -mt-4">
        <span 
          className={`text-xs px-3 py-1.5 rounded-full font-medium 
            ${product.in_stock 
              ? `${PRODUCT_COLORS.inStock.bg} ${PRODUCT_COLORS.inStock.text}` 
              : `${PRODUCT_COLORS.outOfStock.bg} ${PRODUCT_COLORS.outOfStock.text}`
            } transition-colors`}
        >
          {product.in_stock ? PRODUCT_CONSTANTS.STOCK_STATUS.IN_STOCK : PRODUCT_CONSTANTS.STOCK_STATUS.OUT_OF_STOCK}
        </span>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;