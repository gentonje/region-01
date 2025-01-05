import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { convertCurrency, SupportedCurrency } from "@/utils/currencyConverter";
import { Product } from "@/types/product";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ImageLoader } from "./ImageLoader";
import { WishlistButton } from "./WishlistButton";
import { useEffect } from "react";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  getProductImageUrl: (product: Product) => string;
  onClick?: () => void;
  selectedCurrency: SupportedCurrency;
  showStatus?: boolean;
}

const ProductCard = ({
  product,
  getProductImageUrl,
  onClick,
  selectedCurrency,
  showStatus = false
}: ProductCardProps) => {
  const { data: owner } = useQuery({
    queryKey: ['profile', product.user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', product.user_id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    },
    enabled: !!product.user_id
  });

  const recordViewMutation = useMutation({
    mutationFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
          .from('product_views')
          .insert({
            product_id: product.id,
            viewer_id: user?.id || null,
            ip_address: null
          })
          .single();

        if (error) {
          // Ignore unique constraint violations (duplicate daily views)
          if (error.code === '23505') {
            return;
          }
          throw error;
        }
      } catch (error: any) {
        // Handle network errors or other issues
        if (error.code === '23505') {
          return; // Silently ignore duplicate views
        }
        if (error.message === 'Failed to fetch') {
          console.warn('Network error while recording view:', error);
          return; // Silently ignore network errors
        }
        throw error;
      }
    },
    onError: (error: any) => {
      // Only show error toast for non-duplicate view errors and non-network errors
      if (error.code !== '23505' && error.message !== 'Failed to fetch') {
        console.error('Error recording view:', error);
        toast.error('Failed to record product view');
      }
    }
  });

  useEffect(() => {
    if (product.id) {
      recordViewMutation.mutate();
    }
  }, [product.id]);

  const convertedPrice = convertCurrency(
    product.price || 0,
    (product.currency || "SSP") as SupportedCurrency,
    selectedCurrency
  );

  const getImageUrl = () => {
    const mainImage = product.product_images?.find(img => img.is_main === true);
    if (mainImage?.storage_path) {
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(mainImage.storage_path);
      return data.publicUrl;
    }
    return "/placeholder.svg";
  };

  const imageUrl = getImageUrl();

  return (
    <Card
      className="w-full h-[323px] hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white/50 backdrop-blur-sm border-neutral-200/80"
      onClick={onClick}
    >
      <CardContent className="px-0 space-y-2 relative">
        <div
          className="h-52 w-full relative overflow-hidden rounded-t-lg"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          <ImageLoader
            src={imageUrl}
            alt={product.title || ""}
            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
            width={400}
            height={208}
            priority={false}
          />
          <span className="absolute top-3 left-3 text-sm px-2 py-1 rounded-full bg-white/80 backdrop-blur-sm text-orange-500 font-medium whitespace-nowrap z-50 border border-neutral-100/50">
            {selectedCurrency} {convertedPrice.toFixed(2)}
          </span>
          <WishlistButton productId={product.id} className="absolute top-3 right-3" />
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded-full bg-white/80 backdrop-blur-sm text-gray-800 font-medium min-w-[100px] text-center truncate max-w-[90%] border border-neutral-100/50">
            {product.category}
          </span>
          {showStatus && (
            <span className={`absolute top-3 left-3 text-xs px-2 py-1 rounded-full backdrop-blur-sm font-medium border border-neutral-100/50 ${
              product.product_status === 'published'
                ? 'bg-green-100/80 text-green-800'
                : 'bg-yellow-100/80 text-yellow-800'
            }`}>
              {product.product_status === 'published' ? 'Published' : 'Unpublished'}
            </span>
          )}
        </div>
        <div className="px-4 pt-1">
          <CardTitle className="text-sm font-medium truncate text-gray-800 min-w-[100px] text-center max-w-[90%] mx-auto">
            {product.title}
          </CardTitle>
        </div>
        <div className="h-[42px] overflow-hidden">
          <p className="text-xs text-gray-600 line-clamp-2 px-4">{product.description}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pt-0 -mt-4">
        <span
          className={`text-xs px-3 py-1.5 rounded-full font-medium 
            ${product.in_stock
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
            } transition-colors`}
        >
          {product.in_stock ? 'In Stock' : 'Out of Stock'}
        </span>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;