
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductModifyHeader } from "./product/modify/ProductModifyHeader";
import { ProductModifyActions } from "./product/modify/ProductModifyActions";
import { ProductPublishSwitch } from "./product/modify/ProductPublishSwitch";
import { Badge } from "./ui/badge";
import { ImageLoader } from "./ImageLoader";
import { MapPin } from "lucide-react";
import { Product } from "@/types/product";

interface ProductModifyCardProps {
  product: Product;
  onDelete: (productId: string) => Promise<void>;
  isAdmin?: boolean;
}

export const ProductModifyCard = ({ product, onDelete, isAdmin }: ProductModifyCardProps) => {
  const ownerName = product.profiles?.username || product.profiles?.full_name || 'Unknown User';
  const status = product.product_status || 'draft';
  
  // Get the public URL for the first product image or use placeholder
  const imageUrl = product.product_images?.[0]
    ? supabase.storage.from('images').getPublicUrl(product.product_images[0].storage_path).data.publicUrl
    : '/placeholder.svg';

  return (
    <div className="flex flex-col md:flex-row gap-1 space-x-1 space-y-1 p-1">
      <div className="w-full md:w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-white/30 shadow-sm">
        <ImageLoader
          src={imageUrl}
          alt={product.title || ''}
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
          width={128}
          height={128}
        />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <ProductModifyHeader title={product.title || ''} ownerName={ownerName} />
        
        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-1">
          {product.description}
        </p>
        <div className="flex flex-wrap items-center gap-1 space-x-1">
          <span className="text-base md:text-lg font-bold bg-primary/10 text-primary px-1 py-1 rounded-full">
            ${product.price}
          </span>
          <Badge variant={status === 'published' ? "default" : "secondary"} className="rounded-full text-xs">
            {status === 'published' ? 'Published' : 'Draft'}
          </Badge>
          {product.category && (
            <Badge variant="outline" className="rounded-full text-xs">
              {product.category}
            </Badge>
          )}
          {/* County badge - Kept in the same row as other badges */}
          {product.county && (
            <Badge variant="outline" className="rounded-full text-xs bg-green-50 text-green-700 border-green-200 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {product.county}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex flex-row md:flex-col items-center md:items-end justify-start md:justify-start gap-1 mt-1 md:mt-0 space-x-1 space-y-1">
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
