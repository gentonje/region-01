
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Product } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { WishlistItem } from "@/components/wishlist/WishlistItem";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Wishlist = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

  const { data: wishlist, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      if (!session?.user) {
        navigate("/login");
        return [];
      }

      const { data: wishlistData, error } = await supabase
        .from("wishlist")
        .select(`
          product_id,
          products (
            *,
            product_images (
              id,
              storage_path,
              is_main,
              display_order
            )
          )
        `)
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error fetching wishlist:", error);
        toast.error("Failed to load your wishlist. Please try again.");
        return [];
      }

      return wishlistData.map((item) => item.products) as Product[];
    },
    enabled: !!session?.user,
  });

  useEffect(() => {
    if (wishlist) {
      setWishlistItems(wishlist);
    }
  }, [wishlist]);

  const getProductImageUrl = (product: Product) => {
    if (
      !product.product_images ||
      product.product_images.length === 0 ||
      !product.product_images[0].storage_path
    ) {
      return "/placeholder.svg";
    }

    return supabase.storage
      .from("images")
      .getPublicUrl(product.product_images[0].storage_path).data.publicUrl;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your wishlist...</span>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <h1 className="text-2xl font-bold mb-4">Your Wishlist</h1>
        <p className="text-muted-foreground mb-6">
          You haven't added any products to your wishlist yet.
        </p>
        <button
          onClick={() => navigate("/products")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Your Wishlist</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((product) => (
          <WishlistItem
            key={product.id}
            product={product}
            imageUrl={getProductImageUrl(product)}
          />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
