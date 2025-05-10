
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
    isLoadingSimilar,
    viewCount,
    handleAddToCart,
    addToCartMutation
  } = useProductDetail(product, selectedCurrency);

  // Update product with latest view count if available
  const displayProduct = {
    ...product,
    views: viewCount !== undefined ? viewCount : product.views
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
    <div className="w-full mx-0 px-0">
      <Card className="w-full overflow-hidden shadow-md border-0 rounded-none">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Left column - Product gallery */}
            <div className="md:w-1/2 flex flex-col">
              <div className="flex items-center p-1 w-full">
                <button 
                  onClick={onBack} 
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                  Back
                </button>
              </div>
              
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 p-1">
                {displayProduct.title}
              </h1>
              
              <div className="flex items-center space-x-2 p-1 w-full">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs">
                  {displayProduct.category || 'Other'}
                </span>
                <span className={`px-2 py-0.5 ${displayProduct.in_stock ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'} rounded-full text-xs`}>
                  {displayProduct.in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              <div className="w-full">
                <Suspense fallback={<Skeleton className="aspect-[4/3] w-full" />}>
                  <ProductGallery
                    images={displayProduct.product_images || []}
                    selectedImage={selectedImage}
                    onImageSelect={setSelectedImage}
                    title={displayProduct.title || ''}
                  />
                </Suspense>
              </div>
            </div>

            {/* Right column - Tabs with product details and reviews */}
            <div className="md:w-1/2 mt-1 md:mt-0 md:pt-10">
              <ProductTabs 
                product={displayProduct}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-0">
          <ProductActions
            price={displayProduct.price || 0}
            currency={displayProduct.currency || "SSP"}
            selectedCurrency={selectedCurrency}
            convertedPrice={convertedPrice}
            inStock={displayProduct.in_stock || false}
            onAddToCart={handleAddToCart}
            isAddingToCart={addToCartMutation.isPending}
          />
        </CardFooter>
      </Card>

      {/* Similar products section - using full width */}
      <div className="w-full">
        <ProductSimilarSection
          similarProducts={similarProducts}
          getProductImageUrl={getProductImageUrl}
          onProductClick={handleSimilarProductClick}
          selectedCurrency={selectedCurrency}
          isLoading={isLoadingSimilar}
        />
      </div>
    </div>
  );
};

export default ProductDetail;
