import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Confetti from "@/components/Confetti";
import { Database } from "@/integrations/supabase/types";
import { ProductForm } from "@/components/ProductForm";
import { ProductImageUpload } from "@/components/ProductImageUpload";
import { uploadImage } from "@/utils/uploadImage";

type ProductCategory = Database["public"]["Enums"]["product_category"];

const AddProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<(File | null)[]>([null, null, null, null]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "Electronics" as ProductCategory,
    available_quantity: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mainImage) {
      toast({
        title: "Error",
        description: "Main product image is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: "Error",
          description: "You must be logged in to add products",
          variant: "destructive",
        });
        return;
      }

      // Insert product first
      const { data: productData, error: productError } = await supabase
        .from("products")
        .insert({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          user_id: userData.user.id,
          seller_id: userData.user.id,
          available_quantity: parseInt(formData.available_quantity),
          storage_path: "placeholder.svg",
        })
        .select()
        .single();

      if (productError) throw productError;

      // Upload main image
      const mainImagePath = await uploadImage(mainImage, productData.id, true, 0);

      // Update product with main image path
      await supabase
        .from("products")
        .update({ storage_path: mainImagePath })
        .eq("id", productData.id);

      // Upload additional images
      for (let i = 0; i < additionalImages.length; i++) {
        if (additionalImages[i]) {
          await uploadImage(additionalImages[i], productData.id, false, i + 1);
        }
      }

      setShowConfetti(true);
      toast({
        title: "Success",
        description: "Product added successfully!",
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <ProductImageUpload
              label="Main Product Image (Required)"
              onChange={setMainImage}
              required
              isLoading={isLoading}
            />

            {[0, 1, 2, 3].map((index) => (
              <ProductImageUpload
                key={index}
                label={`Additional Image ${index + 1}${index === 0 ? ' (Required)' : ' (Optional)'}`}
                onChange={(file) => {
                  setAdditionalImages(prev => {
                    const newImages = [...prev];
                    newImages[index] = file;
                    return newImages;
                  });
                }}
                required={index === 0}
                isLoading={isLoading}
              />
            ))}
          </div>

          <ProductForm
            formData={formData}
            setFormData={setFormData}
            isLoading={isLoading}
            submitButtonText="Add Product"
          />
        </form>
      </div>
      <Confetti isActive={showConfetti} />
    </div>
  );
};

export default AddProduct;