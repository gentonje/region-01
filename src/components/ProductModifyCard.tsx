import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductModifyHeader } from "./product/modify/ProductModifyHeader";
import { ProductModifyActions } from "./product/modify/ProductModifyActions";
import { ProductPublishSwitch } from "./product/modify/ProductPublishSwitch";

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
  isAdminOrSuper?: boolean;
}

export const ProductModifyCard = ({ product, onDelete, isAdminOrSuper }: ProductModifyCardProps) => {
  const ownerName = product.profiles?.username || product.profiles?.full_name || 'Unknown User';

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <ProductModifyHeader title={product.title} ownerName={ownerName} />
      <p className="text-gray-600 mb-4">{product.description}</p>
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">${product.price}</span>
          <ProductModifyActions productId={product.id} onDelete={onDelete} />
        </div>
        {isAdminOrSuper && (
          <div className="flex justify-end">
            <ProductPublishSwitch 
              productId={product.id} 
              initialStatus={product.product_status || 'draft'} 
            />
          </div>
        )}
      </div>
    </div>
  );
};