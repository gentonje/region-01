import { supabase } from "@/integrations/supabase/client";
import { ProductFormData } from "@/types/product";

export const updateProduct = async (
  id: string,
  formData: ProductFormData & { mainImagePath?: string; additionalImagePaths?: string[] }
) => {
  console.log("Updating product with data:", { id, formData });
  const updateData: any = {
    title: formData.title,
    description: formData.description,
    price: Number(formData.price),
    category: formData.category,
    available_quantity: Number(formData.available_quantity),
    shipping_info: formData.shipping_info,
  };

  // Update main image if provided
  if (formData.mainImagePath) {
    updateData.storage_path = formData.mainImagePath;
  }

  // Update the product
  const { error: productError } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id);

  if (productError) {
    console.error("Error updating product:", productError);
    throw productError;
  }

  // Update additional images if provided
  if (formData.additionalImagePaths && formData.additionalImagePaths.length > 0) {
    const imageInserts = formData.additionalImagePaths.map((path, index) => ({
      product_id: id,
      storage_path: path,
      is_main: false,
      display_order: index + 1,
    }));

    const { error: imagesError } = await supabase
      .from("product_images")
      .insert(imageInserts);

    if (imagesError) {
      console.error("Error updating product images:", imagesError);
      throw imagesError;
    }
  }
};