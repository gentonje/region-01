import { Product } from "@/types/product";
import { CardContent, CardFooter, CardTitle } from "../ui/card";

interface ProductCardContentProps {
  product: Product;
}

export const ProductCardContent = ({ product }: ProductCardContentProps) => {
  return (
    <>
      <CardContent className="px-0 space-y-2 relative bg-white/80 dark:bg-white/90">
        <div className="px-4 pt-1">
          <CardTitle className="text-sm font-medium truncate text-gray-800 dark:text-slate-700 min-w-[100px] text-center max-w-[90%] mx-auto">
            {product.title}
          </CardTitle>
        </div>
        <div className="h-[42px] overflow-hidden">
          <p className="text-xs text-gray-600 dark:text-slate-600 line-clamp-2 px-4">{product.description}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center -mt-4">
        <span 
          className={`text-xs px-3 py-1.5 rounded-full font-medium 
            ${product.in_stock 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            } transition-colors`}
        >
          {product.in_stock ? 'In Stock' : 'Out of Stock'}
        </span>
      </CardFooter>
    </>
  );
};