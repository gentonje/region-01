import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStorageUrl } from "@/utils/storage";
import { toast } from "sonner";
import { ProductCategory } from "@/types/product";

export const useProductData = (id: string | undefined) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "Other" as ProductCategory,
    available_quantity: "0",
  });
  const [mainImageUrl, setMainImageUrl] = useState<string>();
  const [additionalImageUrls, setAdditionalImageUrls] = useState<{ url: string; id: string; }[]>([]);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    
    try {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (productError) throw productError;

      const { data: images, error: imagesError } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", id)
        .order("display_order");

      if (imagesError) throw imagesError;

      if (product) {
        setFormData({
          title: product.title || "",
          description: product.description || "",
          price: product.price?.toString() || "",
          category: product.category || "Other",
          available_quantity: product.available_quantity?.toString() || "0",
        });

        // Process images
        const mainImg = images.find(img => img.is_main);
        if (mainImg) {
          setMainImageUrl(getStorageUrl(mainImg.storage_path));
        }

        const additionalImgs = images
          .filter(img => !img.is_main)
          .map(img => ({
            url: getStorageUrl(img.storage_path),
            id: img.id
          }));
        setAdditionalImageUrls(additionalImgs);
      }
    } catch (error: any) {
      console.error("Error fetching product:", error);
      toast.error(error.message || "Failed to fetch product");
    }
  }, [id]);

  return {
    formData,
    setFormData,
    mainImageUrl,
    additionalImageUrls,
    fetchProduct
  };
};