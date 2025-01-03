import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Confetti from "@/components/Confetti";
import { Database } from "@/integrations/supabase/types";
import { ProductForm } from "@/components/ProductForm";
import { uploadImage } from "@/utils/uploadImage";
import { useProductImages } from "@/hooks/useProductImages";
import { ProductImageSection } from "@/components/ProductImageSection";

type ProductCategory = Database["public"]["Enums"]["product_category"];

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "Electronics" as ProductCategory,
    available_quantity: "",
  });

  const {
    existingImages,
    mainImage,
    setMainImage,
    additionalImages,
    setAdditionalImages,
    handleDeleteImage,
  } = useProductImages(id!);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (productError) throw productError;
        
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Count new images being added (excluding null values)
      const newImagesCount = [
        mainImage,
        ...additionalImages.filter(img => img !== null)
      ].filter(Boolean).length;

      // Get current number of images in the database
      const currentImagesCount = existingImages.length;

      // Calculate total images after update
      const totalImagesAfterUpdate = currentImagesCount + newImagesCount;

      if (totalImagesAfterUpdate > 5) {
        throw new Error(`Cannot add ${newImagesCount} new images. You already have ${currentImagesCount} images. Maximum total is 5.`);
      }

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

      if (mainImage) {
        const mainImagePath = await uploadImage(mainImage, id!, true, 0);
        await supabase
          .from("products")
          .update({ storage_path: mainImagePath })
          .eq("id", id);
      }

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

  const mainImageUrl = existingImages.find(img => img.is_main)?.publicUrl;
  const additionalImageUrls = existingImages
    .filter(img => !img.is_main)
    .sort((a, b) => a.display_order - b.display_order)
    .map(img => ({ url: img.publicUrl, id: img.id }));

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <ProductImageSection
            mainImage={mainImage}
            setMainImage={setMainImage}
            additionalImages={additionalImages}
            setAdditionalImages={setAdditionalImages}
            mainImageUrl={mainImageUrl}
            additionalImageUrls={additionalImageUrls}
            onDeleteExisting={handleDeleteImage}
            isLoading={isLoading}
          />

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