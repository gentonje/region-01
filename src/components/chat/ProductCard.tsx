
import React from 'react';
import { cn } from '@/lib/utils';
import { ImageLoader } from '@/components/ImageLoader';
import { AspectRatio } from '../ui/aspect-ratio';

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
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md w-full cursor-pointer hover:shadow-lg transition-shadow m-1 p-1 space-y-1 flex flex-col button-glow-outline"
      onClick={onClick}
    >
      <div className="relative w-full overflow-hidden">
        <AspectRatio ratio={16/9} className="bg-gray-100 dark:bg-gray-900">
          <ImageLoader
            src={imageUrl}
            alt={productDetail?.title || `Product image ${index + 1}`}
            className="w-full h-full object-cover"
            width={0}
            height={0}
            priority={index < 2}
            glowEffect={true}
          />
        </AspectRatio>
        
        {productDetail.inStock ? (
          <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-green-500/90 text-white m-1 button-glow">
            In Stock
          </span>
        ) : (
          <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-red-500/90 text-white m-1 button-glow-destructive">
            Out of Stock
          </span>
        )}
      </div>
      
      <div className="p-1 space-y-1 flex-grow">
        <h3 className="font-medium text-base truncate font-serif">{productDetail.title}</h3>
        
        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 font-sans">
          {/* Could add description here if available */}
        </p>
        
        <div className="flex justify-between items-center space-x-1 mt-1">
          <span className="text-green-600 dark:text-green-400 font-medium text-sm px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-full">
            {productDetail.currency} {productDetail.price.toLocaleString()}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {productDetail.location}
          </span>
        </div>
      </div>
    </div>
  );
};
