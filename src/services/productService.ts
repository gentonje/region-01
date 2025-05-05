
import { supabase } from "@/integrations/supabase/client";
import { ProductFormData } from "@/types/product";
import { toast } from "sonner";

export const updateProduct = async (
  id: string,
  formData: ProductFormData & { mainImagePath?: string; additionalImagePaths?: string[] }
) => {
  console.log("Updating product with data:", { id, formData });
  
  // Don't throw an error if county exists (even if empty string)
  if (formData.county === undefined || formData.county === null) {
    throw new Error("County is required");
  }
  
  const updateData: any = {
    title: formData.title,
    description: formData.description,
    price: Number(formData.price),
    category: formData.category,
    available_quantity: Number(formData.available_quantity),
    shipping_info: formData.shipping_info,
    county: formData.county,
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

export const deleteProduct = async (productId: string) => {
  try {
    // Delete product images first
    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .delete()
      .eq('product_id', productId);

    if (imagesError) throw imagesError;

    // Then delete the product
    const { error: productError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (productError) throw productError;

    toast.success('Product deleted successfully');
  } catch (error: any) {
    console.error('Error deleting product:', error);
    toast.error(error.message || 'Failed to delete product');
    throw error;
  }
};

export const updateProductStatus = async (productId: string, status: 'draft' | 'published') => {
  try {
    const { error } = await supabase
      .from('products')
      .update({ product_status: status })
      .eq('id', productId);

    if (error) throw error;

    toast.success(`Product ${status === 'published' ? 'published' : 'unpublished'} successfully`);
  } catch (error: any) {
    console.error('Error updating product status:', error);
    toast.error(error.message || 'Failed to update product status');
    throw error;
  }
};
