import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { ProductForm } from "@/components/ProductForm";
import { toast } from "sonner";
import { useProductImages } from "@/hooks/useProductImages";
import { useState } from "react";
import { ProductImageSection } from "@/components/ProductImageSection";
import { productPageStyles as styles } from "@/styles/productStyles";
import { ProductCategory } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";

const AddProduct = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { mainImage, setMainImage, additionalImages, setAdditionalImages, uploadImages } = useProductImages();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "Other" as ProductCategory,
    available_quantity: "0",
  });

  const handleSubmit = async (formData: any) => {
    if (!mainImage) {
      toast.error("Please upload a main product image");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Uploading images...");
      const { mainImagePath, additionalImagePaths } = await uploadImages(mainImage, additionalImages);
      console.log("Images uploaded successfully:", { mainImagePath, additionalImagePaths });

      console.log("Creating product...");
      const { data: productData, error: productError } = await supabase
        .from("products")
        .insert({
          title: formData.title,
          description: formData.description,
          price: Number(formData.price),
          category: formData.category,
          available_quantity: Number(formData.available_quantity),
          storage_path: mainImagePath,
          shipping_info: formData.shipping_info,
        })
        .select()
        .single();

      if (productError) throw productError;

      // Insert main image into product_images table
      const { error: mainImageError } = await supabase
        .from("product_images")
        .insert({
          product_id: productData.id,
          storage_path: mainImagePath,
          is_main: true,
          display_order: 0
        });

      if (mainImageError) throw mainImageError;

      // Insert additional images into product_images table
      if (additionalImagePaths.length > 0) {
        const additionalImagesData = additionalImagePaths.map((path, index) => ({
          product_id: productData.id,
          storage_path: path,
          is_main: false,
          display_order: index + 1
        }));

        const { error: additionalImagesError } = await supabase
          .from("product_images")
          .insert(additionalImagesData);

        if (additionalImagesError) throw additionalImagesError;
      }

      console.log("Product created successfully");
      toast.success("Product added successfully!");
      navigate("/");
    } catch (error: any) {
      console.error("Error adding product:", error);
      toast.error(error.message || "Failed to add product");
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
            <h1 className={styles.title}>Add New Product</h1>
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
              additionalImageUrls={[]}
              onDeleteExisting={() => {}}
              isLoading={isLoading}
            />

            <ProductForm
              formData={formData}
              setFormData={setFormData}
              isLoading={isLoading}
              submitButtonText="Add Product"
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;