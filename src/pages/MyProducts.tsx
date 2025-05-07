
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ModifyProductsList } from "@/components/ModifyProductsList";
import { Product } from "@/types/product";

const MyProducts = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const pageSize = 10;

  const {
    data: products,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["my-products", page],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not logged in");

      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          profiles:user_id (
            username,
            full_name
          ),
          product_images:product_images (
            id,
            storage_path,
            is_main,
            display_order
          )
        `)
        .eq("user_id", user.id)
        .range((page - 1) * pageSize, page * pageSize - 1)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Simplified type casting - avoid deep nesting
      return data as any[] as Product[];
    },
  });

  useEffect(() => {
    if (products) {
      if (page === 1) {
        setMyProducts(products);
      } else {
        setMyProducts((prev) => [...prev, ...products]);
      }
      
      setHasMore(products.length === pageSize);
    }
  }, [products, page]);

  const loadMoreProducts = () => {
    if (hasMore && !isLoading) {
      setPage((prev) => prev + 1);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      // First delete product images
      const { data: productImages, error: imagesError } = await supabase
        .from("product_images")
        .select("storage_path")
        .eq("product_id", productId);
      
      if (imagesError) throw imagesError;

      // Delete image files from storage
      for (const image of productImages || []) {
        if (image.storage_path) {
          const { error: storageError } = await supabase.storage
            .from("images")
            .remove([image.storage_path]);
          
          if (storageError) console.error("Error deleting image:", storageError);
        }
      }

      // Delete the product
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);
      
      if (deleteError) throw deleteError;

      toast.success("Product deleted successfully");
      
      // Update local state
      setMyProducts((prev) => prev.filter((product) => product.id !== productId));
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="mx-1 sm:mx-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Products</h1>
        <Button onClick={() => navigate("/add-product")} className="gap-1">
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </Button>
      </div>

      <ModifyProductsList
        products={myProducts}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={loadMoreProducts}
        onDelete={handleDeleteProduct}
      />
    </div>
  );
};

export default MyProducts;
