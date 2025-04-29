
import React, { useState, useEffect, memo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Product } from "@/types/product";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { useWishlistMutation } from "@/hooks/useWishlistMutation";
import { useCartMutations } from "@/hooks/useCartMutations";
import { ProductCardImage } from "./product/ProductCardImage";
import { ProductCardContent } from "./product/ProductCardContent";
import { ProductCardActions } from "./product/ProductCardActions";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  const imageUrl = getProductImageUrl(product);
  const { addItemMutation } = useCartMutations();
  const { toggleWishlist, isInWishlist, isPending } = useWishlistMutation(product.id);

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

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.in_stock) {
      addItemMutation.mutate({ productId: product.id });
    }
  }, [addItemMutation, product.in_stock, product.id]);

  const handleDeleteClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      await onDelete(product.id);
    }
  }, [onDelete, product.id]);

  return (
    <Card className="w-full m-1 p-1 overflow-hidden group relative transition-all duration-300 hover:shadow-xl bg-gray-900 border-gray-800 space-y-1">
      <ProductCardImage
        product={product}
        imageUrl={imageUrl}
        showStatus={showStatus}
        session={session}
        isAdmin={isAdmin}
        isInWishlist={isInWishlist}
        toggleWishlist={toggleWishlist}
        isPending={isPending}
        onClick={onClick}
      />
      
      <ProductCardContent
        product={product}
        selectedCurrency={selectedCurrency}
        onAddToCart={handleAddToCart}
      />
      
      {/* Remove the ProductCardActions component since we moved the Add to Cart button to ProductCardContent */}
      {(isAdminProp || isAdmin) && onDelete && (
        <div className="absolute bottom-2 right-2 z-10">
          <button
            onClick={handleDeleteClick}
            className="p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
            aria-label="Delete product"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      )}
    </Card>
  );
};

export default memo(ProductCard);
