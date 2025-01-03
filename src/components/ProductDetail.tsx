import { ArrowLeft, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";

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

interface ProductDetailProps {
  product: Product;
  getProductImageUrl: (product: Product) => string;
  onBack: () => void;
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

const ProductDetail = ({ product, getProductImageUrl, onBack }: ProductDetailProps) => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-2xl">{product.title}</CardTitle>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{product.category}</span>
          <StarRating rating={product.average_rating || 0} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video relative rounded-lg overflow-hidden">
          <img
            src={getProductImageUrl(product)}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>
        <ScrollArea className="h-[200px] rounded-md border p-4">
          <p className="text-sm text-muted-foreground">{product.description}</p>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div>
          <p className="text-2xl font-bold text-vivo-orange">
            {product.currency} {product.price?.toFixed(2)}
          </p>
          <span className={`text-sm px-2 py-1 rounded-full ${
            product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {product.in_stock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
        <Button>Add to Cart</Button>
      </CardFooter>
    </Card>
  );
};

export default ProductDetail;