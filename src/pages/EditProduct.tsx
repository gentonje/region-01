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

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();

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

      // Add publicUrl to each image and ensure type compatibility
      const productWithUrls: Product = {
        ...product,
        product_images: product.product_images.map((image) => ({
          ...image,
          publicUrl: supabase.storage.from('images').getPublicUrl(image.storage_path).data.publicUrl
        }))
      };

      return productWithUrls;
    },
    retry: 1
  });

  const handleSubmit = async (formData: any) => {
    try {
      if (!id) throw new Error("Product ID is required");

      const { error: updateError } = await supabase
        .from("products")
        .update({
          title: formData.title,
          description: formData.description,
          price: Number(formData.price),
          category: formData.category,
          available_quantity: Number(formData.available_quantity),
          storage_path: formData.mainImagePath || product?.storage_path,
        })
        .eq("id", id);

      if (updateError) throw updateError;

      // If new additional images were uploaded, insert them
      if (formData.additionalImagePaths?.length > 0) {
        const imageInserts = formData.additionalImagePaths.map((path: string, index: number) => ({
          product_id: id,
          storage_path: path,
          is_main: false,
          display_order: index + 1,
        }));

        const { error: imagesError } = await supabase
          .from("product_images")
          .insert(imageInserts);

        if (imagesError) throw imagesError;
      }

      toast.success("Product updated successfully!");
      navigate("/modify-products");
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast.error(error.message || "Failed to update product");
      throw error;
    }
  };

  if (error) {
    return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.mainContent}>
          <div className="text-center text-red-500">
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
          <div className={styles.formContainer}>
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="space-y-6">
              <Skeleton className="h-[400px]" />
              <Skeleton className="h-[200px]" />
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