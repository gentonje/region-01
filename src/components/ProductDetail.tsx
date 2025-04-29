
import { Card, CardContent, CardFooter } from "./ui/card";
import { Suspense } from "react";
import { ProductGallery } from "./product/ProductGallery";
import { ProductInfo } from "./product/ProductInfo";
import { ProductActions } from "./product/ProductActions";
import { Product } from "@/types/product";
import { Skeleton } from "./ui/skeleton";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { useProductDetail } from "@/hooks/useProductDetail";
import { ProductTabs } from "./product/detail/ProductTabs";
import { ProductSimilarSection } from "./product/detail/ProductSimilarSection";

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
  const { 
    selectedImage,
    setSelectedImage,
    convertedPrice,
    activeTab,
    setActiveTab,
    similarProducts,
    handleAddToCart,
    addToCartMutation
  } = useProductDetail(product, selectedCurrency);

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

          <ProductTabs 
            product={product}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
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

      <ProductSimilarSection
        similarProducts={similarProducts}
        getProductImageUrl={getProductImageUrl}
        onProductClick={handleSimilarProductClick}
        selectedCurrency={selectedCurrency}
      />
    </div>
  );
};

export default ProductDetail;
