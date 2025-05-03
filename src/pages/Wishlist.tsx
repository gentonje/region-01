
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Product } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { WishlistItem } from "@/components/wishlist/WishlistItem";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getStorageUrl } from "@/utils/storage";

interface WishlistItemWithProduct {
  id: string;
  product_id: string;
  products: Product;
}

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

      // First get the user's wishlist id
      const { data: userWishlist, error: wishlistError } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (wishlistError) {
        console.error("Error fetching wishlist:", wishlistError);
        toast.error("Failed to load your wishlist. Please try again.");
        return [];
      }

      if (!userWishlist) {
        console.log("No wishlist found for user");
        return [];
      }

      // Then get the items in the wishlist with product details
      const { data: items, error: itemsError } = await supabase
        .from("wishlist_items")
        .select(`
          id,
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
        .eq("wishlist_id", userWishlist.id);

      if (itemsError) {
        console.error("Error fetching wishlist items:", itemsError);
        toast.error("Failed to load your wishlist items. Please try again.");
        return [];
      }

      // Convert the items to the correct format
      const productList: Product[] = items.map((item: WishlistItemWithProduct) => item.products);
      return productList;
    },
    enabled: !!session?.user,
  });

  useEffect(() => {
    if (wishlist) {
      setWishlistItems(wishlist);
    }
  }, [wishlist]);

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
            item={{
              id: "", // This will be regenerated when removing from wishlist
              product_id: product.id
            }}
            onItemRemoved={() => {
              // Refresh the wishlist data after item removal
              setWishlistItems(prev => prev.filter(p => p.id !== product.id));
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
