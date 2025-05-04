
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateQueryKey } from "@/utils/queryUtils";

export function useCartMutations() {
  const queryClient = useQueryClient();

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      // Force invalidate all cart-related queries to ensure immediate updates
      queryClient.invalidateQueries({ queryKey: ["cartItems"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart_items"] });
      toast.success("Item removed from cart");
    },
    onError: (error) => {
      console.error("Error removing item from cart:", error);
      toast.error("Failed to remove item from cart");
    }
  });

  const addItemMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to add items to cart");

      const { error } = await supabase
        .from("cart_items")
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity
        });

      if (error) throw error;
    },
    onSuccess: () => {
      // Force invalidate all cart-related queries to ensure immediate updates
      queryClient.invalidateQueries({ queryKey: ["cartItems"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart_items"] });
      toast.success("Item added to cart");
    },
    onError: (error) => {
      console.error("Error adding item to cart:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to add item to cart");
      }
    }
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (quantity <= 0) {
        return deleteItemMutation.mutateAsync(itemId);
      }

      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", itemId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      // Force invalidate all cart-related queries to ensure immediate updates
      queryClient.invalidateQueries({ queryKey: ["cartItems"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart_items"] });
      toast.success("Cart updated");
    },
    onError: (error) => {
      console.error("Error updating cart quantity:", error);
      toast.error("Failed to update cart");
    }
  });

  return {
    deleteItemMutation,
    addItemMutation,
    updateQuantityMutation,
  };
}
