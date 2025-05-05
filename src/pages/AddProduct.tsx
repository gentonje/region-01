import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { ProductForm } from "@/components/ProductForm";
import { toast } from "sonner";
import { useProductImages } from "@/hooks/useProductImages";
import { useState } from "react";
import { ProductImageSection } from "@/components/ProductImageSection";
import { productPageStyles as styles } from "@/styles/productStyles";
import { ProductCategory, ProductFormData } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const AddProduct = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { mainImage, setMainImage, additionalImages, setAdditionalImages, uploadImages } = useProductImages();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    description: "",
    price: "",
    category: "Other" as ProductCategory,
    available_quantity: "0",
    county: "",
  });

  const handleSubmit = async (data: ProductFormData) => {
    if (!mainImage) {
      toast.error("Please upload a main product image");
      return;
    }

    if (!user?.id) {
      toast.error("You must be logged in to add a product");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Uploading images...");
      const { mainImagePath, additionalImagePaths } = await uploadImages(mainImage, additionalImages);
      console.log("Images uploaded successfully:", { mainImagePath, additionalImagePaths });

      // Make sure county is a string, not an object
      const countyValue = typeof data.county === 'object' && data.county !== null && 'name' in data.county
        ? data.county.name
        : data.county || '';

      console.log("Creating product...");
      const { data: productData, error: productError } = await supabase
        .from("products")
        .insert({
          title: data.title,
          description: data.description,
          price: Number(data.price),
          category: data.category,
          available_quantity: Number(data.available_quantity),
          storage_path: mainImagePath,
          user_id: user.id,
          county: countyValue
        })
        .select()
        .single();

      if (productError) throw productError;

      // Insert main image into product_images table
      const { error: mainImageError } = await supabase
        .from("product_images")
        .insert({
          product_id: productData.id,
          storage_path: mainImagePath,
          is_main: true,
          display_order: 0
        });

      if (mainImageError) throw mainImageError;

      // Insert additional images into product_images table
      if (additionalImagePaths.length > 0) {
        const additionalImagesData = additionalImagePaths.map((path, index) => ({
          product_id: productData.id,
          storage_path: path,
          is_main: false,
          display_order: index + 1
        }));

        const { error: additionalImagesError } = await supabase
          .from("product_images")
          .insert(additionalImagesData);

        if (additionalImagesError) throw additionalImagesError;
      }

      console.log("Product created successfully");
      toast.success("Product added successfully!");
      navigate("/");
    } catch (error: any) {
      console.error("Error adding product:", error);
      toast.error(error.message || "Failed to add product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <Navigation />
      
      <div className="max-w-2xl mx-auto px-4 py-4 sm:px-6 lg:px-8 pb-20 mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 overflow-y-auto">
          <div className="flex flex-col gap-4 sticky top-0 bg-white dark:bg-gray-800 z-10 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 dark:font-bold">Add New Product</h1>
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => navigate("/")}
                className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 transition-colors"
              >
                Cancel
              </Button>
            </div>
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
              formData={formData}
              setFormData={setFormData}
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
