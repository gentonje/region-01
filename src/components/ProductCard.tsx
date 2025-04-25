import React, { useState, useEffect, memo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { convertCurrency, SupportedCurrency } from "@/utils/currencyConverter";
import { Product } from "@/types/product";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Trash2, Edit, Eye, ShoppingCart } from "lucide-react";
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
  const [isHovered, setIsHovered] = useState(false);
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

  // Add to cart mutation
  const addToCart = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to add items to cart");

      const { error } = await supabase
        .from("cart_items")
        .insert({
          user_id: user.id,
          product_id: product.id,
          quantity: 1,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartItems"] });
      toast.success("Added to cart successfully");
    },
    onError: (error) => {
      console.error("Error adding to cart:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to add to cart");
      }
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

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.in_stock) {
      addToCart.mutate();
    } else {
      toast.error("This product is currently out of stock");
    }
  }, [addToCart, product.in_stock]);

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
      className="w-full h-[500px] rounded-xl overflow-hidden group relative transition-all duration-300 hover:shadow-xl bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Image with fixed height */}
      <div 
        className="relative h-52 overflow-hidden cursor-pointer"
        onClick={onClick}
      >
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 z-10 opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : ''}`} />
        
        <ImageLoader
          src={imageUrl}
          alt={product.title || ""}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
          width={400}
          height={208}
          priority={false}
        />
        
        {/* Badge Container - Top Right */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 items-end">
          {/* Stock Badge */}
          <span 
            className={`text-xs px-2 py-1 rounded-full font-medium backdrop-blur ${
              product.in_stock 
                ? 'bg-green-500/80 text-white' 
                : 'bg-red-500/80 text-white'
            }`}
          >
            {product.in_stock ? 'In Stock' : 'Out of Stock'}
          </span>
          
          {/* Status Badge (conditional) */}
          {showStatus && (
            <span className={`text-xs px-2 py-1 rounded-full font-medium backdrop-blur ${
              product.product_status === 'published' 
                ? 'bg-emerald-500/80 text-white' 
                : 'bg-amber-500/80 text-white'
            }`}>
              {product.product_status === 'published' ? 'Published' : 'Draft'}
            </span>
          )}
        </div>

        {/* Category Badge - Bottom */}
        <div className="absolute bottom-3 left-3 right-3 z-20">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/90 text-white backdrop-blur-sm font-medium">
              {product.category}
            </span>
          </div>
        </div>
        
        {/* Price Tag - Top Left */}
        <div className="absolute top-0 left-0 z-20">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-1 rounded-br-lg font-bold shadow-lg">
            {selectedCurrency} {convertedPrice.toFixed(0)}
          </div>
        </div>
      </div>
      
      {/* Card Content with fixed height and line-clamp */}
      <div 
        className="p-4 flex-grow flex flex-col justify-between cursor-pointer"
        onClick={onClick}
      >
        <div>
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg line-clamp-1 group-hover:text-orange-500 transition-colors mb-2">
            {product.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 h-12">
            {product.description}
          </p>
        </div>
        
        <div className="mt-4 text-center">
          <span className="text-lg font-bold text-orange-500">
            {selectedCurrency} {convertedPrice.toFixed(0)}
          </span>
        </div>
      </div>
      
      {/* Card Actions */}
      <div className="px-4 pb-4 flex items-center justify-between">
        {/* Left side actions */}
        {session && !isAdminProp && !isAdmin && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-full transition-all ${isInWishlist ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'}`}
              onClick={handleToggleWishlist}
              disabled={toggleWishlist.isPending}
            >
              <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-red-500' : ''}`} />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="rounded-full transition-all hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
              onClick={handleAddToCart}
              disabled={!product.in_stock || addToCart.isPending}
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              <span className="text-xs">Add</span>
            </Button>
          </div>
        )}
        
        {/* Right side admin actions */}
        {(isAdminProp || isAdmin || product.user_id === session?.user?.id) && (
          <div className="flex gap-2 ml-auto">
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                onClick={handleDeleteClick}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            
            <Link 
              to={`/edit-product/${product.id}`} 
              onClick={(e) => e.stopPropagation()}
              className="inline-flex"
            >
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/30 dark:hover:text-purple-400"
              onClick={onClick}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Hover Overlay for Touch Devices */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0" />
    </Card>
  );
};

export default memo(ProductCard);
