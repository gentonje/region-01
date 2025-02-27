
import React, { useState, useEffect, memo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { convertCurrency, SupportedCurrency } from "@/utils/currencyConverter";
import { Product } from "@/types/product";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Trash2, Edit, Eye } from "lucide-react";
import { Button } from "./ui/button";
import { ImageLoader } from "./ImageLoader";
import { Badge } from "./ui/badge";
import { Link } from "react-router-dom";

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
  const [convertedPrice, setConvertedPrice] = useState<number>(product.price || 0);
  const imageUrl = getProductImageUrl(product);

  // Get user type
  const { data: userType } = useQuery({
    queryKey: ['userType', session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return null;
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching user type:', error);
        return null;
      }

      return profiles?.user_type || null;
    },
    enabled: !!session?.user
  });

  const isAdmin = userType === 'admin';

  // Check if product is in wishlist
  const { data: isInWishlist } = useQuery({
    queryKey: ['wishlist', product.id, session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return false;

      try {
        const { data: wishlist, error } = await supabase
          .from('wishlists')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error || !wishlist) return false;

        const { data: wishlistItems, error: itemError } = await supabase
          .from('wishlist_items')
          .select('id')
          .eq('wishlist_id', wishlist.id)
          .eq('product_id', product.id);

        if (itemError) return false;
        return wishlistItems.length > 0;
      } catch (error) {
        console.error('Wishlist query error:', error);
        return false;
      }
    },
    enabled: !!session?.user && !!product.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Toggle wishlist mutation
  const toggleWishlist = useMutation({
    mutationFn: async () => {
      if (!session?.user) {
        throw new Error('Please login to add items to wishlist');
      }

      const { data: existingWishlist, error: wishlistError } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

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
  });

  // Convert price effect
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

  // Handlers
  const handleToggleWishlist = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist.mutate();
  }, [toggleWishlist]);

  const handleDeleteClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      try {
        await onDelete(product.id);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  }, [onDelete, product.id]);

  return (
    <Card 
      className="w-full hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group bg-white/50 dark:bg-gray-800/90 backdrop-blur-sm border-neutral-200/80 dark:border-gray-700"
    >
      {/* Card Image */}
      <div className="relative h-48 overflow-hidden" onClick={onClick}>
        <ImageLoader
          src={imageUrl}
          alt={product.title || ""}
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
          width={400}
          height={200}
          priority={false}
        />
        
        {/* Category Badge */}
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded-full bg-white/80 backdrop-blur-sm text-gray-900 font-medium min-w-[100px] text-center truncate max-w-[90%] border border-blue-500/50">
          {product.category}
        </span>
        
        {/* Stock Badge */}
        <span 
          className={`absolute top-3 right-3 text-xs px-2 py-0 rounded-full backdrop-blur-sm font-medium ${
            product.in_stock 
              ? 'bg-green-100/80 text-green-800 border border-green-500/50' 
              : 'bg-red-100/80 text-red-800 border border-red-500/50'
          }`}
        >
          {product.in_stock ? 'In Stock' : 'Out of Stock'}
        </span>
        
        {/* Status Badge (conditional) */}
        {showStatus && (
          <span className={`absolute top-3 left-3 text-xs px-2 py-1 rounded-full backdrop-blur-sm font-medium border border-neutral-100/50 ${
            product.product_status === 'published' 
              ? 'bg-green-100/80 text-green-800 border-green-500/50' 
              : 'bg-yellow-100/80 text-yellow-800 border-yellow-500/50'
          }`}>
            {product.product_status === 'published' ? 'Published' : 'Draft'}
          </span>
        )}
        
        {/* Price Badge */}
        <span className="absolute top-3 left-3 text-sm px-2 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-orange-600 font-bold shadow-sm border border-orange-200">
          {selectedCurrency} {convertedPrice.toFixed(2)}
        </span>
      </div>
      
      {/* Card Content */}
      <div className="p-3 space-y-2" onClick={onClick}>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">{product.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{product.description}</p>
      </div>
      
      {/* Card Actions */}
      <div className="flex items-center justify-between px-3 pb-3">
        {session && !isAdminProp && !isAdmin && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={handleToggleWishlist}
            disabled={toggleWishlist.isPending}
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        )}
        
        {(isAdminProp || isAdmin || product.user_id === session?.user?.id) && (
          <div className="flex gap-2">
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                className="rounded-full"
                onClick={handleDeleteClick}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Link to={`/edit-product/${product.id}`} onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="default"
              size="sm"
              className="rounded-full"
              onClick={onClick}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(ProductCard);
