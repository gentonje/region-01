import { useState, useEffect } from "react";
import { Skeleton } from "./ui/skeleton";

interface ImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export const ImageLoader = ({
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

  useEffect(() => {
    setIsLoading(true);
    setError(false);

    const img = new Image();
    img.src = src;

    if (priority) {
      img.fetchPriority = "high";
    }

    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      setError(true);
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, priority]);

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
          className={`${className} animate-pulse`}
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
        />
      )}
    </>
  );
};