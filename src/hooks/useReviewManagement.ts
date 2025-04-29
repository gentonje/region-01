
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Review } from "@/components/product/reviews/ReviewItem";

export function useReviewManagement(productId: string) {
  const [isEditing, setIsEditing] = useState(false);
  const [existingReviewId, setExistingReviewId] = useState<string | null>(null);

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Get reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (full_name, avatar_url),
          review_replies (
            id,
            content,
            created_at,
            user_id,
            profiles (full_name, avatar_url)
          )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    }
  });

  // Check if user has already reviewed this product
  useEffect(() => {
    if (currentUser && reviews) {
      const userReview = reviews.find(review => review.user_id === currentUser.id);
      if (userReview) {
        setExistingReviewId(userReview.id);
      } else {
        setExistingReviewId(null);
      }
    }
  }, [currentUser, reviews]);

  const handleEditReview = () => {
    setIsEditing(true);
  };

  const canReview = currentUser && reviews?.some(review => review.user_id === currentUser.id);
  const hasReviewed = existingReviewId !== null;

  return {
    currentUser,
    reviews,
    isLoadingReviews,
    isEditing,
    setIsEditing,
    existingReviewId,
    handleEditReview,
    canReview,
    hasReviewed
  };
}
