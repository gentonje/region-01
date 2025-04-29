
import { Card, CardContent, CardFooter } from "./ui/card";
import { Suspense, useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Info, MessageSquare, PackageSearch } from "lucide-react";

interface ProductDetailProps {
  product: Product;
  getProductImageUrl: (product: Product) => string;
  onBack: () => void;
  selectedCurrency?: SupportedCurrency;
  setSelectedProduct?: (product: Product) => void;
}

const ProductDetail = ({ 
  product, 
  onBack, 
  getProductImageUrl,
  selectedCurrency = "USD",
  setSelectedProduct
}: ProductDetailProps) => {
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [convertedPrice, setConvertedPrice] = useState<number>(product.price || 0);
  const [activeTab, setActiveTab] = useState("details");

  const queryClient = useQueryClient();

  // Set the selected image whenever the product changes
  useEffect(() => {
    // Reset the selected image when product changes
    const mainImagePath = product.product_images?.find(img => img.is_main)?.storage_path || 
      product.product_images?.[0]?.storage_path || '';
    setSelectedImage(mainImagePath);
  }, [product.id, product.product_images]);

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

  // Handle similar product selection
  const handleSimilarProductClick = (similarProduct: Product) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // If setSelectedProduct prop exists, use it to update the selected product
    if (setSelectedProduct) {
      setSelectedProduct(similarProduct);
    } else {
      // Fallback to previous behavior
      onBack();
      setTimeout(() => {
        onBack();
      }, 100);
    }
  };

  return (
    <div className="space-y-1 pb-1">
      <Card className="w-full max-w-2xl mx-auto overflow-hidden">
        <CardContent className="p-1">
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

          <Tabs defaultValue="details" className="mt-1" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="details" className="flex items-center">
                <Info className="h-4 w-4 mr-1" />
                Details
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                Reviews
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="pt-1">
              <div className="space-y-1">
                <div className="grid grid-cols-2 gap-x-1 gap-y-1">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-1 rounded-md border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="text-sm font-medium">{product.category || 'Other'}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-1 rounded-md border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-muted-foreground">Availability</p>
                    <p className="text-sm font-medium">{product.in_stock ? 'In Stock' : 'Out of Stock'}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-1 rounded-md border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-muted-foreground">Original Price</p>
                    <p className="text-sm font-medium">{product.currency} {product.price?.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-1 rounded-md border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-muted-foreground">Rating</p>
                    <p className="text-sm font-medium">{product.average_rating?.toFixed(1) || 'No ratings'}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 p-1 rounded-md border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-muted-foreground">Product Description</p>
                  <p className="text-sm">{product.description}</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="pt-1">
              <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                <ProductReviews 
                  productId={product.id} 
                  sellerId={product.seller_id || ''} 
                />
              </Suspense>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="p-1">
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

      {similarProducts && similarProducts.length > 0 && (
        <div className="mt-1">
          <div className="flex items-center mb-1">
            <PackageSearch className="h-5 w-5 mr-1" />
            <h3 className="text-lg font-semibold">Similar Products</h3>
          </div>
          <ProductSimilar
            products={similarProducts}
            getProductImageUrl={getProductImageUrl}
            onProductClick={handleSimilarProductClick}
            selectedCurrency={selectedCurrency}
          />
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
