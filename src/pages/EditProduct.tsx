
import { useNavigate, useParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { EditProductForm } from "@/components/product/edit/EditProductForm";
import { EditProductHeader } from "@/components/product/edit/EditProductHeader";
import { productPageStyles as styles } from "@/styles/productStyles";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useState } from "react";
import { updateProduct } from "@/services/productService";

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) throw new Error("Product ID is required");

      const { data: product, error } = await supabase
        .from("products")
        .select(`
          *,
          product_images (
            id,
            storage_path,
            is_main,
            display_order,
            created_at
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
        throw error;
      }

      if (!product) {
        throw new Error("Product not found");
      }

      console.log("Fetched product from database:", product);

      // Add publicUrl to each image and ensure type compatibility
      const productWithUrls = {
        ...product,
        product_images: product.product_images.map((image) => ({
          ...image,
          publicUrl: supabase.storage.from('images').getPublicUrl(image.storage_path).data.publicUrl
        })),
        county: product.county || null,
        // Make sure to handle country_id correctly - add explicit cast for TypeScript
      };

      // Use type assertion to ensure TypeScript knows country_id exists
      (productWithUrls as any).country_id = product.country_id || null;
      (productWithUrls as any).country = product.country_id ? String(product.country_id) : null;

      return productWithUrls as unknown as Product;
    },
    retry: 1
  });

  const handleSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true);
      if (!id) throw new Error("Product ID is required");
      
      console.log("Submitting form with county:", formData.county);
      console.log("Submitting form with country:", formData.country);
      
      // Convert country to country_id
      const updatedData = {
        ...formData,
        country_id: formData.country ? Number(formData.country) : null,
      };
      
      await updateProduct(id, updatedData);
      toast.success("Product updated successfully!");
      
      // Navigate directly instead of using setTimeout
      navigate("/my-products");
      
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast.error(error.message || "Failed to update product");
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.mainContent}>
          <div className="text-center text-red-500 mx-1 my-1">
            {error instanceof Error ? error.message : "An error occurred"}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !product) {
    return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.mainContent}>
          <div className="mx-1 my-1 px-1 py-1">
            <Skeleton className="h-8 w-48 mb-1" />
            <div className="space-y-1">
              <Skeleton className="h-[300px]" />
              <Skeleton className="h-[150px]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Navigation />
      <div className={styles.mainContent}>
        <div className="mx-1 my-1 px-1 py-1">
          <EditProductHeader title="Edit Product" />
          <EditProductForm
            product={product}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
