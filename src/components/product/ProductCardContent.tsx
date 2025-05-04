
import React from "react";
import { CardContent } from "@/components/ui/card";
import { convertCurrency } from "@/utils/currencyConverter";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { Product } from "@/types/product";
import { useState, useEffect } from "react";
import { Star } from "lucide-react";

interface ProductCardContentProps {
  product: Product;
  selectedCurrency: SupportedCurrency;
}

export const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={`${
            star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

export const ProductCardContent = ({
  product,
  selectedCurrency,
}: ProductCardContentProps) => {
  const [convertedPrice, setConvertedPrice] = useState<number>(0);

  useEffect(() => {
    const updatePrice = async () => {
      try {
        const converted = await convertCurrency(
          product.price || 0,
          (product.currency || "SSP") as SupportedCurrency,
          selectedCurrency
        );
        setConvertedPrice(converted);
      } catch (error) {
        console.error("Error converting price:", error);
      }
    };
    updatePrice();
  }, [product.price, product.currency, selectedCurrency]);

  return (
    <CardContent className="p-3 space-y-1">
      <h3 className="font-semibold text-sm sm:text-base line-clamp-1 text-left">
        {product.title}
      </h3>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-left">
            {product.category || "Other"}
          </p>
          <p className="text-lg font-bold text-left">
            {selectedCurrency} {Math.round(convertedPrice).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <StarRating rating={product.average_rating || 0} />
        </div>
      </div>
    </CardContent>
  );
};
