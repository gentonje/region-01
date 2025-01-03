import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  storage_path: string;
  currency: string;
  average_rating: number;
  category: string;
  in_stock: boolean;
  product_images: { storage_path: string; is_main: boolean }[];
}

interface ProductCardProps {
  product: Product;
  getProductImageUrl: (product: Product) => string;
  onClick?: () => void;
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

const ProductCard = ({ product, getProductImageUrl, onClick }: ProductCardProps) => (
  <Card 
    className="w-full h-[400px] hover:shadow-lg transition-shadow duration-200 cursor-pointer"
    onClick={onClick}
  >
    <CardContent className="px-0 space-y-2">
      <div className="h-60 w-full relative">
        <img
          src={getProductImageUrl(product)}
          alt={product.title}
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
      <div className="h-[32px] overflow-hidden m-1">
        <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
      </div>
      <div className="h-[32px] overflow-hidden flex items-center justify-between px-0 m-1">
        <CardTitle className="text-sm font-medium truncate">{product.title}</CardTitle>
        <span className={`text-xs px-2 py-1 rounded-full ${product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {product.in_stock ? 'In Stock' : 'Out of Stock'}
        </span>
      </div>
    </CardContent>
    <CardFooter className="h-[32px] flex items-center justify-between">
      <p className="text-base font-semibold text-vivo-orange ml-1">
        {product.currency} {product.price?.toFixed(2)}
      </p>
    </CardFooter>
  </Card>
);

export default ProductCard;