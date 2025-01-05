import { Card, CardContent } from "../ui/card";
import { Product } from "@/types/product";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { convertCurrency } from "@/utils/currencyConverter";
import { useState, useEffect } from "react";

interface ProductSimilarProps {
  products: Product[];
  getProductImageUrl: (product: Product) => string;
  onProductClick: (product: Product) => void;
  selectedCurrency: SupportedCurrency;
}

export const ProductSimilar = ({ 
  products, 
  getProductImageUrl, 
  onProductClick,
  selectedCurrency 
}: ProductSimilarProps) => {
  const [convertedPrices, setConvertedPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const updatePrices = async () => {
      const prices: Record<string, number> = {};
      for (const product of products) {
        prices[product.id] = await convertCurrency(
          product.price || 0,
          (product.currency || "SSP") as SupportedCurrency,
          selectedCurrency
        );
      }
      setConvertedPrices(prices);
    };
    updatePrices();
  }, [products, selectedCurrency]);

  if (!products?.length) return null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Similar Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((similarProduct) => (
          <Card 
            key={similarProduct.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              onProductClick(similarProduct);
            }}
          >
            <CardContent className="p-2">
              <div className="aspect-square w-full relative mb-2">
                <img
                  src={getProductImageUrl(similarProduct)}
                  alt={similarProduct.title || ""}
                  className="w-full h-full object-cover rounded-md"
                  loading="lazy"
                />
              </div>
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {similarProduct.title}
              </h3>
              <p className="text-sm font-medium text-gray-900">
                {selectedCurrency} {(convertedPrices[similarProduct.id] || 0).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};