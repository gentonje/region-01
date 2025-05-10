
import { PackageSearch } from "lucide-react";
import { Product } from "@/types/product";
import { ProductSimilar } from "../ProductSimilar";
import { SupportedCurrency } from "@/utils/currencyConverter";

interface ProductSimilarSectionProps {
  similarProducts: Product[] | undefined;
  getProductImageUrl: (product: Product) => string;
  onProductClick: (product: Product) => void;
  selectedCurrency: SupportedCurrency;
  isLoading?: boolean;
}

export const ProductSimilarSection = ({ 
  similarProducts, 
  getProductImageUrl, 
  onProductClick, 
  selectedCurrency,
  isLoading = false
}: ProductSimilarSectionProps) => {
  if (!isLoading && (!similarProducts || similarProducts.length === 0)) {
    return null;
  }

  return (
    <div className="w-full m-1 p-1">
      <div className="flex items-center m-1 p-1">
        <PackageSearch className="h-5 w-5 mr-1" />
        <h3 className="text-lg font-semibold">Similar Products</h3>
      </div>
      <div className="w-full">
        <ProductSimilar
          products={similarProducts || []}
          getProductImageUrl={getProductImageUrl}
          onProductClick={onProductClick}
          selectedCurrency={selectedCurrency}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
