import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { ProductForm } from "@/components/ProductForm";
import { toast } from "sonner";
import { useProductImages } from "@/hooks/useProductImages";
import { useState, useEffect } from "react";
import { ProductImageSection } from "@/components/ProductImageSection";
import { productPageStyles as styles } from "@/styles/productStyles";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProductData } from "@/hooks/useProductData";

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const { mainImage, setMainImage, additionalImages, setAdditionalImages, uploadImages } = useProductImages();
  const { user } = useAuth();
  const { formData, setFormData, mainImageUrl, additionalImageUrls, fetchProduct } = useProductData(id);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleDeleteImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from("product_images")
        .delete()
        .eq("id", imageId);

      if (error) throw error;
      
      await fetchProduct();
      toast.success("Image deleted successfully");
    } catch (error: any) {
      console.error("Error deleting image:", error);
      toast.error(error.message || "Failed to delete image");
    }
  };

  const handleSubmit = async (data: any) => {
    if (!user?.id) {
      toast.error("You must be logged in to edit a product");
      return;
    }

    setIsLoading(true);
    try {
      let mainImagePath = null;
      let additionalImagePaths: string[] = [];

      if (mainImage || additionalImages.some(img => img !== null)) {
        const uploadResult = await uploadImages(mainImage, additionalImages);
        mainImagePath = uploadResult.mainImagePath;
        additionalImagePaths = uploadResult.additionalImagePaths;
      }

      const updateData: any = {
        title: data.title,
        description: data.description,
        price: Number(data.price),
        category: data.category,
        available_quantity: Number(data.available_quantity),
      };

      if (mainImagePath) {
        updateData.storage_path = mainImagePath;
      }

      const { error: productError } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", id);

      if (productError) throw productError;

      if (mainImagePath) {
        const { error: mainImageError } = await supabase
          .from("product_images")
          .insert({
            product_id: id,
            storage_path: mainImagePath,
            is_main: true,
            display_order: 0
          });

        if (mainImageError) throw mainImageError;
      }

      if (additionalImagePaths.length > 0) {
        const additionalImagesData = additionalImagePaths.map((path, index) => ({
          product_id: id,
          storage_path: path,
          is_main: false,
          display_order: index + 1
        }));

        const { error: additionalImagesError } = await supabase
          .from("product_images")
          .insert(additionalImagesData);

        if (additionalImagesError) throw additionalImagesError;
      }

      toast.success("Product updated successfully!");
      navigate("/");
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast.error(error.message || "Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Navigation />
      
      <div className={styles.mainContent}>
        <div className={styles.formContainer}>
          <div className={styles.headerContainer}>
            <h1 className={styles.title}>Edit Product</h1>
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className={styles.cancelButton}
            >
              Cancel
            </Button>
          </div>

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
        </div>
      </div>
    </div>
  );
};

export default EditProduct;