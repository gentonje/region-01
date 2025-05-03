
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import ProductList from "@/components/ProductList";
import { Product } from "@/types/product";

const Wishlist = () => {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  
  const { data: wishlist, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not logged in");

      const { data, error } = await supabase
        .from("wishlist")
        .select(`
          *,
          products (
            *,
            product_images (
              id,
              storage_path
            )
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (wishlist) {
      const products = wishlist
        .map((item) => item.products)
        .filter((product): product is Product => !!product);
      setWishlistProducts(products);
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not logged in");

      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (error) throw error;

      setWishlistProducts((prev) => 
        prev.filter((product) => product.id !== productId)
      );

      toast.success("Product removed from wishlist");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    }
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
