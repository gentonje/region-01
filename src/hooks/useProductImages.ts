
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useProductImages = (productId?: string) => {
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<(File | null)[]>([null, null, null, null]);
  const { toast } = useToast();

  useEffect(() => {
    if (productId) {
      fetchImages();
    }
  }, [productId]);

  const fetchImages = async () => {
    try {
      const { data: imagesData, error: imagesError } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", productId)
        .order("display_order");

      if (imagesError) throw imagesError;

      const imagesWithUrls = await Promise.all(
        (imagesData || []).map(async (image) => {
          const { data } = supabase.storage
            .from('images')
            .getPublicUrl(image.storage_path);
          return { ...image, publicUrl: data.publicUrl };
        })
      );

      setExistingImages(imagesWithUrls || []);
    } catch (error: any) {
      console.error('Error fetching images:', error);
      toast({
        title: "Error",
        description: "Failed to load product images",
        variant: "destructive",
      });
    }
  };

  const uploadImages = async (mainImage: File | null, additionalImages: (File | null)[]) => {
    try {
      console.log("Starting image upload process...");
      
      // Initialize arrays to store paths
      let mainImagePath: string | null = null;
      const additionalImagePaths: string[] = [];

      // Upload main image if provided
      if (mainImage) {
        console.log("Uploading main image:", mainImage.name);
        const fileExt = mainImage.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, mainImage);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error(`Failed to upload main image: ${uploadError.message}`);
        }

        mainImagePath = fileName;
        console.log("Main image uploaded successfully:", fileName);
        
        // If this is an edit operation with an existing product ID, update the main image in product_images
        if (productId) {
          // Check if main image already exists
          const { data: existingMainImage, error: checkError } = await supabase
            .from('product_images')
            .select('id')
            .eq('product_id', productId)
            .eq('is_main', true)
            .single();
            
          if (checkError && checkError.code !== 'PGRST116') {
            console.error("Error checking existing main image:", checkError);
          }
          
          if (existingMainImage) {
            // Update existing main image
            const { error: updateError } = await supabase
              .from('product_images')
              .update({ storage_path: fileName })
              .eq('id', existingMainImage.id);
              
            if (updateError) {
              console.error("Error updating main image record:", updateError);
              throw updateError;
            }
            console.log("Updated existing main image record");
          } else {
            // Insert new main image
            const { error: insertError } = await supabase
              .from('product_images')
              .insert({
                product_id: productId,
                storage_path: fileName,
                is_main: true,
                display_order: 0
              });
              
            if (insertError) {
              console.error("Error inserting main image record:", insertError);
              throw insertError;
            }
            console.log("Inserted new main image record");
          }
        }
      }

      // Upload additional images
      console.log("Processing additional images...");
      for (const file of additionalImages.filter((f): f is File => f !== null)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          continue; // Skip this file if upload fails, but continue with others
        }

        additionalImagePaths.push(fileName);
      }

      return {
        mainImagePath: mainImagePath || undefined,
        additionalImagePaths,
      };
    } catch (error: any) {
      console.error('Error in uploadImages:', error);
      throw new Error(`Failed to upload images: ${error.message}`);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const imageToDelete = existingImages.find(img => img.id === imageId);
      if (!imageToDelete) return;

      const { error: deleteStorageError } = await supabase
        .storage
        .from('images')
        .remove([imageToDelete.storage_path]);

      if (deleteStorageError) throw deleteStorageError;

      const { error: deleteDbError } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (deleteDbError) throw deleteDbError;

      // Refresh the images list
      await fetchImages();
      
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    existingImages,
    mainImage,
    setMainImage,
    additionalImages,
    setAdditionalImages,
    handleDeleteImage,
    uploadImages,
  };
};
