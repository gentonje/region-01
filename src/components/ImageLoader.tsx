
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
}

export const ImageLoader = memo(({
  src,
  alt,
  className = "",
  width,
  height,
  priority = false,
}: ImageLoaderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>("");
  const { toast } = useToast();

  const loadImage = useCallback(() => {
    if (!src) return;
    
    const img = new Image();
    img.src = src;

    if (priority) {
      img.fetchPriority = "high";
      img.loading = "eager";
    } else {
      img.loading = "lazy";
    }

    img.decoding = "async";

    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      setError(true);
      setIsLoading(false);
      toast({
        title: "Error loading image",
        description: "Failed to load image. Please try again later.",
        variant: "destructive",
      });
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, priority, toast]);

  useEffect(() => {
    setIsLoading(true);
    setError(false);
    const cleanup = loadImage();
    return cleanup;
  }, [loadImage]);

  if (error) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-md" style={{ width, height }}>
        <span className="text-sm text-gray-500">Failed to load image</span>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <Skeleton 
          className={className}
          style={{ width, height }}
        />
      )}
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          className={`${className} ${isLoading ? 'hidden' : 'block'}`}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      )}
    </>
  );
});

ImageLoader.displayName = 'ImageLoader';
