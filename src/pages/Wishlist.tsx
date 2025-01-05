import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { WishlistItem } from "@/components/wishlist/WishlistItem";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

const Wishlist = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  const { data: wishlistItems, isLoading } = useQuery({
    queryKey: ["wishlist-items"],
    queryFn: async () => {
      if (!session?.user) {
        navigate("/login");
        return [];
      }

      try {
        // First try to get the existing wishlist
        const { data: existingWishlist, error: fetchError } = await supabase
          .from("wishlists")
          .select("id")
          .eq("user_id", session.user.id)
          .maybeSingle();

        let wishlistId;

        if (fetchError) {
          console.error("Error fetching wishlist:", fetchError);
          toast({
            title: "Error",
            description: "Failed to fetch wishlist",
            variant: "destructive",
          });
          return [];
        }

        // If no wishlist exists, create one
        if (!existingWishlist) {
          const { data: newWishlist, error: createError } = await supabase
            .from("wishlists")
            .insert({
              user_id: session.user.id,
              name: "My Wishlist",
              visibility: "private"
            })
            .select("id")
            .maybeSingle();

          if (createError || !newWishlist) {
            console.error("Error creating wishlist:", createError);
            toast({
              title: "Error",
              description: "Failed to create wishlist",
              variant: "destructive",
            });
            return [];
          }

          wishlistId = newWishlist.id;
        } else {
          wishlistId = existingWishlist.id;
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
          .eq("wishlist_id", wishlistId);

        if (itemsError) {
          console.error("Error fetching wishlist items:", itemsError);
          toast({
            title: "Error",
            description: "Failed to fetch wishlist items",
            variant: "destructive",
          });
          return [];
        }

        return items || [];
      } catch (error) {
        console.error("Unexpected error:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
        return [];
      }
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
      <BreadcrumbNav
        items={[
          {
            label: "Wishlist",
          },
        ]}
      />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Wishlist</h1>
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Button>
      </div>
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
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Your wishlist is empty. Browse products to add items to your wishlist.
          </p>
          <Button onClick={() => navigate("/")}>
            Start Shopping
          </Button>
        </div>
      )}
    </div>
  );
};

export default Wishlist;