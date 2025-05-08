
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProductCategory } from "@/types/product";

interface Category {
  id: string;
  name: ProductCategory;
}

export const useCategories = () => {
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Category[];
    },
  });

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (category: { name: ProductCategory }) => {
      const { data, error } = await supabase
        .from("categories")
        .insert(category)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Category added successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      toast.error(`Failed to add category: ${error.message}`);
    },
  });

  // Edit category mutation
  const editCategoryMutation = useMutation({
    mutationFn: async (category: { id: string, name: ProductCategory }) => {
      const { data, error } = await supabase
        .from("categories")
        .update({ name: category.name })
        .eq("id", category.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      toast.error(`Failed to update category: ${error.message}`);
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      toast.error(`Failed to delete category: ${error.message}`);
    },
  });

  return {
    categories,
    isLoadingCategories,
    addCategoryMutation,
    editCategoryMutation,
    deleteCategoryMutation
  };
};
