
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
  onClick?: () => void;
}

export const ProductCardActions = ({
  session,
  isAdmin,
  product,
  onDelete,
  onClick,
}: ProductCardActionsProps) => {
  if (!session && !isAdmin) return null;

  return (
    <div className="px-4 pb-4 flex items-center justify-between">
      {isAdmin && (
        <div className="flex gap-4 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 h-10 w-10 p-0"
            onClick={onDelete}
          >
            <Trash2 className="w-5 h-5" />
          </Button>
          
          <Link 
            to={`/edit-product/${product.id}`} 
            onClick={(e) => e.stopPropagation()}
            className="inline-flex"
          >
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 h-10 w-10 p-0"
            >
              <Edit className="w-5 h-5" />
            </Button>
          </Link>
          
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/30 dark:hover:text-purple-400 h-10 w-10 p-0"
            onClick={onClick}
          >
            <Eye className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
};
