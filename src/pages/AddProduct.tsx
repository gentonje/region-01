import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { ProductForm } from "@/components/ProductForm";
import { toast } from "sonner";
import { useProductImages } from "@/hooks/useProductImages";
import { supabase } from "@/integrations/supabase/client";

const AddProduct = () => {
  const navigate = useNavigate();
  const { uploadImages } = useProductImages();

  const handleSubmit = async (formData: any) => {
    const { title, description, price, category, mainImage, additionalImages } = formData;

    if (!title || !description || !price || !category || !mainImage) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const { data: uploadData, error: uploadError } = await uploadImages(mainImage, additionalImages);
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from("products")
        .insert([
          {
            title,
            description,
            price,
            category,
            main_image: uploadData.mainImageUrl,
            additional_images: uploadData.additionalImageUrls,
          },
        ]);

      if (insertError) throw insertError;

      toast.success("Product added successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product.");
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50 text-gray-900 pb-20">
      <Navigation />
      
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
            className="hover:bg-gray-100"
          >
            Cancel
          </Button>
        </div>

        <ProductForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default AddProduct;
