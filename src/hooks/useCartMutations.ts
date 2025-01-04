import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      queryClient.invalidateQueries({ queryKey: ["cartItems"] });
      toast.success("Item removed from cart");
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("cart_items")
        .delete(); // Delete all items without any condition
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartItems"] });
      toast.success("Cart cleared successfully");
    },
  });

  return {
    deleteItemMutation,
    clearCartMutation,
  };
}