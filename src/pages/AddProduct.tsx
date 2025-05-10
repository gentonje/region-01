
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

const AddProduct = () => {
  const navigate = useNavigate();
  const { isProfileComplete, isLoading, requiredFields } = useProfileCompleteness();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    // This would be implemented with actual product submission code
    // It's just a placeholder to satisfy the type requirements
    console.log("Product data to submit:", productData);
    return Promise.resolve();
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
