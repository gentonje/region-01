import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { ProductForm } from "@/components/ProductForm";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProductImages } from "@/hooks/useProductImages";
import { useState } from "react";
import { ProductImageSection } from "@/components/ProductImageSection";

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const { mainImage, setMainImage, additionalImages, setAdditionalImages, uploadImages, existingImages, handleDeleteImage } = useProductImages(id);

  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Failed to fetch product");
        throw new Error(error.message);
      }

      return data;
    },
  });

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      let newStoragePath = product?.storage_path;

      if (mainImage) {
        const { mainImagePath } = await uploadImages(mainImage, additionalImages);
        newStoragePath = mainImagePath;
      }

      const { error: updateError } = await supabase
        .from("products")
        .update({
          title: formData.title,
          description: formData.description,
          price: formData.price,
          category: formData.category,
          available_quantity: formData.available_quantity,
          storage_path: newStoragePath,
        })
        .eq("id", id);

      if (updateError) throw updateError;

      toast.success("Product updated successfully");
      navigate("/modify-products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen p-4 bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50 text-gray-900 pb-20">
      <Navigation />
      
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
            className="hover:bg-gray-100"
          >
            Cancel
          </Button>
        </div>

        <ProductImageSection
          mainImage={mainImage}
          setMainImage={setMainImage}
          additionalImages={additionalImages}
          setAdditionalImages={setAdditionalImages}
          mainImageUrl={product?.storage_path}
          additionalImageUrls={existingImages.map(img => ({ url: img.publicUrl, id: img.id }))}
          onDeleteExisting={handleDeleteImage}
          isLoading={isLoading}
        />

        <ProductForm
          formData={{
            title: product?.title || "",
            description: product?.description || "",
            price: String(product?.price || ""),
            category: product?.category || "Other",
            available_quantity: String(product?.available_quantity || "0"),
          }}
          setFormData={() => {}}
          isLoading={isLoading}
          submitButtonText="Update Product"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default EditProduct;