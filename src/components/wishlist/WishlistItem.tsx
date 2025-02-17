import { useState } from "react";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageLoader } from "@/components/ImageLoader";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Share2, ShoppingCart, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WishlistItemProps {
  item: {
    id: string;
    product_id: string;
  };
  product: Product;
}

export const WishlistItem = ({ item, product }: WishlistItemProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const removeFromWishlist = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("id", item.id);

      if (error) throw error;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["wishlist-items"] });
      const previousItems = queryClient.getQueryData(["wishlist-items"]);
      
      queryClient.setQueryData(["wishlist-items"], (old: any[]) =>
        old?.filter(wishlistItem => wishlistItem.id !== item.id)
      );

      return { previousItems };
    },
    onError: (error, _, context: any) => {
      queryClient.setQueryData(["wishlist-items"], context.previousItems);
      console.error("Error removing from wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Item removed from wishlist",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist-items"] });
    },
  });

  const addToCart = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to add items to cart");

      const { error } = await supabase
        .from("cart_items")
        .insert({
          user_id: user.id,
          product_id: product.id,
          quantity: 1,
        });

      if (error) throw error;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["cartItems"] });
      const previousCount = queryClient.getQueryData(
        generateQueryKey("cart_items", { type: "count" })
      );
      
      queryClient.setQueryData(
        generateQueryKey("cart_items", { type: "count" }),
        (old: number) => (old || 0) + 1
      );

      return { previousCount };
    },
    onError: (error, _, context: any) => {
      queryClient.setQueryData(
        generateQueryKey("cart_items", { type: "count" }),
        context.previousCount
      );
      console.error("Error adding to cart:", error);
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add to cart",
          variant: "destructive",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartItems"] });
      toast({
        title: "Success",
        description: "Added to cart successfully",
      });
    },
  });

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await navigator.share({
        title: product.title || "Check out this product",
        text: product.description || "I found this interesting product",
        url: window.location.origin + "/products/" + product.id,
      });
      toast({
        title: "Success",
        description: "Product shared successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast({
          title: "Error",
          description: "Failed to share product",
          variant: "destructive",
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  const getImageUrl = () => {
    const mainImage = product.product_images?.find(img => img.is_main === true);
    if (mainImage?.storage_path) {
      const { data } = supabase.storage
        .from("images")
        .getPublicUrl(mainImage.storage_path);
      return data.publicUrl;
    }
    return "/placeholder.svg";
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-48 h-48">
            <ImageLoader
              src={getImageUrl()}
              alt={product.title || ""}
              className="w-full h-full object-cover"
              width={192}
              height={192}
            />
          </div>
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">{product.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {product.description}
              </p>
              <p className="text-lg font-medium text-orange-500">
                {product.currency} {product.price?.toFixed(2)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                variant="default"
                size="sm"
                onClick={() => addToCart.mutate()}
                disabled={!product.in_stock || addToCart.isPending}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                disabled={isSharing}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeFromWishlist.mutate()}
                disabled={removeFromWishlist.isPending}
                className="transition-all duration-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
