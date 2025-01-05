import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { WishlistItem } from "@/components/wishlist/WishlistItem";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Wishlist = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: wishlistItems, isLoading } = useQuery({
    queryKey: ["wishlist-items"],
    queryFn: async () => {
      if (!session?.user) {
        navigate("/login");
        return [];
      }

      // First get the user's wishlist
      const { data: wishlists, error: wishlistError } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (wishlistError) {
        // If no wishlist exists, create one
        if (wishlistError.code === "PGRST116") {
          const { data: newWishlist, error: createError } = await supabase
            .from("wishlists")
            .insert({
              user_id: session.user.id,
              name: "My Wishlist",
            })
            .select()
            .single();

          if (createError) throw createError;
          return [];
        }
        throw wishlistError;
      }

      // Get wishlist items with product details
      const { data: items, error: itemsError } = await supabase
        .from("wishlist_items")
        .select(`
          id,
          product_id,
          products (
            id,
            title,
            description,
            price,
            currency,
            in_stock,
            product_images (
              storage_path,
              is_main
            )
          )
        `)
        .eq("wishlist_id", wishlists.id);

      if (itemsError) throw itemsError;
      return items;
    },
    enabled: !!session?.user,
  });

  if (!session) {
    navigate("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold">My Wishlist</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">My Wishlist</h1>
      {wishlistItems && wishlistItems.length > 0 ? (
        <div className="space-y-4">
          {wishlistItems.map((item: any) => (
            <WishlistItem 
              key={item.id} 
              item={item} 
              product={item.products as Product}
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8">
          Your wishlist is empty. Browse products to add items to your wishlist.
        </p>
      )}
    </div>
  );
};

export default Wishlist;