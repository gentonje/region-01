
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function useWishlistMutation(productId: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  // Check if product is in wishlist
  const { data: isInWishlist, isLoading } = useQuery({
    queryKey: ['wishlist', productId, session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return false;

      try {
        const { data: wishlist, error } = await supabase
          .from('wishlists')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error || !wishlist) return false;

        const { data: wishlistItems, error: itemError } = await supabase
          .from('wishlist_items')
          .select('id')
          .eq('wishlist_id', wishlist.id)
          .eq('product_id', productId);

        if (itemError) return false;
        return wishlistItems && wishlistItems.length > 0;
      } catch (error) {
        console.error('Wishlist query error:', error);
        return false;
      }
    },
    enabled: !!session?.user && !!productId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Toggle wishlist mutation
  const { mutate: toggleWishlist, isPending } = useMutation({
    mutationFn: async () => {
      if (!session?.user) {
        throw new Error('Please login to add items to wishlist');
      }

      const { data: existingWishlist, error: wishlistError } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      let wishlistId;
      if (!existingWishlist) {
        const { data: newWishlist, error: createError } = await supabase
          .from('wishlists')
          .insert({
            user_id: session.user.id,
            name: 'My Wishlist',
            visibility: 'private'
          })
          .select()
          .single();

        if (createError) throw createError;
        wishlistId = newWishlist.id;
      } else {
        wishlistId = existingWishlist.id;
      }

      if (isInWishlist) {
        const { error: removeError } = await supabase
          .from('wishlist_items')
          .delete()
          .eq('wishlist_id', wishlistId)
          .eq('product_id', productId);

        if (removeError) throw removeError;
      } else {
        const { error: addError } = await supabase
          .from('wishlist_items')
          .insert({
            wishlist_id: wishlistId,
            product_id: productId
          });

        if (addError) throw addError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-items'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist', productId, session?.user?.id] });
      toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
    },
    onError: (error) => {
      console.error("Wishlist error:", error);
      toast.error("Wishlist operation failed. Please try again.");
    }
  });

  return {
    isInWishlist,
    toggleWishlist,
    isPending,
    isLoading
  };
}
