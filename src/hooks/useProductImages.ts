import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useProductImages = (productId?: string) => {
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<(File | null)[]>([null, null, null, null]);
  const { toast } = useToast();

  const uploadImages = async (mainImage: File | null, additionalImages: (File | null)[]) => {
    if (!mainImage) throw new Error("Main image is required");

    const uploadFile = async (file: File, isMain: boolean, order: number) => {
      console.log("Uploading file:", file.name);
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('images')
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      console.log("File uploaded successfully:", fileName);
      return fileName;
    };

    try {
      console.log("Starting main image upload...");
      const mainImagePath = await uploadFile(mainImage, true, 0);
      
      console.log("Starting additional images upload...");
      const additionalImagePaths = await Promise.all(
        additionalImages
          .filter((file): file is File => file !== null)
          .map((file, index) => uploadFile(file, false, index + 1))
      );

      return {
        mainImagePath,
        additionalImagePaths,
      };
    } catch (error: any) {
      console.error('Error in uploadImages:', error);
      throw new Error(`Failed to upload images: ${error.message}`);
    }
  };

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