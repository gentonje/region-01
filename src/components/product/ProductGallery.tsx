import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "../ui/skeleton";
import { useState, useEffect } from "react";

interface ProductGalleryProps {
  images: { storage_path: string; is_main: boolean }[];
  selectedImage: string;
  onImageSelect: (path: string) => void;
  title: string;
}

export const ProductGallery = ({ images, selectedImage, onImageSelect, title }: ProductGalleryProps) => {
  const [mainImageUrl, setMainImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [mainImageError, setMainImageError] = useState(false);
  const [thumbnailUrls, setThumbnailUrls] = useState<{ [key: string]: string }>({});
  const [thumbnailErrors, setThumbnailErrors] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const loadMainImage = async () => {
      setIsLoading(true);
      setMainImageError(false);
      const { data } = supabase.storage.from('images').getPublicUrl(selectedImage);
      setMainImageUrl(data.publicUrl);
    };

    const loadThumbnails = async () => {
      const urls: { [key: string]: string } = {};
      const errors: { [key: string]: boolean } = {};
      
      for (const image of images) {
        const { data } = supabase.storage.from('images').getPublicUrl(image.storage_path);
        urls[image.storage_path] = data.publicUrl;
        errors[image.storage_path] = false;
      }
      
      setThumbnailUrls(urls);
      setThumbnailErrors(errors);
    };

    loadMainImage();
    loadThumbnails();
  }, [selectedImage, images]);

  const handleMainImageError = () => {
    setIsLoading(false);
    setMainImageError(true);
  };

  const handleThumbnailError = (path: string) => {
    setThumbnailErrors(prev => ({
      ...prev,
      [path]: true
    }));
  };

  return (
    <div className="space-y-4">
      <div className="aspect-[4/3] relative rounded-lg overflow-hidden bg-gray-100">
        {isLoading && <Skeleton className="absolute inset-0" />}
        {mainImageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <span className="text-gray-400">Image not available</span>
          </div>
        ) : (
          <img
            src={mainImageUrl}
            alt={title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            onError={handleMainImageError}
          />
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {images.map((image, index) => (
          <div
            key={index}
            className={`relative min-w-[80px] h-20 rounded-md overflow-hidden cursor-pointer transition-all hover:opacity-90 ${
              selectedImage === image.storage_path ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onImageSelect(image.storage_path)}
          >
            {thumbnailErrors[image.storage_path] ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <span className="text-xs text-gray-400">Error</span>
              </div>
            ) : (
              <>
                <Skeleton className="absolute inset-0" />
                <img
                  src={thumbnailUrls[image.storage_path]}
                  alt={`${title} ${index + 1}`}
                  className="w-full h-full object-cover relative z-10 mt-1 py-1"
                  loading="lazy"
                  onError={() => handleThumbnailError(image.storage_path)}
                />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};