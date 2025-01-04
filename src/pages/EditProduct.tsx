import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { ProductForm } from "@/components/ProductForm";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProductImages } from "@/hooks/useProductImages";
import { useState } from "react";
import { ProductImageSection } from "@/components/ProductImageSection";
import { updateProduct } from "@/services/productService";
import { productPageStyles as styles } from "@/styles/productStyles";
import { ProductCategory } from "@/types/product";

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const { mainImage, setMainImage, additionalImages, setAdditionalImages, uploadImages, existingImages, handleDeleteImage } = useProductImages(id);

  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) throw new Error("No product ID provided");
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to fetch product");
        throw error;
      }

      return data;
    },
  });

  const handleSubmit = async (formData: any) => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      console.log("Updating product with data:", formData);
      let newStoragePath;
      if (mainImage) {
        const { mainImagePath } = await uploadImages(mainImage, additionalImages);
        newStoragePath = mainImagePath;
      }

      await updateProduct(id, {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category as ProductCategory,
        available_quantity: Number(formData.available_quantity),
        shipping_info: formData.shipping_info,
      }, newStoragePath);

      toast.success("Product updated successfully");
      navigate("/modify-products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.mainContent}>
          <div className={styles.formContainer}>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.mainContent}>
          <div className={styles.formContainer}>
            <p>Product not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Navigation />
      
      <div className={styles.mainContent}>
        <div className={styles.formContainer}>
          <div className={styles.headerContainer}>
            <h1 className={styles.title}>Edit Product</h1>
            <Button 
              variant="outline" 
              onClick={() => navigate("/modify-products")}
              className={styles.cancelButton}
            >
              Cancel
            </Button>
          </div>

          <ProductImageSection
            mainImage={mainImage}
            setMainImage={setMainImage}
            additionalImages={additionalImages}
            setAdditionalImages={setAdditionalImages}
            mainImageUrl={product?.storage_path}
            additionalImageUrls={existingImages.map(img => ({ url: img.publicUrl, id: img.id }))}
            onDeleteExisting={handleDeleteImage}
            isLoading={isLoading}
          />

          <ProductForm
            formData={{
              title: product?.title || "",
              description: product?.description || "",
              price: String(product?.price || ""),
              category: product?.category || "Other" as ProductCategory,
              available_quantity: String(product?.available_quantity || "0"),
            }}
            setFormData={() => {}}
            isLoading={isLoading}
            submitButtonText="Update Product"
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default EditProduct;