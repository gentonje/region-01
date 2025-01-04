import { useState } from "react";
import { ChevronDown, ChevronRight, User } from "lucide-react";
import { ProductModifyCard } from "@/components/ProductModifyCard";
import { Product } from "@/types/product";

interface UserProductGroupProps {
  username: string;
  products: Product[];
  onDelete: (productId: string) => Promise<void>;
}

export const UserProductGroup = ({ username, products, onDelete }: UserProductGroupProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">{username}</h3>
          <span className="text-sm text-gray-500">({products.length} products)</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-500" />
        )}
      </div>
      
      {isExpanded && (
        <div className="p-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <ProductModifyCard
                key={product.id}
                product={product}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};