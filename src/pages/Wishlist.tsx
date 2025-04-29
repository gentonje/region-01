
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { WishlistItem } from "@/components/wishlist/WishlistItem";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { useAuth } from "@/contexts/AuthContext";

const Wishlist = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  const { data: wishlistItems, isLoading } = useQuery({
    queryKey: ["wishlist-items", session?.user?.id],
    queryFn: async () => {
      if (!session?.user) {
        navigate("/login");
        return [];
      }

      try {
        // Get the user's wishlist - here we select all wishlists for the user instead of using maybeSingle
        const { data: wishlists, error: wishlistError } = await supabase
          .from("wishlists")
          .select("id")
          .eq("user_id", session.user.id);

        if (wishlistError) {
          console.error("Error fetching wishlist:", wishlistError);
          toast({
            title: "Error",
            description: "Failed to fetch wishlist",
            variant: "destructive",
          });
          return [];
        }

        // If no wishlist exists, create one
        if (!wishlists || wishlists.length === 0) {
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
            toast({
              title: "Error",
              description: "Failed to create wishlist",
              variant: "destructive",
            });
            return [];
          }
          
          // Use the newly created wishlist
          return [];
        }

        // Use the first wishlist from the list (or handle multiple wishlists if needed)
        const wishlistId = wishlists[0]?.id;

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
    retry: 1
  });

  if (!session) {
    navigate("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-4 mt-20">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6 mt-20">
      <BreadcrumbNav
        items={[
          { label: "Home", href: "/" },
          { label: "Wishlist" },
        ]}
      />
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 fill-amber-400 text-amber-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
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
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
          <Heart className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <p className="text-gray-700 dark:text-gray-300 font-medium text-lg mt-4 mb-6">
            Your wishlist is empty. Browse products to add items to your wishlist.
          </p>
          <Button 
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Start Shopping
          </Button>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
