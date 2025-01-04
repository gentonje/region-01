import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { ProductForm } from "@/components/ProductForm";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProductImages } from "@/hooks/useProductImages";

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { uploadImages } = useProductImages();

  const { data: product, isLoading } = useQuery({
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
    const { title, description, price, category } = formData;

    try {
      await supabase
        .from("products")
        .update({ title, description, price, category })
        .eq("id", id);

      toast.success("Product updated successfully");
      navigate("/modify-products");
    } catch (error) {
      toast.error("Failed to update product");
      console.error(error);
    }
  };

  if (isLoading) {
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

        <ProductForm 
          onSubmit={handleSubmit}
          initialData={product}
        />
      </div>
    </div>
  );
};

export default EditProduct;
