
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductForm } from "@/components/ProductForm";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProfileCompleteness } from "@/hooks/useProfileCompleteness";
import { ProductCategory } from "@/types/product";
import { ProductImageSection } from "@/components/ProductImageSection";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { uploadProductImage } from "@/utils/uploadImage";

const AddProduct = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isProfileComplete, isLoading, requiredFields } = useProfileCompleteness();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Image state
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<(File | null)[]>([null, null, null, null]);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: ProductCategory.Other,
    available_quantity: "1",
    county: "",
    country: "",
    validity_period: "day" as "day" | "week" | "month",
  });

  // Redirect or show warning if profile is incomplete
  useEffect(() => {
    if (!isLoading && !isProfileComplete) {
      toast.warning("Please complete your profile before adding products", {
        action: {
          label: "Edit Profile",
          onClick: () => navigate("/edit-profile")
        }
      });
    }
  }, [isProfileComplete, isLoading, navigate]);

  // This function adapts the useState setter to what ProductForm expects
  const handleFormDataChange = (data: Partial<typeof formData>) => {
    setFormData(currentData => ({
      ...currentData,
      ...data
    }));
  };

  const handleSubmit = async (productData: typeof formData) => {
    if (!user) {
      toast.error("You must be logged in to add a product");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Validate required fields
      if (!productData.title || !productData.price || !productData.country || !productData.county) {
        toast.error("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }
      
      // Validate images
      if (!mainImage) {
        toast.error("Please upload a main product image");
        setIsSubmitting(false);
        return;
      }
      
      // Upload main image
      let mainImagePath;
      try {
        const countryId = Number(productData.country);
        mainImagePath = await uploadProductImage(mainImage, countryId, productData.category.toString());
      } catch (error) {
        console.error("Error uploading main image:", error);
        toast.error("Failed to upload main image");
        setIsSubmitting(false);
        return;
      }
      
      // Upload additional images
      const additionalImagePaths: string[] = [];
      for (const file of additionalImages.filter((f): f is File => f !== null)) {
        try {
          const countryId = Number(productData.country);
          const path = await uploadProductImage(file, countryId, productData.category.toString());
          additionalImagePaths.push(path);
        } catch (error) {
          console.error("Error uploading additional image:", error);
          // Continue with other uploads even if one fails
        }
      }
      
      // Prepare product data for saving
      const productRecord = {
        title: productData.title,
        description: productData.description || "",
        price: parseFloat(productData.price),
        category: productData.category,
        available_quantity: parseInt(productData.available_quantity),
        user_id: user.id,
        county: productData.county,
        country_id: parseInt(productData.country),
        storage_path: mainImagePath,
        validity_period: productData.validity_period
      };
      
      // Insert product
      const { data: productData1, error: productError } = await supabase
        .from('products')
        .insert(productRecord)
        .select()
        .single();
      
      if (productError) {
        throw new Error(productError.message);
      }
      
      // Save product images
      if (productData1?.id) {
        // Save main image record
        await supabase
          .from('product_images')
          .insert({
            product_id: productData1.id,
            storage_path: mainImagePath,
            is_main: true,
            display_order: 0
          });
        
        // Save additional images
        for (let i = 0; i < additionalImagePaths.length; i++) {
          await supabase
            .from('product_images')
            .insert({
              product_id: productData1.id,
              storage_path: additionalImagePaths[i],
              is_main: false,
              display_order: i + 1
            });
        }
      }
      
      toast.success("Product added successfully!");
      navigate("/my-products");
      
    } catch (error: any) {
      console.error("Error adding product:", error);
      toast.error(error.message || "Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-1 m-1 p-1 max-w-4xl mx-auto">
      <BreadcrumbNav
        items={[
          { href: "/products", label: "Home" },
          { href: "/my-products", label: "My Products" },
          { label: "Add Product", isCurrent: true }
        ]}
      />
      
      {!isProfileComplete ? (
        <div className="space-y-2">
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your profile is incomplete. Please complete your profile before adding products.
            </AlertDescription>
          </Alert>
          
          <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
            <h1 className="text-xl font-semibold">Profile Completion Required</h1>
            <p>Before you can add products, you need to complete your profile with the following information:</p>
            
            <ul className="list-disc pl-5 space-y-1">
              {!requiredFields.username && <li>Username</li>}
              {!requiredFields.fullName && <li>Full Name</li>}
            </ul>
            
            <Button 
              onClick={() => navigate("/edit-profile")}
              className="mt-4"
            >
              Complete Your Profile
            </Button>
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold">Add New Product</h1>
          
          <ProductImageSection
            mainImage={mainImage}
            setMainImage={setMainImage}
            additionalImages={additionalImages}
            setAdditionalImages={setAdditionalImages}
            additionalImageUrls={[]}
            onDeleteExisting={() => {}}
            isLoading={isSubmitting}
          />

          <ProductForm 
            formData={formData}
            setFormData={handleFormDataChange}
            isLoading={isSubmitting}
            submitButtonText="Add Product"
            onSubmit={handleSubmit}
          />
        </>
      )}
    </div>
  );
};

export default AddProduct;
