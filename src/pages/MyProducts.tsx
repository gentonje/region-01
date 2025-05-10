import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ModifyProductsList } from "@/components/ModifyProductsList";
import { ModifyProductsPagination } from "@/components/ModifyProductsPagination";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { Product, ValidityPeriod } from "@/types/product";
import { useAuth } from "@/contexts/AuthContext";
import { Profile } from "@/types/profile";
import { Alert, AlertDescription } from "@/components/ui/alert";

const MyProducts = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const pageSize = 10;

  // Fetch user profile to check if it's complete
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
          
        if (error) throw error;
        
        setUserProfile(data as Profile);
        
        // Check if profile is complete (has username and full_name)
        const isComplete = !!(data?.username && data?.full_name);
        setIsProfileComplete(isComplete);
        
        // Show notification if profile is incomplete
        if (!isComplete) {
          toast.warning("Please complete your profile before adding products", {
            action: {
              label: "Edit Profile",
              onClick: () => navigate("/edit-profile")
            }
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    
    fetchProfile();
  }, [user, navigate]);

  // Query to fetch user's products
  const {
    data: products,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["my-products", currentPage],
    queryFn: async () => {
      // First get the user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Count total products for pagination
      const { count, error: countError } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (countError) throw countError;
      
      if (count) {
        setTotalPages(Math.ceil(count / pageSize));
      }

      // Then fetch the paginated products
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_images (
            id,
            storage_path,
            is_main,
            display_order
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      if (error) throw error;
      
      // Transform data to ensure validity_period is properly typed
      const typedProducts = (data || []).map(product => {
        // Ensure validity_period is a valid enum value
        let validityPeriod: ValidityPeriod = 'day';
        
        if (product.validity_period === 'day' || 
            product.validity_period === 'week' || 
            product.validity_period === 'month') {
          validityPeriod = product.validity_period as ValidityPeriod;
        }
        
        return {
          ...product,
          validity_period: validityPeriod
        };
      });
      
      return typedProducts as Product[];
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);
      
      if (error) throw error;
      return productId;
    },
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete product: ${error.message}`);
    },
  });

  // Fix: Update to return Promise<void>
  const handleDelete = async (productId: string): Promise<void> => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct.mutate(productId);
    }
  };

  const handleEdit = (productId: string) => {
    navigate(`/edit-product/${productId}`);
  };

  const handleAddProduct = () => {
    if (!isProfileComplete) {
      toast.warning("Please complete your profile before adding products", {
        action: {
          label: "Edit Profile",
          onClick: () => navigate("/edit-profile")
        }
      });
      return;
    }
    
    navigate("/add-product");
  };

  return (
    <div className="space-y-1 m-1 p-1 mx-auto max-w-6xl">
      <div className="space-y-1">
        <BreadcrumbNav
          items={[
            { href: "/products", label: "Home" },
            { label: "My Products", isCurrent: true }
          ]}
        />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
          <h1 className="text-2xl font-bold">My Products</h1>
          <Button 
            onClick={handleAddProduct} 
            className="flex items-center gap-1"
            disabled={!isProfileComplete}
          >
            <Plus size={16} /> Add New Product
          </Button>
        </div>

        {!isProfileComplete && (
          <Alert variant="warning" className="mb-1">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your profile is incomplete. Please complete your profile before adding products.
              <Button 
                variant="link" 
                className="px-0 py-0 h-auto"
                onClick={() => navigate("/edit-profile")}
              >
                Complete Profile
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : products && products.length > 0 ? (
        <div className="space-y-1">
          <ModifyProductsList
            products={products}
            onDelete={handleDelete}
            isLoading={false}
            hasMore={false}
            onLoadMore={() => {}}
          />
          <ModifyProductsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            isMobile={isMobile}
          />
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 dark:bg-gray-800 dark:border-gray-700 space-y-1">
          <h3 className="text-lg font-medium">No products found</h3>
          <p className="text-muted-foreground">You haven't created any products yet.</p>
          {!isProfileComplete && (
            <Button 
              onClick={() => navigate("/edit-profile")} 
              className="flex items-center gap-1 mt-2"
              variant="secondary"
            >
              Complete Your Profile First
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default MyProducts;
