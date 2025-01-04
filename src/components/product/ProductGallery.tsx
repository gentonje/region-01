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
  const [thumbnailUrls, setThumbnailUrls] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const loadMainImage = async () => {
      setIsLoading(true);
      const { data } = supabase.storage.from('images').getPublicUrl(selectedImage);
      setMainImageUrl(data.publicUrl);
      setIsLoading(false);
    };

    const loadThumbnails = async () => {
      const urls: { [key: string]: string } = {};
      for (const image of images) {
        const { data } = supabase.storage.from('images').getPublicUrl(image.storage_path);
        urls[image.storage_path] = data.publicUrl;
      }
      setThumbnailUrls(urls);
    };

    loadMainImage();
    loadThumbnails();
  }, [selectedImage, images]);

  return (
    <div className="space-y-6">
      <div className="aspect-[4/3] relative rounded-lg overflow-hidden bg-muted">
        {isLoading && <Skeleton className="absolute inset-0" />}
        <img
          src={mainImageUrl}
          alt={title}
          className={`w-full h-full object-cover relative z-10 transition-opacity duration-200 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
        />
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 px-2">
        {images.map((image, index) => (
          <div
            key={index}
            className={`relative min-w-[80px] h-20 rounded-md overflow-hidden cursor-pointer transition-all hover:opacity-90 m-2 ${
              selectedImage === image.storage_path ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onImageSelect(image.storage_path)}
          >
            <Skeleton className="absolute inset-0" />
            <img
              src={thumbnailUrls[image.storage_path]}
              alt={`${title} ${index + 1}`}
              className="w-full h-full object-cover relative z-10"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};