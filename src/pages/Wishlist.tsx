
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { WishlistItem } from "@/components/wishlist/WishlistItem";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Wishlist = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  const { data: wishlistItems, isLoading, error, refetch } = useQuery({
    queryKey: ["wishlist-items", session?.user?.id],
    queryFn: async () => {
      if (!session?.user) {
        return [];
      }

      try {
        console.log("Fetching wishlist for user:", session.user.id);
        
        // Get the user's wishlist
        const { data: wishlists, error: wishlistError } = await supabase
          .from("wishlists")
          .select("id")
          .eq("user_id", session.user.id);

        if (wishlistError) {
          console.error("Error fetching wishlists:", wishlistError);
          return [];
        }

        if (!wishlists || wishlists.length === 0) {
          console.log("No wishlist found for user, creating one");
          const { data: newWishlist, error: createError } = await supabase
            .from("wishlists")
            .insert({
              user_id: session.user.id,
              name: "My Wishlist",
              visibility: "private"
            })
            .select("id")
            .single();

          if (createError) {
            console.error("Error creating wishlist:", createError);
            return [];
          }
          
          console.log("Created new wishlist:", newWishlist);
          return [];
        }

        // Use the first wishlist
        const wishlistId = wishlists[0]?.id;
        console.log("Using wishlist ID:", wishlistId);

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
              category,
              product_images (
                storage_path,
                is_main
              )
            )
          `)
          .eq("wishlist_id", wishlistId);

        if (itemsError) {
          console.error("Error fetching wishlist items:", itemsError);
          return [];
        }

        console.log("Wishlist items fetched:", items);
        return items || [];
      } catch (error) {
        console.error("Unexpected error:", error);
        return [];
      }
    },
    enabled: !!session?.user,
    retry: 1,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 1, // 1 minute
  });

  useEffect(() => {
    // Force refetch when the component mounts
    refetch();
  }, [refetch, session?.user?.id]);

  if (error) {
    console.error("Wishlist query error:", error);
    toast.error("Failed to load wishlist items");
  }

  if (!session) {
    navigate("/login");
    return null;
  }

  return (
    <div className="w-full">
      <div className="container w-full mx-auto px-0 md:px-0 pt-20 pb-16">
        <div className="w-full max-w-none mx-auto space-y-1 m-1 p-1">
          <BreadcrumbNav
            items={[
              { label: "Home", href: "/" },
              { label: "Wishlist" },
            ]}
          />
          
          <div className="flex justify-between items-center m-1 p-1">
            <div className="flex items-center gap-1 space-x-1">
              <Heart className="h-6 w-6 fill-amber-400 text-amber-400" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="flex items-center gap-1 border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 m-1 p-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Button>
          </div>
          
          {isLoading ? (
            <div className="space-y-1">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full bg-gray-200 dark:bg-gray-700 m-1 p-1" />
              ))}
            </div>
          ) : wishlistItems && wishlistItems.length > 0 ? (
            <div className="space-y-1">
              {wishlistItems.map((item: any) => (
                <WishlistItem 
                  key={item.id} 
                  item={item} 
                  product={item.products as Product}
                  onItemRemoved={refetch}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-1 border border-gray-200 dark:border-gray-700 m-1">
              <Heart className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <p className="text-gray-700 dark:text-gray-300 font-medium text-lg mt-1 mb-1">
                Your wishlist is empty. Browse products to add items to your wishlist.
              </p>
              <Button 
                onClick={() => navigate("/products")}
                className="bg-blue-600 hover:bg-blue-700 text-white m-1 p-1"
              >
                Start Shopping
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
