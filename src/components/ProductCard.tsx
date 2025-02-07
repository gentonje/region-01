
import { Card } from "@/components/ui/card";
import { convertCurrency, SupportedCurrency } from "@/utils/currencyConverter";
import { Product } from "@/types/product";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ProductCardImage } from "./product/ProductCardImage";
import { ProductCardContent } from "./product/ProductCardContent";
import { useEffect, useState } from "react";

interface ProductCardProps {
  product: Product;
  getProductImageUrl: (product: Product) => string;
  onClick?: () => void;
  selectedCurrency: SupportedCurrency;
  showStatus?: boolean;
  onDelete?: (productId: string) => Promise<void>;
  isAdmin?: boolean;
}

const ProductCard = ({ 
  product, 
  getProductImageUrl, 
  onClick, 
  selectedCurrency,
  showStatus = false,
  onDelete,
  isAdmin: isAdminProp 
}: ProductCardProps) => {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: userType } = useQuery({
    queryKey: ['userType', session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return null;
      
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', session.user.id);

        if (error) {
          console.error('Error fetching user type:', error);
          return null;
        }

        return profiles?.[0]?.user_type || null;
      } catch (error) {
        console.error('Unexpected error fetching user type:', error);
        return null;
      }
    },
    enabled: !!session?.user
  });

  const isAdmin = userType === 'admin';

  const { data: owner } = useQuery({
    queryKey: ['profile', product.user_id],
    queryFn: async () => {
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('id', product.user_id);
        
        if (error) {
          console.error('Error fetching profile:', error);
          return null;
        }
        return profiles?.[0] || null;
      } catch (error) {
        console.error('Unexpected error fetching owner profile:', error);
        return null;
      }
    },
    enabled: !!product.user_id
  });

  const { data: isInWishlist, error: wishlistError } = useQuery({
    queryKey: ['wishlist', product.id, session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return false;

      try {
        const { data: wishlist, error } = await supabase
          .from('wishlists')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') return false;
          console.error('Error fetching wishlist:', error);
          return false;
        }

        if (!wishlist) return false;

        const { data: wishlistItems, error: itemError } = await supabase
          .from('wishlist_items')
          .select('id')
          .eq('wishlist_id', wishlist.id)
          .eq('product_id', product.id);

        if (itemError) {
          console.error('Error fetching wishlist item:', itemError);
          return false;
        }

        return wishlistItems.length > 0;
      } catch (error) {
        console.error('Wishlist query error:', error);
        return false;
      }
    },
    enabled: !!session?.user && !!product.id,
    retry: false
  });

  const toggleWishlist = useMutation({
    mutationFn: async () => {
      if (!session?.user) {
        throw new Error('Please login to add items to wishlist');
      }

      const { data: existingWishlist, error: wishlistError } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (wishlistError && wishlistError.code !== 'PGRST116') {
        console.error('Error fetching wishlist:', wishlistError);
        throw new Error('Failed to access wishlist');
      }

      let wishlistId;
      if (!existingWishlist) {
        const { data: newWishlist, error: createError } = await supabase
          .from('wishlists')
          .insert({
            user_id: session.user.id,
            name: 'My Wishlist',
            visibility: 'private'
          })
          .select()
          .single();

        if (createError) throw createError;
        wishlistId = newWishlist.id;
      } else {
        wishlistId = existingWishlist.id;
      }

      if (isInWishlist) {
        const { error: removeError } = await supabase
          .from('wishlist_items')
          .delete()
          .eq('wishlist_id', wishlistId)
          .eq('product_id', product.id);

        if (removeError) throw removeError;
      } else {
        const { error: addError } = await supabase
          .from('wishlist_items')
          .insert({
            wishlist_id: wishlistId,
            product_id: product.id
          });

        if (addError) throw addError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
    },
    onError: (error) => {
      console.error('Error toggling wishlist:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update wishlist');
      }
    }
  });

  const [convertedPrice, setConvertedPrice] = useState<number>(product.price || 0);

  useEffect(() => {
    const updatePrice = async () => {
      const converted = await convertCurrency(
        product.price || 0,
        (product.currency || "SSP") as SupportedCurrency,
        selectedCurrency
      );
      setConvertedPrice(converted);
    };
    updatePrice();
  }, [product.price, product.currency, selectedCurrency]);

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

  if (wishlistError) {
    console.error('Wishlist error:', wishlistError);
  }

  return (
    <Card 
      className="w-full h-[323px] hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white/50 dark:bg-gray-700/90 backdrop-blur-sm border-neutral-200/80 dark:border-gray-600"
      onClick={onClick}
    >
      <ProductCardImage
        product={product}
        imageUrl={imageUrl}
        selectedCurrency={selectedCurrency}
        convertedPrice={convertedPrice}
        showStatus={showStatus}
        session={session}
        isAdmin={isAdminProp || isAdmin}
        isInWishlist={!!isInWishlist}
        toggleWishlist={toggleWishlist.mutate}
        isPending={toggleWishlist.isPending}
        onClick={onClick}
      />
      <ProductCardContent 
        product={product}
        selectedCurrency={selectedCurrency}
        convertedPrice={convertedPrice}
      />
    </Card>
  );
};

export default ProductCard;

