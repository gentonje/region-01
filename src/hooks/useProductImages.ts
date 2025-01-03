import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useProductImages = (productId: string) => {
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<(File | null)[]>([null, null, null, null]);
  const { toast } = useToast();

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

      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      
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

  useEffect(() => {
    if (productId) {
      fetchImages();
    }
  }, [productId]);

  return {
    existingImages,
    mainImage,
    setMainImage,
    additionalImages,
    setAdditionalImages,
    handleDeleteImage,
  };
};