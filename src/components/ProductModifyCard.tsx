
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductModifyHeader } from "./product/modify/ProductModifyHeader";
import { ProductModifyActions } from "./product/modify/ProductModifyActions";
import { ProductPublishSwitch } from "./product/modify/ProductPublishSwitch";
import { Badge } from "./ui/badge";
import { ImageLoader } from "./ImageLoader";
import { Product } from "@/types/product";
import { getStorageUrl } from "@/utils/storage";

interface ProductModifyCardProps {
  product: Product;
  onDelete: (productId: string) => Promise<void>;
  isAdmin?: boolean;
}

export const ProductModifyCard = ({ product, onDelete, isAdmin }: ProductModifyCardProps) => {
  const ownerName = product.profiles?.username || product.profiles?.full_name || 'Unknown User';
  const status = product.product_status || 'draft';
  
  // Get the public URL for the first product image or use placeholder
  const imageUrl = product.product_images?.[0]?.storage_path
    ? getStorageUrl(product.product_images[0].storage_path)
    : '/placeholder.svg';

  return (
    <div className="flex items-center gap-6 group">
      <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-white/30 shadow-sm bg-white/5">
        <ImageLoader
          src={imageUrl}
          alt={product.title || ''}
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
          width={128}
          height={128}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-xl font-semibold mb-1 text-white dark:text-white/90">
          {product.title}
        </h3>
        <p className="text-sm mb-1 text-white/60 dark:text-white/60">Owner: {ownerName}</p>
        <p className="text-white/70 dark:text-white/70 text-sm line-clamp-2 mb-3">{product.description}</p>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold bg-primary/20 text-primary-foreground dark:text-white px-3 py-1 rounded-full">
            ${product.price}
          </span>
          <Badge 
            variant={status === 'published' ? "default" : "secondary"} 
            className="rounded-full dark:text-white"
          >
            {status === 'published' ? 'Published' : 'Draft'}
          </Badge>
          {product.category && (
            <Badge 
              variant="outline" 
              className="rounded-full dark:border-white/20 dark:text-white/90"
            >
              {product.category}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-3 ml-4">
        <ProductModifyActions productId={product.id} onDelete={onDelete} />
        {isAdmin && (
          <ProductPublishSwitch 
            productId={product.id} 
            initialStatus={status} 
          />
        )}
      </div>
    </div>
  );
};
