
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "../ui/skeleton";
import { useState, useEffect } from "react";
import { ImageLoader } from "../ImageLoader";
import { toast } from "sonner";

interface ProductGalleryProps {
  images: { storage_path: string; is_main: boolean }[];
  selectedImage: string;
  onImageSelect: (path: string) => void;
  title: string;
}

export const ProductGallery = ({ images, selectedImage, onImageSelect, title }: ProductGalleryProps) => {
  const [mainImageUrl, setMainImageUrl] = useState<string>("");
  const [thumbnailUrls, setThumbnailUrls] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadImages = async () => {
      setIsLoading(true);
      
      try {
        // Load main image
        if (selectedImage && selectedImage.trim() !== '') {
          const { data, error } = supabase.storage.from('images').getPublicUrl(selectedImage);
          
          if (error) {
            throw error;
          }
          
          setMainImageUrl(data.publicUrl);
        } else {
          // If no selected image, use placeholder
          setMainImageUrl("/placeholder.svg");
        }

        // Load thumbnails
        const urls: { [key: string]: string } = {};
        
        for (const image of images) {
          if (image.storage_path && image.storage_path.trim() !== '') {
            const { data, error } = supabase.storage.from('images').getPublicUrl(image.storage_path);
            
            if (!error) {
              urls[image.storage_path] = data.publicUrl;
            } else {
              urls[image.storage_path] = "/placeholder.svg";
            }
          }
        }
        
        setThumbnailUrls(urls);
      } catch (error) {
        console.error("Error loading product images:", error);
        toast.error("Had trouble loading some product images");
      } finally {
        setIsLoading(false);
      }
    };

    loadImages();
  }, [selectedImage, images]);

  // If no images or images array is empty, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className="space-y-1">
        <div className="aspect-[4/3] relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200 dark:border-gray-700">
          <ImageLoader
            src="/placeholder.svg"
            alt={title || "Product placeholder"}
            className="w-full h-full object-cover"
            width={800}
            height={600}
            priority={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="aspect-[4/3] relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200 dark:border-gray-700">
        <ImageLoader
          src={mainImageUrl}
          alt={title}
          className="w-full h-full object-cover"
          width={800}
          height={600}
          priority={true}
          fallbackSrc="/placeholder.svg"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-1 overflow-x-auto pb-1 px-1 pt-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative min-w-[60px] h-16 rounded-md overflow-hidden cursor-pointer transition-all border hover:opacity-90 ${
                selectedImage === image.storage_path ? 'ring-1 ring-primary border-primary' : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => onImageSelect(image.storage_path)}
            >
              <ImageLoader
                src={thumbnailUrls[image.storage_path] || ''}
                alt={`${title} ${index + 1}`}
                className="w-full h-full object-cover"
                width={60}
                height={60}
                priority={false}
                fallbackSrc="/placeholder.svg"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
