
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { ProductForm } from "@/components/ProductForm";
import { toast } from "sonner";
import { useProductImages } from "@/hooks/useProductImages";
import { useState, useEffect } from "react";
import { ProductImageSection } from "@/components/ProductImageSection";
import { productPageStyles as styles } from "@/styles/productStyles";
import { ProductCategory, VALIDITY_PERIODS } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ProductFormData } from "@/components/forms/product/validation";
import { useSelectedCountry } from "@/Routes";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { getCurrencyForCountry } from "@/utils/countryToCurrency";
import { useQuery } from "@tanstack/react-query";

const AddProduct = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { mainImage, setMainImage, additionalImages, setAdditionalImages, uploadImages } = useProductImages();
  const { user } = useAuth();
  const { selectedCountry = "1" } = useSelectedCountry() || {}; // Default to Kenya (id: 1)
  
  // Get user's account type and product count
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("account_type, custom_product_limit")
          .eq("id", user.id)
          .single();
        
        if (error) {
          console.error("Error fetching user profile:", error);
          return {
            account_type: "basic",
            custom_product_limit: null
          };
        }
          
        return data;
      } catch (error) {
        console.error("Error in profile query:", error);
        return {
          account_type: "basic",
          custom_product_limit: null
        };
      }
    },
    enabled: !!user,
  });
  
  // Get count of user's products
  const { data: productCount } = useQuery({
    queryKey: ["userProductCount", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      const { count } = await supabase
        .from("products")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id);
        
      return count || 0;
    },
    enabled: !!user,
  });
  
  // Default validity period based on account type
  const getDefaultValidityPeriod = () => {
    const accountType = userProfile?.account_type || 'basic';
    switch (accountType) {
      case 'premium':
        return 'month';
      case 'starter':
        return 'week';
      default:
        return 'day';
    }
  };
  
  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    description: "",
    price: "",
    category: "Other" as ProductCategory,
    available_quantity: "0",
    county: "",
    country: selectedCountry, // Default to selected country
    validity_period: getDefaultValidityPeriod(),
  });
  
  // Update form data when userProfile loads
  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        validity_period: getDefaultValidityPeriod()
      }));
    }
  }, [userProfile]);

  // Update form currency when country changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      country: selectedCountry
    }));
  }, [selectedCountry]);
  
  // Check if user has reached product limit
  const getProductLimit = () => {
    if (!userProfile) return 5; // Default basic limit
    
    // Custom limit for enterprise accounts
    if (userProfile.custom_product_limit) {
      return userProfile.custom_product_limit;
    }
    
    // Standard limits based on account type
    switch (userProfile.account_type) {
      case 'premium':
        return 30;
      case 'starter':
        return 15;
      default:
        return 5; // Basic account
    }
  };

  const handleSubmit = async (data: ProductFormData) => {
    if (!mainImage) {
      toast.error("Please upload a main product image");
      return;
    }

    if (!user?.id) {
      toast.error("You must be logged in to add a product");
      return;
    }

    if (!data.county) {
      toast.error("Please select a county");
      return;
    }
    
    if (!data.country) {
      toast.error("Please select a country");
      return;
    }
    
    // Check if user has reached product limit
    const limit = getProductLimit();
    if (productCount && productCount >= limit) {
      toast.error(`You've reached your product limit (${limit}). Upgrade your account to add more products.`);
      return;
    }

    setIsLoading(true);
    try {
      console.log("Uploading images...");
      const { mainImagePath, additionalImagePaths } = await uploadImages(mainImage, additionalImages);
      console.log("Images uploaded successfully:", { mainImagePath, additionalImagePaths });

      // Get the appropriate currency for the selected country
      const currency = getCurrencyForCountry(data.country);
      console.log(`Using currency ${currency} for country ID ${data.country}`);
      
      // Calculate expiration date based on validity period
      const validityPeriod = data.validity_period || getDefaultValidityPeriod();
      const daysToAdd = VALIDITY_PERIODS[validityPeriod as "day" | "week" | "month"];
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + daysToAdd);

      console.log("Creating product...");
      
      // Create product data object with proper type casting for database
      const productData = {
        title: data.title,
        description: data.description,
        price: Number(data.price),
        category: data.category as any, // Cast to any to avoid type issues with the database
        available_quantity: Number(data.available_quantity),
        storage_path: mainImagePath,
        county: data.county,
        country_id: Number(data.country),
        currency: currency,
        user_id: user!.id,
        product_status: 'published',
        expires_at: expiresAt.toISOString(),
        validity_period: validityPeriod as string
      };
      
      const { data: insertedProduct, error: productError } = await supabase
        .from("products")
        .insert(productData)
        .select()
        .single();

      if (productError) throw productError;

      // Insert main image into product_images table
      const { error: mainImageError } = await supabase
        .from("product_images")
        .insert({
          product_id: insertedProduct.id,
          storage_path: mainImagePath,
          is_main: true,
          display_order: 0
        });

      if (mainImageError) throw mainImageError;

      // Insert additional images into product_images table
      if (additionalImagePaths.length > 0) {
        const additionalImagesData = additionalImagePaths.map((path, index) => ({
          product_id: insertedProduct.id,
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
      
      // Add a short delay to allow for the toast to be displayed before navigation
      setTimeout(() => {
        navigate("/my-products");
      }, 500);
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
      
      <div className="max-w-2xl mx-1 px-1 py-1 sm:px-1 lg:px-1 pb-16 mt-1">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1 overflow-y-auto">
          <div className="flex flex-col gap-1 sticky top-0 bg-white dark:bg-gray-800 z-10 pb-1 border-b border-gray-200 dark:border-gray-700">
            <BreadcrumbNav
              items={[
                { href: "/products", label: "Products" },
                { href: "/my-products", label: "My Products" },
                { label: "Add New Product", isCurrent: true }
              ]}
            />
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 dark:font-bold">Add New Product</h1>
            
            {productCount !== undefined && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Products: {productCount} / {getProductLimit()}
              </div>
            )}
            
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

          <div className="space-y-1">
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
