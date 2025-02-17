
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
    onMutate: async (itemId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["cartItems"] });
      await queryClient.cancelQueries({ 
        queryKey: generateQueryKey("cart_items", { type: "count" })
      });

      // Snapshot the previous value
      const previousCartItems = queryClient.getQueryData(["cartItems"]);
      const previousCount = queryClient.getQueryData(
        generateQueryKey("cart_items", { type: "count" })
      );

      // Optimistically update cart items
      queryClient.setQueryData(["cartItems"], (old: any[]) => 
        old?.filter(item => item.id !== itemId)
      );

      // Optimistically update count
      queryClient.setQueryData(
        generateQueryKey("cart_items", { type: "count" }),
        (old: number) => Math.max(0, (old || 1) - 1)
      );

      return { previousCartItems, previousCount };
    },
    onError: (err, itemId, context: any) => {
      // Revert to the previous value if mutation fails
      queryClient.setQueryData(["cartItems"], context?.previousCartItems);
      queryClient.setQueryData(
        generateQueryKey("cart_items", { type: "count" }),
        context?.previousCount
      );
      toast.error("Failed to remove item from cart");
    },
    onSettled: () => {
      // Refetch to ensure server state
      queryClient.invalidateQueries({ queryKey: ["cartItems"] });
      queryClient.invalidateQueries({ 
        queryKey: generateQueryKey("cart_items", { type: "count" })
      });
    },
  });

  return {
    deleteItemMutation,
  };
}
