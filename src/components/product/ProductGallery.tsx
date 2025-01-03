import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "../ui/scroll-area";

interface ProductGalleryProps {
  images: { storage_path: string; is_main: boolean }[];
  selectedImage: string;
  onImageSelect: (path: string) => void;
  title: string;
}

export const ProductGallery = ({ images, selectedImage, onImageSelect, title }: ProductGalleryProps) => {
  return (
    <div className="space-y-4">
      <div className="aspect-video relative rounded-lg overflow-hidden">
        <img
          src={supabase.storage.from('images').getPublicUrl(selectedImage).data.publicUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <div
            key={index}
            className={`w-20 h-20 rounded-md overflow-hidden cursor-pointer ${
              selectedImage === image.storage_path ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onImageSelect(image.storage_path)}
          >
            <img
              src={supabase.storage.from('images').getPublicUrl(image.storage_path).data.publicUrl}
              alt={`${title} ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};