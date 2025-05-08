
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Loader2, PlusCircle } from "lucide-react";
import { CategoriesList } from "@/components/admin/categories/CategoriesList";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ProductCategory } from "@/types/product";

interface Category {
  id: string;
  name: ProductCategory;
}

const AdminCategories = () => {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  
  // State for category form
  const [categoryName, setCategoryName] = useState<ProductCategory | "">("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch super admin status
  const { data: isSuperAdmin, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ["isSuperAdmin"],
    queryFn: async () => {
      if (!session?.user) return false;
      
      const { data, error } = await supabase.rpc('is_super_admin', {
        user_id: session.user.id
      });
      
      if (error) {
        console.error('Error checking super admin status:', error);
        return false;
      }
      
      return data;
    },
  });

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
    enabled: !!isSuperAdmin,
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
      resetForm();
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
      resetForm();
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

  // Reset form and close dialog
  const resetForm = () => {
    setEditingCategory(null);
    setCategoryName("");
    setIsDialogOpen(false);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryName) {
      toast.error("Please select a category");
      return;
    }
    
    if (editingCategory) {
      editCategoryMutation.mutate({
        id: editingCategory.id,
        name: categoryName
      });
    } else {
      addCategoryMutation.mutate({
        name: categoryName
      });
    }
  };

  // Handle edit category
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setIsDialogOpen(true);
  };

  // Handle delete category
  const handleDeleteCategory = async (id: string, name: ProductCategory) => {
    if (confirm(`Are you sure you want to delete the category "${name}"?`)) {
      deleteCategoryMutation.mutate(id);
    }
  };

  if (isCheckingAdmin) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbNav
        items={[
          { href: "/products", label: "Home" },
          { href: "/admin/users", label: "Admin" },
          { label: "Categories Management", isCurrent: true }
        ]}
      />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Categories Management</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          
          {isDialogOpen && (
            <CategoryForm
              editingCategory={editingCategory}
              onSubmit={handleSubmit}
              categoryName={categoryName}
              setCategoryName={setCategoryName}
              isPending={addCategoryMutation.isPending || editCategoryMutation.isPending}
              onClose={resetForm}
            />
          )}
        </Dialog>
      </div>

      <CategoriesList
        categories={categories}
        isLoading={isLoadingCategories}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
        deleteIsLoading={deleteCategoryMutation.isPending}
      />
    </div>
  );
};

export default AdminCategories;
