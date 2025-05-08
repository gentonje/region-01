
import { useState, useEffect, memo, useCallback } from "react";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface ImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fallbackSrc?: string;
  glowEffect?: boolean;
  glowSelected?: boolean;
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
  fallbackSrc = "/placeholder.svg",
  glowEffect = false,
  glowSelected = false
}: ImageLoaderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src || fallbackSrc);
  const { toast } = useToast();

  const loadImage = useCallback(async () => {
    if (!src || src === fallbackSrc) {
      console.log('Using fallback image directly:', fallbackSrc);
      setImageSrc(fallbackSrc);
      setIsLoading(false);
      return;
    }
    
    console.log('Attempting to load image:', src);
    
    try {
      // Simplified image loading with better error handling
      await preloadImage(src);
      
      // If preloading succeeds, use the original source
      setImageSrc(src);
      setIsLoading(false);
      console.log('Image loaded successfully:', src);
    } catch (err) {
      console.error('Error loading image:', src, err);
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
    // Reset state when src changes
    setIsLoading(true);
    setError(false);
    
    // Set initial src early to possibly show something
    setImageSrc(src || fallbackSrc);
    
    // Start loading process
    loadImage();
  }, [src, loadImage, fallbackSrc]);

  // Add glow classes if requested
  const imageClasses = `${className} ${glowEffect ? 'image-glow' : ''} ${glowSelected ? 'image-glow-selected' : ''}`;

  // If we already know there's an error, show fallback immediately
  if (error) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-md" style={{ width, height }}>
        <img 
          src={fallbackSrc} 
          alt={alt || "Placeholder image"} 
          className={imageClasses}
          width={width}
          height={height}
        />
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <Skeleton 
          className={`${imageClasses} animate-pulse`}
          style={{ width, height }}
        />
      )}
      <img
        src={imageSrc}
        alt={alt || "Product image"}
        className={`${imageClasses} ${isLoading ? 'hidden' : 'block'}`}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => {
          console.log('Image onload fired:', imageSrc);
          setIsLoading(false);
        }}
        onError={() => {
          console.error('Image failed to load:', imageSrc);
          // If the image fails to load, use the fallback
          if (imageSrc !== fallbackSrc) {
            setImageSrc(fallbackSrc);
            setError(true);
          }
        }}
      />
    </>
  );
});

ImageLoader.displayName = 'ImageLoader';
