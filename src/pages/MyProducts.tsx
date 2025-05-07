
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ModifyProductsList } from "@/components/ModifyProductsList";
import { ModifyProductsPagination } from "@/components/ModifyProductsPagination";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

const MyProducts = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const queryClient = useQueryClient();
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
      return data;
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

  const handleDelete = (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct.mutate(productId);
    }
  };

  const handleEdit = (productId: string) => {
    navigate(`/edit-product/${productId}`);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <BreadcrumbNav
        items={[
          { href: "/products", label: "Home" },
          { label: "My Products", isCurrent: true }
        ]}
      />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Products</h1>
        <Button onClick={() => navigate("/add-product")} className="flex items-center gap-2">
          <Plus size={16} /> Add New Product
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : products && products.length > 0 ? (
        <>
          <ModifyProductsList
            products={products}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
          <ModifyProductsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">You haven't created any products yet.</p>
          <Button onClick={() => navigate("/add-product")} className="flex items-center gap-2">
            <Plus size={16} /> Add Your First Product
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyProducts;
