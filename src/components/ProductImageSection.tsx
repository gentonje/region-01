import { ProductImageUpload } from "./ProductImageUpload";
import { PRODUCT_CONSTANTS } from "@/constants/product";

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
    <div className="space-y-4">
      <ProductImageUpload
        label={PRODUCT_CONSTANTS.MAIN_IMAGE}
        onChange={setMainImage}
        existingImageUrl={mainImageUrl}
        isLoading={isLoading}
      />

      {Array.from({ length: PRODUCT_CONSTANTS.MAX_ADDITIONAL_IMAGES }).map((_, index) => (
        <ProductImageUpload
          key={index}
          label={`${PRODUCT_CONSTANTS.ADDITIONAL_IMAGE} ${index + 1}`}
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