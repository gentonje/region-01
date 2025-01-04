import { Card, CardContent, CardFooter } from "./ui/card";
import { Suspense, useState } from "react";
import { ProductGallery } from "./product/ProductGallery";
import { ProductReviews } from "./product/ProductReviews";
import { ProductInfo } from "./product/ProductInfo";
import { ProductActions } from "./product/ProductActions";
import { ProductSimilar } from "./product/ProductSimilar";
import { Product } from "@/types/product";
import { Skeleton } from "./ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SupportedCurrency, convertCurrency } from "@/utils/currencyConverter";

interface ProductDetailProps {
  product: Product;
  getProductImageUrl: (product: Product) => string;
  onBack: () => void;
  selectedCurrency?: SupportedCurrency;
}

const ProductDetail = ({ 
  product, 
  onBack, 
  getProductImageUrl,
  selectedCurrency = "SSP" 
}: ProductDetailProps) => {
  const [selectedImage, setSelectedImage] = useState<string>(
    product.product_images?.find(img => !img.is_main)?.storage_path || 
    product.product_images?.[0]?.storage_path || 
    ''
  );

  const queryClient = useQueryClient();

  const { data: similarProducts } = useQuery({
    queryKey: ['similar-products', product.id, product.category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .eq('category', product.category)
        .neq('id', product.id)
        .limit(4);
      
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!product.category,
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to add items to cart');

      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: product.id,
          quantity: 1,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
      toast.success('Added to cart successfully');
    },
    onError: (error) => {
      console.error('Error adding to cart:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to add to cart');
      }
    },
  });

  const handleAddToCart = () => {
    if (!product.in_stock) {
      toast.error('This product is out of stock');
      return;
    }
    addToCartMutation.mutate();
  };

  const convertedPrice = convertCurrency(
    product.price || 0,
    (product.currency || "SSP") as SupportedCurrency,
    selectedCurrency
  );

  return (
    <div className="space-y-6 pb-20">
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="space-y-6">
          <ProductInfo
            title={product.title || ''}
            category={product.category || 'Other'}
            averageRating={product.average_rating || 0}
            inStock={product.in_stock || false}
            description={product.description || ''}
            onBack={onBack}
          />

          <Suspense fallback={<Skeleton className="aspect-[4/3] w-full rounded-lg" />}>
            <ProductGallery
              images={product.product_images || []}
              selectedImage={selectedImage}
              onImageSelect={setSelectedImage}
              title={product.title || ''}
            />
          </Suspense>

          <Suspense fallback={<Skeleton className="h-48 w-full" />}>
            <ProductReviews 
              productId={product.id} 
              sellerId={product.seller_id || ''} 
            />
          </Suspense>
        </CardContent>

        <CardFooter>
          <ProductActions
            price={product.price || 0}
            currency={product.currency || "SSP"}
            selectedCurrency={selectedCurrency}
            convertedPrice={convertedPrice}
            inStock={product.in_stock || false}
            onAddToCart={handleAddToCart}
            isAddingToCart={addToCartMutation.isPending}
          />
        </CardFooter>
      </Card>

      {similarProducts && (
        <ProductSimilar
          products={similarProducts}
          getProductImageUrl={getProductImageUrl}
          onProductClick={(similarProduct) => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            onBack();
            setTimeout(() => {
              onBack();
            }, 100);
          }}
          selectedCurrency={selectedCurrency}
        />
      )}
    </div>
  );
};

export default ProductDetail;