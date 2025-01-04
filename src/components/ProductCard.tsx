import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { convertCurrency, SupportedCurrency } from "@/utils/currencyConverter";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  getProductImageUrl: (product: Product) => string;
  onClick?: () => void;
  selectedCurrency: SupportedCurrency;
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
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
  const convertedPrice = convertCurrency(
    product.price || 0,
    (product.currency || "SSP") as SupportedCurrency,
    selectedCurrency
  );

  return (
    <Card 
      className="w-full h-[380px] hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="px-0 space-y-1">
        <div 
          className="h-60 w-full relative"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          <img
            src={getProductImageUrl(product)}
            alt={product.title || ""}
            className="w-full h-full object-cover rounded-md mt-2"
            loading="lazy"
          />
          <div className="absolute bottom-2 right-2">
            <StarRating rating={product.average_rating || 0} />
          </div>
          <span className="absolute top-4 left-2 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
            {product.category}
          </span>
        </div>
        <div className="h-[28px] overflow-hidden flex items-center px-0 mx-1">
          <CardTitle className="text-sm font-medium truncate">{product.title}</CardTitle>
        </div>
        <p className="text-base font-semibold text-vivo-orange mx-1">
          {selectedCurrency} {convertedPrice.toFixed(2)}
        </p>
        <div className="h-[42px] overflow-hidden mx-3 my-2">
          <p className="text-xs text-muted-foreground line-clamp-2 px-2 py-1">{product.description}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pt-0 -mt-2">
        <span className={`text-xs px-2 py-1 rounded-full ${product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {product.in_stock ? 'In Stock' : 'Out of Stock'}
        </span>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;