import { ProductForm } from "@/components/ProductForm";
import { ProductImageSection } from "@/components/ProductImageSection";
import { useProductImages } from "@/hooks/useProductImages";
import { Product, ProductCategory } from "@/types/product";
import { useState } from "react";
import { toast } from "sonner";

interface EditProductFormProps {
  product: Product;
  onSubmit: (formData: any) => Promise<void>;
  isLoading: boolean;
}

export const EditProductForm = ({ product, onSubmit, isLoading }: EditProductFormProps) => {
  const {
    mainImage,
    setMainImage,
    additionalImages,
    setAdditionalImages,
    handleDeleteImage,
    uploadImages,
  } = useProductImages(product.id);

  const [formData, setFormData] = useState({
    title: product?.title || "",
    description: product?.description || "",
    price: String(product?.price || ""),
    category: product?.category || "Other" as ProductCategory,
    available_quantity: String(product?.available_quantity || "0"),
  });

  const handleSubmit = async (data: any) => {
    try {
      let mainImagePath = product.storage_path;
      let additionalImagePaths: string[] = [];

      // Only upload images if they have been changed
      if (mainImage || additionalImages.some(img => img !== null)) {
        console.log("Uploading new images...");
        const uploadResult = await uploadImages(mainImage, additionalImages);
        mainImagePath = uploadResult.mainImagePath;
        additionalImagePaths = uploadResult.additionalImagePaths;
        console.log("Images uploaded successfully:", { mainImagePath, additionalImagePaths });
      }

      // Call the parent onSubmit with both form data and image paths
      await onSubmit({
        ...data,
        mainImagePath,
        additionalImagePaths,
      });
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("Failed to update product images");
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <ProductImageSection
        mainImage={mainImage}
        setMainImage={setMainImage}
        additionalImages={additionalImages}
        setAdditionalImages={setAdditionalImages}
        mainImageUrl={product.storage_path}
        additionalImageUrls={product.product_images?.map((img) => ({
          url: img.publicUrl || '',
          id: img.id
        })) || []}
        onDeleteExisting={handleDeleteImage}
        isLoading={isLoading}
      />

      <ProductForm
        formData={formData}
        setFormData={setFormData}
        isLoading={isLoading}
        submitButtonText="Update Product"
        onSubmit={handleSubmit}
      />
    </div>
  );
};