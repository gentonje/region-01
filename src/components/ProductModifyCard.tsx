
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductModifyHeader } from "./product/modify/ProductModifyHeader";
import { ProductModifyActions } from "./product/modify/ProductModifyActions";
import { ProductPublishSwitch } from "./product/modify/ProductPublishSwitch";
import { Badge } from "./ui/badge";
import { ImageLoader } from "./ImageLoader";
import { MapPin } from "lucide-react";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";
import { SupportedCurrency, convertCurrency } from "@/utils/currencyConverter";
import { getStorageUrl } from "@/utils/storage";

interface ProductModifyCardProps {
  product: Product;
  onDelete: (productId: string) => Promise<void>;
  isAdmin?: boolean;
}

export const ProductModifyCard = ({ product, onDelete, isAdmin }: ProductModifyCardProps) => {
  const ownerName = product.profiles?.username || product.profiles?.full_name || 'Unknown User';
  const status = product.product_status || 'draft';
  const [convertedPrice, setConvertedPrice] = useState<number>(product.price || 0);
  const productCurrency = (product.currency || "SSP") as SupportedCurrency;
  const [defaultCurrency, setDefaultCurrency] = useState<SupportedCurrency>("USD");
  
  // Convert price to display currency (USD by default if different from product currency)
  useEffect(() => {
    const updatePrice = async () => {
      // Only convert if currencies are different
      if (productCurrency !== defaultCurrency) {
        try {
          const converted = await convertCurrency(
            product.price || 0,
            productCurrency,
            defaultCurrency
          );
          setConvertedPrice(converted);
        } catch (error) {
          console.error('Error converting price:', error);
        }
      }
    };
    
    updatePrice();
  }, [product.price, productCurrency, defaultCurrency]);
  
  // Fix image URL generation with better debugging
  const getImageUrl = () => {
    try {
      // Log product image data to debug
      console.log('Product images:', product.product_images);
      
      if (!product.product_images || product.product_images.length === 0) {
        console.log('No product images found, using placeholder');
        return '/placeholder.svg';
      }
      
      const firstImage = product.product_images[0];
      if (!firstImage.storage_path) {
        console.log('Image has no storage path, using placeholder');
        return '/placeholder.svg';
      }
      
      const url = getStorageUrl(firstImage.storage_path);
      console.log('Generated image URL:', url);
      return url;
    } catch (error) {
      console.error('Error getting image URL:', error);
      return '/placeholder.svg';
    }
  };
  
  const imageUrl = getImageUrl();

  // Determine if we should show both prices
  const showBothPrices = productCurrency !== defaultCurrency;

  return (
    <div className="flex flex-col md:flex-row gap-1 space-x-1 space-y-1 p-1">
      <div className="w-full md:w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-white/30 shadow-sm">
        <ImageLoader
          src={imageUrl}
          alt={product.title || ''}
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
          width={128}
          height={128}
          priority={true}
          fallbackSrc="/placeholder.svg"
        />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <ProductModifyHeader title={product.title || ''} ownerName={ownerName} />
        
        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-1">
          {product.description}
        </p>
        <div className="flex flex-wrap items-center gap-1 space-x-1">
          {/* Show original price with currency */}
          <span className="text-base md:text-lg font-bold bg-primary/10 text-primary px-1 py-1 rounded-full">
            {productCurrency} {Math.round(product.price || 0).toLocaleString()}
          </span>
          
          {/* Show converted price if currencies are different */}
          {showBothPrices && (
            <span className="text-xs px-1 py-0.5 rounded-full bg-orange-500 text-white font-bold whitespace-nowrap inline-block">
              {defaultCurrency} {Math.round(convertedPrice).toLocaleString()}
            </span>
          )}
          
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
      <div className="flex flex-row md:flex-col items-center md:items-end justify-start md:justify-between gap-4 mt-1 md:mt-0 p-2">
        <ProductModifyActions productId={product.id} onDelete={onDelete} />
        {isAdmin && (
          <div className="mt-2 md:mt-4">
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
