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

  // Fetch product and its images
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) throw new Error("No product ID provided");
      
      // Fetch product details
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select(`
          *,
          product_images (
            id,
            storage_path,
            is_main,
            display_order
          )
        `)
        .eq("id", id)
        .single();

      if (productError) {
        console.error("Error fetching product:", productError);
        toast.error("Failed to fetch product");
        throw productError;
      }

      // Get public URLs for all images
      if (productData.product_images) {
        const imagesWithUrls = await Promise.all(
          productData.product_images.map(async (image: any) => {
            const { data } = supabase.storage
              .from('images')
              .getPublicUrl(image.storage_path);
            return {
              ...image,
              publicUrl: data.publicUrl
            };
          })
        );
        productData.product_images = imagesWithUrls;
      }

      return productData;
    },
  });

  const handleSubmit = async (formData: any) => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      console.log("Updating product with data:", formData);
      let newStoragePath;
      if (mainImage) {
        const { mainImagePath, additionalImagePaths } = await uploadImages(mainImage, additionalImages);
        newStoragePath = mainImagePath;

        // Insert additional images
        if (additionalImagePaths.length > 0) {
          const { error: imagesError } = await supabase
            .from('product_images')
            .insert(
              additionalImagePaths.map((path, index) => ({
                product_id: id,
                storage_path: path,
                is_main: false,
                display_order: index + 1
              }))
            );

          if (imagesError) {
            console.error("Error saving additional images:", imagesError);
            throw imagesError;
          }
        }
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
            mainImageUrl={product.storage_path}
            additionalImageUrls={product.product_images?.map((img: any) => ({
              url: img.publicUrl,
              id: img.id
            })) || []}
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