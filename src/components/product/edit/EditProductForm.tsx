
import { ProductForm } from "@/components/ProductForm";
import { ProductImageSection } from "@/components/ProductImageSection";
import { useProductImages } from "@/hooks/useProductImages";
import { Product, ProductCategory } from "@/types/product";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ProductFormData } from "@/components/forms/product/validation";

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

  // Log the product data to debug county value
  console.log("Product data in EditProductForm:", product);

  const [formData, setFormData] = useState<ProductFormData>({
    title: product?.title || "",
    description: product?.description || "",
    price: String(product?.price || ""),
    category: product?.category || "Other" as ProductCategory,
    available_quantity: String(product?.available_quantity || "0"),
    county: product?.county || "",
  });

  // Log the initial form data to debug county value
  useEffect(() => {
    console.log("Form data in EditProductForm:", formData);
  }, [formData]);

  const handleSubmit = async (data: ProductFormData) => {
    try {
      let mainImagePath = product.storage_path;
      let additionalImagePaths: string[] = [];

      // Only upload images if they have been changed
      if (mainImage || additionalImages.some(img => img !== null)) {
        console.log("Uploading new images...");
        const uploadResult = await uploadImages(mainImage, additionalImages);
        
        // Only update mainImagePath if a new main image was uploaded
        if (uploadResult.mainImagePath) {
          mainImagePath = uploadResult.mainImagePath;
        }
        
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

  // Find the main image URL from product_images
  const mainImageUrl = product.product_images?.find(img => img.is_main)?.publicUrl || product.storage_path;
  
  // Get additional images excluding the main one
  const additionalImageUrls = product.product_images
    ?.filter(img => !img.is_main)
    .map(img => ({
      url: img.publicUrl || '',
      id: img.id
    })) || [];

  return (
    <div className="space-y-6">
      <ProductImageSection
        mainImage={mainImage}
        setMainImage={setMainImage}
        additionalImages={additionalImages}
        setAdditionalImages={setAdditionalImages}
        mainImageUrl={mainImageUrl}
        additionalImageUrls={additionalImageUrls}
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
