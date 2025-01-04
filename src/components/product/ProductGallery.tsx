import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "../ui/skeleton";
import { use } from "react";

interface ProductGalleryProps {
  images: { storage_path: string; is_main: boolean }[];
  selectedImage: string;
  onImageSelect: (path: string) => void;
  title: string;
}

export const ProductGallery = ({ images, selectedImage, onImageSelect, title }: ProductGalleryProps) => {
  // Using React 19's use hook for data fetching
  const mainImageUrl = use(Promise.resolve(
    supabase.storage.from('images').getPublicUrl(selectedImage).data.publicUrl
  ));

  return (
    <div className="space-y-6">
      <div className="aspect-[4/3] relative rounded-lg overflow-hidden bg-muted">
        <Skeleton className="absolute inset-0" />
        <img
          src={mainImageUrl}
          alt={title}
          className="w-full h-full object-cover relative z-10"
          loading="lazy"
        />
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 px-2">
        {images.map((image, index) => (
          <div
            key={index}
            className={`relative min-w-[80px] h-20 rounded-md overflow-hidden cursor-pointer transition-all hover:opacity-90 ${
              selectedImage === image.storage_path ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onImageSelect(image.storage_path)}
          >
            <Skeleton className="absolute inset-0" />
            <img
              src={supabase.storage.from('images').getPublicUrl(image.storage_path).data.publicUrl}
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