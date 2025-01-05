import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "../ui/skeleton";
import { useState, useEffect } from "react";
import { ImageLoader } from "../ImageLoader";

interface ProductGalleryProps {
  images: { storage_path: string; is_main: boolean }[];
  selectedImage: string;
  onImageSelect: (path: string) => void;
  title: string;
}

export const ProductGallery = ({ images, selectedImage, onImageSelect, title }: ProductGalleryProps) => {
  const [mainImageUrl, setMainImageUrl] = useState<string>("");
  const [thumbnailUrls, setThumbnailUrls] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const loadMainImage = async () => {
      const { data } = supabase.storage.from('images').getPublicUrl(selectedImage);
      setMainImageUrl(data.publicUrl);
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
    <div className="space-y-4">
      <div className="aspect-[4/3] relative rounded-lg overflow-hidden bg-gray-100">
        <ImageLoader
          src={mainImageUrl}
          alt={title}
          className="w-full h-full object-cover"
          width={800}
          height={600}
          priority={true}
        />
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 px-2 pt-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {images.map((image, index) => (
          <div
            key={index}
            className={`relative min-w-[80px] h-20 rounded-md overflow-hidden cursor-pointer transition-all hover:opacity-90 ${
              selectedImage === image.storage_path ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onImageSelect(image.storage_path)}
          >
            <ImageLoader
              src={thumbnailUrls[image.storage_path] || ''}
              alt={`${title} ${index + 1}`}
              className="w-full h-full object-cover"
              width={80}
              height={80}
              priority={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};