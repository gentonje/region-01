
import { ArrowLeft, Star } from "lucide-react";
import { Button } from "../ui/button";
import { CardTitle } from "../ui/card";
import { BreadcrumbNav } from "../BreadcrumbNav";

interface ProductHeaderProps {
  title: string;
  category: string;
  averageRating: number;
  onBack: () => void;
  productId?: string;
}

export const StarRating = ({ rating }: { rating: number }) => {
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

export const ProductHeader = ({ title, category, averageRating, onBack, productId }: ProductHeaderProps) => {
  return (
    <div className="space-y-1">
      <BreadcrumbNav
        items={[
          { href: "/products", label: "Products" },
          { href: "/products?category=" + encodeURIComponent(category), label: category },
          { label: title, isCurrent: true }
        ]}
      />
      
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-1 p-1">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{category}</span>
        <StarRating rating={averageRating || 0} />
      </div>
    </div>
  );
};
