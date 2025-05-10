
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
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md w-full cursor-pointer hover:shadow-lg transition-shadow m-1 p-1 space-y-1"
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
        
        {productDetail.inStock ? (
          <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-green-500/90 text-white m-1">
            In Stock
          </span>
        ) : (
          <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-red-500/90 text-white m-1">
            Out of Stock
          </span>
        )}
      </div>
      
      <div className="p-2 space-y-1">
        <h3 className="font-medium text-sm truncate font-serif">{productDetail.title}</h3>
        
        <div className="flex justify-between items-center space-x-1">
          <span className="text-green-600 dark:text-green-400 font-medium text-sm px-1 py-0.5 bg-green-50 dark:bg-green-900/20 rounded-full">
            {productDetail.currency} {productDetail.price.toLocaleString()}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {productDetail.location}
          </span>
        </div>
      </div>
    </div>
  );
};
