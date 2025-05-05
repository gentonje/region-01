
import { useState } from "react";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageLoader } from "@/components/ImageLoader";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Share2, ShoppingCart, Trash2, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getStorageUrl } from "@/utils/storage";
import { motion, AnimatePresence } from "framer-motion";

interface WishlistItemProps {
  item: {
    id: string;
    product_id: string;
  };
  product: Product;
  onItemRemoved?: () => void;
}

export const WishlistItem = ({ item, product, onItemRemoved }: WishlistItemProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const [particles, setParticles] = useState<number[]>([]);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const removeFromWishlist = useMutation({
    mutationFn: async () => {
      console.log("Removing product from wishlist:", product.id);
      
      // First, get the user's wishlist
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in");
      
      const { data: wishlist } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
        
      if (!wishlist) throw new Error("Wishlist not found");
      
      // Then remove the item
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("wishlist_id", wishlist.id)
        .eq("product_id", product.id);

      if (error) {
        console.error("Error removing wishlist item:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist", product.id] });
      queryClient.invalidateQueries({ queryKey: ["wishlist_count"] });
      toast.success("Item removed from wishlist");
      if (onItemRemoved) {
        onItemRemoved();
      }
    },
    onError: (error) => {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove item from wishlist");
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
    onSuccess: () => {
      // Force invalidate all cart-related queries
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart_items"] });
      toast.success("Added to cart successfully");
    },
    onError: (error) => {
      console.error("Error adding to cart:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to add to cart");
      }
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
      toast.success("Product shared successfully");
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error("Failed to share product");
      }
    } finally {
      setIsSharing(false);
    }
  };

  const getImageUrl = () => {
    const mainImage = product.product_images?.find(img => img.is_main === true);
    if (mainImage?.storage_path) {
      return getStorageUrl(mainImage.storage_path);
    }
    return "/placeholder.svg";
  };

  const triggerHeartAnimation = () => {
    // Create particles for the burst effect
    setParticles([1, 2, 3, 4, 5]);
    
    // Clean up particles after animation completes
    setTimeout(() => {
      setParticles([]);
    }, 800);
  };

  // Trigger animation on initial load
  useState(() => {
    setTimeout(() => {
      triggerHeartAnimation();
    }, 300);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      exit={{ opacity: 0, height: 0 }}
      className="w-full px-0"
    >
      <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow w-full mx-0 my-0">
        <CardContent className="p-0">
          <div className="flex flex-row">
            <div className="w-24 h-24 relative">
              <ImageLoader
                src={getImageUrl()}
                alt={product.title || ""}
                className="w-full h-full object-cover"
                width={96}
                height={96}
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute top-1 left-1 z-10"
              >
                <div className="relative">
                  <Heart className="w-4 h-4 fill-amber-400 text-amber-400 wishlist-heart-active" />
                  {/* Render particles */}
                  {particles.map((id) => (
                    <div 
                      key={`wishlist-particle-${id}`} 
                      className={`heart-particle heart-particle-${id}`} 
                    />
                  ))}
                </div>
              </motion.div>
            </div>
            <div className="flex-1 p-1 flex flex-col justify-between space-y-0">
              <div>
                <h3 className="text-sm font-semibold mb-0 text-gray-800 dark:text-gray-100 line-clamp-1">{product.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1 mb-1">
                  {product.description}
                </p>
                <motion.p 
                  className="text-sm font-medium text-orange-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {product.currency} {Math.round(product.price || 0).toLocaleString()}
                </motion.p>
              </div>
              <div className="flex flex-wrap gap-1 mt-0">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => addToCart.mutate()}
                    disabled={!product.in_stock || addToCart.isPending}
                    className="bg-violet-600 hover:bg-violet-700 text-white h-7 text-xs px-2"
                  >
                    <ShoppingCart className="w-3 h-3 mr-1 icon-glow" />
                    Add
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    disabled={isSharing}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 h-7 text-xs px-2"
                  >
                    <Share2 className="w-3 h-3 mr-1 icon-glow" />
                    Share
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFromWishlist.mutate()}
                    disabled={removeFromWishlist.isPending}
                    className="h-7 text-xs px-2"
                  >
                    <Trash2 className="w-3 h-3 mr-1 icon-glow" />
                    Remove
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
