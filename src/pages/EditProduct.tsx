import { Navigation } from "@/components/Navigation";
import { EditProductHeader } from "@/components/product/edit/EditProductHeader";
import { EditProductForm } from "@/components/product/edit/EditProductForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { updateProduct } from "@/services/productService";
import { Product } from "@/types/product";
import { productPageStyles as styles } from "@/styles/productStyles";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { data: product, isLoading: isLoadingProduct, error: productError } = useQuery<Product>({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) throw new Error("No product ID provided");
      
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select(`
          *,
          product_images (
            id,
            storage_path,
            is_main,
            display_order,
            created_at,
            product_id
          )
        `)
        .eq("id", id)
        .single();

      if (productError) throw productError;

      // Get public URLs for all images
      if (productData.product_images) {
        const imagesWithUrls = await Promise.all(
          productData.product_images.map(async (image) => {
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

      // Get the public URL for the main product image
      if (productData.storage_path) {
        const { data: mainImageData } = supabase.storage
          .from('images')
          .getPublicUrl(productData.storage_path);
        productData.storage_path = mainImageData.publicUrl;
      }

      return productData as Product;
    },
  });

  const handleSubmit = async (formData: any) => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      await updateProduct(id, formData);
      toast.success("Product updated successfully");
      navigate("/modify-products");
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast.error(error.message || "Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  if (productError) {
    return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.mainContent}>
          <div className={styles.formContainer}>
            <p className="text-red-500">Error loading product: {(productError as Error).message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingProduct || !product) {
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

  return (
    <div className={styles.container}>
      <Navigation />
      <div className={styles.mainContent}>
        <div className={styles.formContainer}>
          <EditProductHeader title="Edit Product" />
          <EditProductForm
            product={product}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default EditProduct;