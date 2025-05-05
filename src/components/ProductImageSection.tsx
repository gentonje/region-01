
import { ProductImageUpload } from "./ProductImageUpload";

interface ProductImageSectionProps {
  mainImage: File | null;
  setMainImage: (file: File | null) => void;
  additionalImages: (File | null)[];
  setAdditionalImages: (callback: (prev: (File | null)[]) => (File | null)[]) => void;
  mainImageUrl?: string;
  additionalImageUrls: { url: string; id: string; }[];
  onDeleteExisting: (id: string) => void;
  isLoading: boolean;
}

export const ProductImageSection = ({
  mainImage,
  setMainImage,
  additionalImages,
  setAdditionalImages,
  mainImageUrl,
  additionalImageUrls,
  onDeleteExisting,
  isLoading,
}: ProductImageSectionProps) => {
  return (
    <div className="space-y-1">
      <ProductImageUpload
        label="Main Product Image"
        onChange={setMainImage}
        existingImageUrl={mainImageUrl}
        isLoading={isLoading}
      />

      {[0, 1, 2, 3].map((index) => (
        <ProductImageUpload
          key={index}
          label={`Additional Image ${index + 1}`}
          onChange={(file) => {
            setAdditionalImages(prev => {
              const newImages = [...prev];
              newImages[index] = file;
              return newImages;
            });
          }}
          existingImageUrl={additionalImageUrls[index]?.url}
          onDeleteExisting={() => additionalImageUrls[index]?.id && onDeleteExisting(additionalImageUrls[index].id)}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};
