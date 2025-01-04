import { supabase } from "@/integrations/supabase/client";
import { ProductFormData } from "@/types/product";

export const createProduct = async (
  formData: ProductFormData,
  storagePath: string
) => {
  const { error } = await supabase.from("products").insert({
    title: formData.title,
    description: formData.description,
    price: formData.price,
    category: formData.category,
    available_quantity: formData.available_quantity,
    storage_path: storagePath,
  });

  if (error) throw error;
};

export const updateProduct = async (
  id: string,
  formData: ProductFormData,
  storagePath?: string
) => {
  const updateData: Partial<ProductFormData> & { storage_path?: string } = {
    title: formData.title,
    description: formData.description,
    price: formData.price,
    category: formData.category,
    available_quantity: formData.available_quantity,
  };

  if (storagePath) {
    updateData.storage_path = storagePath;
  }

  const { error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id);

  if (error) throw error;
};