
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

        if (itemError) {
          console.error('Wishlist item query error:', itemError);
          return false;
        }
        
        // Log the results for debugging
        console.log(`Checking wishlist status for product ${productId}:`, 
          wishlistItems && wishlistItems.length > 0);
          
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

      // Log the operation start
      console.log(`Toggling wishlist item for product ${productId}`);

      const { data: existingWishlist, error: wishlistError } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      let wishlistId;
      if (!existingWishlist) {
        console.log('Creating new wishlist for user', session.user.id);
        const { data: newWishlist, error: createError } = await supabase
          .from('wishlists')
          .insert({
            user_id: session.user.id,
            name: 'My Wishlist',
            visibility: 'private'
          })
          .select()
          .single();

        if (createError) {
          console.error('Wishlist creation error:', createError);
          throw createError;
        }
        wishlistId = newWishlist.id;
        console.log('New wishlist created with ID:', wishlistId);
      } else {
        wishlistId = existingWishlist.id;
        console.log('Using existing wishlist with ID:', wishlistId);
      }

      if (isInWishlist) {
        console.log(`Removing product ${productId} from wishlist ${wishlistId}`);
        const { error: removeError } = await supabase
          .from('wishlist_items')
          .delete()
          .eq('wishlist_id', wishlistId)
          .eq('product_id', productId);

        if (removeError) {
          console.error('Wishlist item removal error:', removeError);
          throw removeError;
        }
      } else {
        console.log(`Adding product ${productId} to wishlist ${wishlistId}`);
        const { error: addError } = await supabase
          .from('wishlist_items')
          .insert({
            wishlist_id: wishlistId,
            product_id: productId
          });

        if (addError) {
          console.error('Wishlist item addition error:', addError);
          throw addError;
        }
      }
      
      console.log('Wishlist operation completed successfully');
    },
    onSuccess: () => {
      // Force refetch wishlist data
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
