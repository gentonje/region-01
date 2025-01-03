import { supabase } from "@/integrations/supabase/client";

export const uploadImage = async (
  file: File | null,
  productId: string,
  isMain: boolean,
  displayOrder: number
): Promise<string> => {
  if (!file) throw new Error("No file provided");

  // Create a unique file name
  const fileExt = file.name.split(".").pop();
  const fileName = `${productId}/${crypto.randomUUID()}.${fileExt}`;

  // Upload the file to Supabase storage
  const { error: uploadError } = await supabase.storage
    .from("images")
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  // Insert the image record into the product_images table
  const { error: dbError } = await supabase.from("product_images").insert({
    product_id: productId,
    storage_path: fileName,
    is_main: isMain,
    display_order: displayOrder,
  });

  if (dbError) throw dbError;

  return fileName;
};