
import React from 'react';
import { cn } from '@/lib/utils';
import { ImageLoader } from '@/components/ImageLoader';

interface ProductDetailProps {
  id: string;
  title: string;
  price: number;
  currency: string;
  location: string;
  inStock: boolean;
}

interface ProductCardProps {
  imageUrl: string;
  productDetail: ProductDetailProps | null;
  index: number;
  onClick: () => void;
}

export const ProductCard = ({ imageUrl, productDetail, index, onClick }: ProductCardProps) => {
  if (!productDetail) return null;

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md w-full cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="relative w-full overflow-hidden">
        <ImageLoader
          src={imageUrl}
          alt={productDetail?.title || `Product image ${index + 1}`}
          className="w-full h-auto object-cover aspect-square"
          width={0}
          height={0}
          priority={index < 2}
          glowEffect={true}
        />
      </div>
      
      {productDetail && (
        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-green-600 dark:text-green-400 font-medium text-sm">
              {productDetail.currency} {productDetail.price.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {productDetail.location}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
