
import { Session } from "@supabase/supabase-js";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Product } from "@/types/product";
import { Trash2, Edit, Eye } from "lucide-react";

interface ProductCardActionsProps {
  session: Session | null;
  isAdmin: boolean;
  product: Product;
  onDelete: (e: React.MouseEvent) => void;
  onAddToCart: (e: React.MouseEvent) => void;
  onClick?: () => void;
}

export const ProductCardActions = ({
  session,
  isAdmin,
  product,
  onDelete,
  onAddToCart,
  onClick,
}: ProductCardActionsProps) => {
  if (!session && !isAdmin) return null;

  return (
    <div className="px-4 pb-4 flex items-center justify-between">
      {!isAdmin && (
        <Button
          variant="outline"
          size="sm"
          className="rounded-full transition-all hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
          onClick={onAddToCart}
          disabled={!product.in_stock}
        >
          Add to Cart
        </Button>
      )}
      
      {isAdmin && (
        <div className="flex gap-2 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          
          <Link 
            to={`/edit-product/${product.id}`} 
            onClick={(e) => e.stopPropagation()}
            className="inline-flex"
          >
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
          
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/30 dark:hover:text-purple-400"
            onClick={onClick}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
