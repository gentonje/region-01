import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Menu, ShoppingCart, Trash2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const WishlistPage = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  const { data: wishlistData, isLoading: isWishlistLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      try {
        if (!session?.user) return null;

        const { data: wishlist, error: wishlistError } = await supabase
          .from("wishlists")
          .select("id")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (wishlistError) throw wishlistError;
        return wishlist;
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        return null;
      }
    },
    enabled: !!session?.user
  });

  const { data: wishlistItems, isLoading: isItemsLoading } = useQuery({
    queryKey: ["wishlist_items", wishlistData?.id],
    queryFn: async () => {
      try {
        if (!wishlistData?.id) return [];

        const { data: items, error: itemsError } = await supabase
          .from("wishlist_items")
          .select(`
            product_id,
            products (
              id,
              title,
              description,
              price,
              currency,
              category,
              in_stock,
              product_images (
                storage_path,
                is_main
              ),
              user_id
            )
          `)
          .eq("wishlist_id", wishlistData.id);

        if (itemsError) throw itemsError;

        return items.map(item => item.products) as Product[];
      } catch (error) {
        console.error("Error fetching wishlist items:", error);
        return [];
      }
    },
    enabled: !!wishlistData?.id
  });

  const handleAddToCart = async (product: Product) => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .insert({
          product_id: product.id,
          user_id: session?.user?.id,
          quantity: 1
        });

      if (error) throw error;
      toast.success("Added to cart successfully");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  const handleShare = async (product: Product) => {
    try {
      await navigator.share({
        title: product.title || "Check out this product",
        text: product.description || "I found this interesting product",
        url: window.location.origin + "/product/" + product.id
      });
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share product");
    }
  };

  const getProductImageUrl = (product: Product) => {
    const mainImage = product.product_images?.find(img => img.is_main === true);
    if (mainImage?.storage_path) {
      const { data } = supabase.storage
        .from("images")
        .getPublicUrl(mainImage.storage_path);
      return data.publicUrl;
    }
    return "/placeholder.svg";
  };

  if (isWishlistLoading || isItemsLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!wishlistItems?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg font-medium">Your wishlist is empty</p>
        <Button onClick={() => navigate("/")}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((product) => (
          <div key={product.id} className="relative">
            <ProductCard
              product={product}
              getProductImageUrl={getProductImageUrl}
              selectedCurrency="SSP"
              onClick={() => navigate(`/product/${product.id}`)}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-white">
                <DropdownMenuItem onClick={() => handleAddToCart(product)}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare(product)}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => {
                    // Remove from wishlist functionality will be handled by WishlistButton
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;