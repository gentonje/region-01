
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCategories } from "@/hooks/useCategories";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { CategoriesList } from "@/components/admin/categories/CategoriesList";
import { CategoryPageHeader } from "@/components/admin/categories/CategoryPageHeader";
import { ProductCategory } from "@/types/product";

interface Category {
  id: string;
  name: ProductCategory;
}

const AdminCategories = () => {
  // State for category form
  const [categoryName, setCategoryName] = useState<ProductCategory | "">("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get admin status and categories data from hooks
  const { isSuperAdmin, isCheckingAdmin } = useAdminStatus();
  const {
    categories,
    isLoadingCategories,
    addCategoryMutation,
    editCategoryMutation,
    deleteCategoryMutation
  } = useCategories();

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
      <CategoryPageHeader
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        editingCategory={editingCategory}
      />
      
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
