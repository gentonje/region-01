
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import ProductList from "@/components/ProductList";
import { Product } from "@/types/product";

// Fixed interface to avoid excessive type instantiation
interface WishlistItem {
  product_id: string;
}

const Wishlist = () => {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const queryClient = useQueryClient();
  
  // Fetch wishlist items with related products
  const { data: wishlist, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not logged in");

      // Get wishlist_items table data which contains product_id for each item
      const { data, error } = await supabase
        .from("wishlist_items")
        .select("product_id")
        .eq("user_id", user.id);

      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Get all product details for the wishlist items
      const productIds = data.map(item => item.product_id);
      
      const { data: products, error: productsError } = await supabase
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
        .in("id", productIds);
      
      if (productsError) throw productsError;
      
      return products as Product[];
    }
  });

  // Delete mutation for removing items from wishlist
  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not logged in");

      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (error) throw error;
      
      return productId;
    },
    onSuccess: (productId) => {
      setWishlistProducts(prev => prev.filter(product => product.id !== productId));
      toast.success("Product removed from wishlist");
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onError: (error) => {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    }
  });

  useEffect(() => {
    if (wishlist) {
      setWishlistProducts(wishlist);
    }
  }, [wishlist]);

  const getProductImageUrl = (product: Product) => {
    if (!product.product_images || product.product_images.length === 0) {
      return "/placeholder.svg";
    }

    return supabase.storage
      .from("images")
      .getPublicUrl(product.product_images[0].storage_path).data.publicUrl;
  };

  const handleProductClick = (product: Product) => {
    window.location.href = `/product/${product.id}`;
  };

  const handleDelete = async (productId: string) => {
    deleteMutation.mutate(productId);
  };

  return (
    <div className="mx-1 sm:mx-4 py-8">
      <BreadcrumbNav
        items={[
          { href: "/products", label: "Home" },
          { label: "Wishlist" },
        ]}
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="h-6 w-6 text-red-500" /> Wishlist
        </h1>
      </div>

      <ProductList
        products={wishlistProducts}
        getProductImageUrl={getProductImageUrl}
        onProductClick={handleProductClick}
        isLoading={isLoading}
        observerRef={() => {}}
        selectedCurrency="USD"
        onDelete={handleDelete}
        emptyMessage="Your wishlist is empty"
      />
    </div>
  );
};

export default Wishlist;
