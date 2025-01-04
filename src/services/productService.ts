import { supabase } from "@/integrations/supabase/client";
import { ProductFormData } from "@/types/product";

export const createProduct = async (
  formData: ProductFormData,
  storagePath: string
) => {
  console.log("Creating product with data:", formData);
  const { error } = await supabase.from("products").insert({
    title: formData.title,
    description: formData.description,
    price: Number(formData.price),
    category: formData.category,
    available_quantity: Number(formData.available_quantity),
    storage_path: storagePath,
    shipping_info: formData.shipping_info,
  });

  if (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (
  id: string,
  formData: ProductFormData,
  storagePath?: string
) => {
  console.log("Updating product with data:", { id, formData, storagePath });
  const updateData: any = {
    title: formData.title,
    description: formData.description,
    price: Number(formData.price),
    category: formData.category,
    available_quantity: Number(formData.available_quantity),
    shipping_info: formData.shipping_info,
  };

  if (storagePath) {
    updateData.storage_path = storagePath;
  }

  const { error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};