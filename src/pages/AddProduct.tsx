import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { ProductForm } from "@/components/ProductForm";
import { toast } from "sonner";
import { useProductImages } from "@/hooks/useProductImages";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { ProductImageSection } from "@/components/ProductImageSection";

const AddProduct = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { mainImage, setMainImage, additionalImages, setAdditionalImages, uploadImages } = useProductImages();

  const handleSubmit = async (formData: any) => {
    if (!mainImage) {
      toast.error("Please upload a main product image");
      return;
    }

    setIsLoading(true);
    try {
      const { mainImagePath, additionalImagePaths } = await uploadImages(mainImage, additionalImages);

      const { error: insertError } = await supabase
        .from("products")
        .insert({
          title: formData.title,
          description: formData.description,
          price: formData.price,
          category: formData.category,
          available_quantity: formData.available_quantity,
          storage_path: mainImagePath,
        });

      if (insertError) throw insertError;

      toast.success("Product added successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-2xl mx-auto px-4 py-4 sm:px-6 lg:px-8 pb-20 mt-20">
        <div className="bg-white rounded-lg shadow-sm p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-4 border-b">
            <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="hover:bg-gray-100"
            >
              Cancel
            </Button>
          </div>

          <div className="space-y-6">
            <ProductImageSection
              mainImage={mainImage}
              setMainImage={setMainImage}
              additionalImages={additionalImages}
              setAdditionalImages={setAdditionalImages}
              additionalImageUrls={[]}
              onDeleteExisting={() => {}}
              isLoading={isLoading}
            />

            <ProductForm
              formData={{
                title: "",
                description: "",
                price: "",
                category: "Other",
                available_quantity: "0",
              }}
              setFormData={() => {}}
              isLoading={isLoading}
              submitButtonText="Add Product"
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;