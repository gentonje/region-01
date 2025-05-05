
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { ProductForm } from "@/components/ProductForm";
import { ProductImageSection } from "@/components/ProductImageSection";
import { addProduct } from "@/services/productService";
import { useState } from "react";
import { toast } from "sonner";
import { ProductFormData } from "@/components/forms/product/validation";
import { ProductCategory } from "@/types/product";

const AddProduct = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<Array<File | null>>([]);

  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    description: "",
    price: "",
    category: "Other" as ProductCategory,
    available_quantity: "1",
    county: "",
    country: "",
  });

  const handleSubmit = async (data: ProductFormData) => {
    try {
      if (!mainImage) {
        toast.error("Please upload a main product image");
        return;
      }

      setIsLoading(true);
      const result = await addProduct(data, mainImage, additionalImages.filter(Boolean) as File[]);
      
      if (result.success) {
        toast.success("Product added successfully!");
        navigate("/my-products");
      } else {
        toast.error(result.error || "Failed to add product");
      }
    } catch (error: any) {
      console.error("Error adding product:", error);
      toast.error(error.message || "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <ProductImageSection 
            mainImage={mainImage}
            setMainImage={setMainImage}
            additionalImages={additionalImages}
            setAdditionalImages={setAdditionalImages}
            additionalImageUrls={[]}
            isLoading={isLoading}
          />
          
          <div className="mt-8">
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
