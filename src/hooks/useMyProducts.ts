
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product, ValidityPeriod } from "@/types/product";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Profile } from "@/types/profile";

export const useMyProducts = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const queryClient = useQueryClient();
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const pageSize = 10;
  
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
        let validityPeriod: ValidityPeriod = ValidityPeriod.Day;
        
        if (product.validity_period === ValidityPeriod.Day || 
            product.validity_period === ValidityPeriod.Week || 
            product.validity_period === ValidityPeriod.Month) {
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

  // Fetch user profile to check if it's complete
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
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
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    
    fetchProfile();
  }, []);

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

  const handleDelete = async (productId: string): Promise<void> => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct.mutate(productId);
    }
  };

  return {
    products,
    isLoading,
    currentPage,
    totalPages,
    setCurrentPage,
    handleDelete,
    isProfileComplete,
    userProfile
  };
};
