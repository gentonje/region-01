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
import { convertCurrency } from "@/utils/currencyConverter";

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
  const [convertedPrice, setConvertedPrice] = useState<number>(product.price || 0);
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
    <Card className="w-full h-[350px] rounded-xl overflow-hidden group relative transition-all duration-300 hover:shadow-xl bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 flex flex-col space-y-1">
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
        convertedPrice={convertedPrice}
      />
      
      <ProductCardActions
        session={session}
        isAdmin={isAdminProp || isAdmin}
        product={product}
        onDelete={handleDeleteClick}
        onAddToCart={handleAddToCart}
        onClick={onClick}
      />
    </Card>
  );
};

export default memo(ProductCard);
