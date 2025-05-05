
import { useState, useEffect, memo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface ImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fallbackSrc?: string;
}

const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error('No source provided'));
      return;
    }
    
    const img = new Image();
    img.src = src;
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
  });
};

export const ImageLoader = memo(({
  src,
  alt,
  className = "",
  width,
  height,
  priority = false,
  fallbackSrc = "/placeholder.svg"
}: ImageLoaderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src || fallbackSrc);
  const { toast } = useToast();

  const loadImage = useCallback(async () => {
    if (!src) {
      setImageSrc(fallbackSrc);
      setIsLoading(false);
      return;
    }
    
    try {
      // Check if image is in cache
      const cache = await caches.open('image-cache');
      const cachedResponse = await cache.match(src);
      
      if (!cachedResponse) {
        // If not in cache, preload and cache it
        await preloadImage(src);
        const response = await fetch(src);
        const clonedResponse = response.clone();
        await cache.put(src, clonedResponse);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading image:', err);
      setImageSrc(fallbackSrc);
      setError(true);
      setIsLoading(false);
      
      // Only show toast for non-placeholder images to avoid spamming
      if (src && src !== fallbackSrc && !src.includes('placeholder')) {
        toast({
          title: "Error loading image",
          description: "Using placeholder image instead",
          variant: "destructive",
        });
      }
    }
  }, [src, fallbackSrc, toast]);

  useEffect(() => {
    setIsLoading(true);
    setError(false);
    setImageSrc(src || fallbackSrc);
    loadImage();
  }, [loadImage, src, fallbackSrc]);

  if (error) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-md" style={{ width, height }}>
        <img 
          src={fallbackSrc} 
          alt={alt} 
          className={className}
          width={width}
          height={height}
        />
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div 
          className="flex items-center justify-center bg-gray-50 dark:bg-gray-800"
          style={{ width, height }}
        >
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : 'block'}`}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          // If the image fails to load, use the fallback
          if (imageSrc !== fallbackSrc) {
            setImageSrc(fallbackSrc);
          }
        }}
      />
    </>
  );
});

ImageLoader.displayName = 'ImageLoader';
