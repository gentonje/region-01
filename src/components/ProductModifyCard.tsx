
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductModifyHeader } from "./product/modify/ProductModifyHeader";
import { ProductModifyActions } from "./product/modify/ProductModifyActions";
import { ProductPublishSwitch } from "./product/modify/ProductPublishSwitch";
import { Badge } from "./ui/badge";

interface ProductModifyCardProps {
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    product_status?: string;
    profiles?: {
      username?: string;
      full_name?: string;
    };
  };
  onDelete: (productId: string) => Promise<void>;
  isAdmin?: boolean;
}

export const ProductModifyCard = ({ product, onDelete, isAdmin }: ProductModifyCardProps) => {
  const ownerName = product.profiles?.username || product.profiles?.full_name || 'Unknown User';
  const status = product.product_status || 'draft';

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <ProductModifyHeader title={product.title} ownerName={ownerName} />
      <p className="text-gray-600 mb-4">{product.description}</p>
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold">${product.price}</span>
            <Badge variant={status === 'published' ? "success" : "secondary"}>
              {status === 'published' ? 'Published' : 'Draft'}
            </Badge>
          </div>
          <ProductModifyActions productId={product.id} onDelete={onDelete} />
        </div>
        {isAdmin && (
          <div className="flex justify-end">
            <ProductPublishSwitch 
              productId={product.id} 
              initialStatus={status} 
            />
          </div>
        )}
      </div>
    </div>
  );
};
