
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
}

export const ProductCard = ({ imageUrl, productDetail, index }: ProductCardProps) => {
  if (!productDetail) return null;

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md w-full"
    >
      <div className="relative w-full overflow-hidden">
        <ImageLoader
          src={imageUrl}
          alt={productDetail?.title || `Product image ${index + 1}`}
          className="w-full h-auto object-cover max-h-64"
          width={0}
          height={0}
          priority={index < 2}
        />
      </div>
      
      {productDetail && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 text-lg mb-1 line-clamp-2">
            {productDetail.title}
          </h4>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <span className="text-green-600 dark:text-green-400 font-medium text-xl">
                {productDetail.currency} {productDetail.price.toLocaleString()}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {productDetail.location}
              </span>
              <span className={cn(
                "py-1 px-2 text-xs rounded-full",
                productDetail.inStock 
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
              )}>
                {productDetail.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
