import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Confetti from "@/components/Confetti";
import { Database } from "@/integrations/supabase/types";
import { ProductForm } from "@/components/ProductForm";
import { ProductImageUpload } from "@/components/ProductImageUpload";
import { uploadImage } from "@/utils/uploadImage";

type ProductCategory = Database["public"]["Enums"]["product_category"];

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<(File | null)[]>([null, null, null, null]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "Electronics" as ProductCategory,
    available_quantity: "",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Fetch product details
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (productError) throw productError;

        // Fetch all product images
        const { data: imagesData, error: imagesError } = await supabase
          .from("product_images")
          .select("*")
          .eq("product_id", id)
          .order("display_order");

        if (imagesError) throw imagesError;

        // Get public URLs for all images
        const imagesWithUrls = await Promise.all(
          (imagesData || []).map(async (image) => {
            const { data } = supabase
              .storage
              .from('images')
              .getPublicUrl(image.storage_path);
            return { ...image, publicUrl: data.publicUrl };
          })
        );

        console.log('Fetched images:', imagesWithUrls);
        setExistingImages(imagesWithUrls || []);
        
        // Set form data
        setFormData({
          title: productData.title || "",
          description: productData.description || "",
          price: productData.price?.toString() || "",
          category: productData.category || "Electronics",
          available_quantity: productData.available_quantity?.toString() || "",
        });
      } catch (error: any) {
        console.error('Error fetching product:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        navigate("/");
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate, toast]);

  const handleDeleteExistingImage = async (imageId: string) => {
    try {
      const image = existingImages.find(img => img.id === imageId);
      if (!image) return;

      const { error: deleteStorageError } = await supabase
        .storage
        .from('images')
        .remove([image.storage_path]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Calculate total number of images (existing + new)
      const existingImagesCount = existingImages.length;
      const newImagesCount = [mainImage, ...additionalImages.filter(img => img !== null)].length;
      const totalImagesCount = existingImagesCount + newImagesCount;

      if (totalImagesCount > 5) {
        throw new Error(`Maximum of 5 images allowed per product. You currently have ${existingImagesCount} images and are trying to add ${newImagesCount} more.`);
      }

      // Update product details
      const { error: updateError } = await supabase
        .from("products")
        .update({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          available_quantity: parseInt(formData.available_quantity),
        })
        .eq("id", id);

      if (updateError) throw updateError;

      // Handle new main image if provided
      if (mainImage) {
        const mainImagePath = await uploadImage(mainImage, id!, true, 0);
        await supabase
          .from("products")
          .update({ storage_path: mainImagePath })
          .eq("id", id);
      }

      // Handle new additional images
      for (let i = 0; i < additionalImages.length; i++) {
        if (additionalImages[i]) {
          await uploadImage(additionalImages[i], id!, false, existingImages.length + i + 1);
        }
      }

      setShowConfetti(true);
      toast({
        title: "Success",
        description: "Product updated successfully!",
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get main image and additional images
  const mainImageUrl = existingImages.find(img => img.is_main)?.publicUrl;
  const additionalImageUrls = existingImages
    .filter(img => !img.is_main)
    .sort((a, b) => a.display_order - b.display_order)
    .map(img => ({ url: img.publicUrl, id: img.id }));

  console.log('Main image URL:', mainImageUrl);
  console.log('Additional image URLs:', additionalImageUrls);

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <ProductImageUpload
              label="Main Product Image"
              onChange={setMainImage}
              existingImageUrl={mainImageUrl}
              isLoading={isLoading}
            />

            {[0, 1, 2, 3].map((index) => (
              <ProductImageUpload
                key={index}
                label={`Additional Image ${index + 1}`}
                onChange={(file) => {
                  setAdditionalImages(prev => {
                    const newImages = [...prev];
                    newImages[index] = file;
                    return newImages;
                  });
                }}
                existingImageUrl={additionalImageUrls[index]?.url}
                onDeleteExisting={() => additionalImageUrls[index]?.id && handleDeleteExistingImage(additionalImageUrls[index].id)}
                isLoading={isLoading}
              />
            ))}
          </div>

          <ProductForm
            formData={formData}
            setFormData={setFormData}
            isLoading={isLoading}
            submitButtonText="Update Product"
          />
        </form>
      </div>
      <Confetti isActive={showConfetti} />
    </div>
  );
};

export default EditProduct;