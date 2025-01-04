import { ProductForm } from "@/components/ProductForm";
import { ProductImageSection } from "@/components/ProductImageSection";
import { useProductImages } from "@/hooks/useProductImages";
import { Product, ProductCategory } from "@/types/product";
import { useState } from "react";

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
  } = useProductImages(product.id);

  const [formData, setFormData] = useState({
    title: product?.title || "",
    description: product?.description || "",
    price: String(product?.price || ""),
    category: product?.category || "Other" as ProductCategory,
    available_quantity: String(product?.available_quantity || "0"),
  });

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
        onSubmit={onSubmit}
      />
    </div>
  );
};