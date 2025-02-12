
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductModifyHeader } from "./product/modify/ProductModifyHeader";
import { ProductModifyActions } from "./product/modify/ProductModifyActions";
import { ProductPublishSwitch } from "./product/modify/ProductPublishSwitch";
import { Badge } from "./ui/badge";
import { ImageLoader } from "./ImageLoader";

interface ProductModifyCardProps {
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    product_status?: string;
    product_images?: { url: string }[];
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
  const imageUrl = product.product_images?.[0]?.url || '/placeholder.svg';

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 flex-shrink-0">
          <ImageLoader
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover rounded"
            width={80}
            height={80}
          />
        </div>
        <div className="flex-1 min-w-0">
          <ProductModifyHeader title={product.title} ownerName={ownerName} />
          <p className="text-gray-600 text-sm truncate mb-2">{product.description}</p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">${product.price}</span>
            <Badge variant={status === 'published' ? "default" : "secondary"}>
              {status === 'published' ? 'Published' : 'Draft'}
            </Badge>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <ProductModifyActions productId={product.id} onDelete={onDelete} />
          {isAdmin && (
            <ProductPublishSwitch 
              productId={product.id} 
              initialStatus={status} 
            />
          )}
        </div>
      </div>
    </div>
  );
};
