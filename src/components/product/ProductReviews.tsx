import { useState } from "react";
import { MessageSquare, Send, Star } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StarRating } from "./ProductHeader";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
  review_replies: {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    profiles: {
      full_name: string;
      avatar_url: string;
    };
  }[];
}

interface ProductReviewsProps {
  productId: string;
  sellerId: string;
}

export const ProductReviews = ({ productId, sellerId }: ProductReviewsProps) => {
  const [newReview, setNewReview] = useState("");
  const [selectedRating, setSelectedRating] = useState(5);
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

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

  const addReviewMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error("Must be logged in to review");
      if (currentUser.id === sellerId) throw new Error("Cannot review your own product");

      const { error } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          rating: selectedRating,
          comment: newReview,
          user_id: currentUser.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      setNewReview("");
      setSelectedRating(5);
      toast({
        title: "Review added",
        description: "Your review has been posted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const addReplyMutation = useMutation({
    mutationFn: async ({ reviewId, content }: { reviewId: string; content: string }) => {
      if (!currentUser) throw new Error("Must be logged in to reply");

      const { error } = await supabase
        .from('review_replies')
        .insert({
          review_id: reviewId,
          content,
          user_id: currentUser.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      setReplyContent({});
      toast({
        title: "Reply added",
        description: "Your reply has been posted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    addReviewMutation.mutate();
  };

  const handleSubmitReply = async (reviewId: string) => {
    const content = replyContent[reviewId];
    if (!content?.trim()) return;
    
    addReplyMutation.mutate({ reviewId, content });
  };

  const canReview = currentUser && currentUser.id !== sellerId;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Reviews</h3>
      
      {canReview && (
        <form onSubmit={handleSubmitReview} className="space-y-2">
          <div className="flex items-center gap-2">
            <StarRating rating={selectedRating} />
            <span className="text-sm text-muted-foreground">Select rating</span>
          </div>
          <Textarea
            placeholder="Write your review..."
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
          />
          <Button type="submit" disabled={addReviewMutation.isPending}>
            Post Review
          </Button>
        </form>
      )}

      <div className="space-y-4">
        {isLoadingReviews ? (
          <div>Loading reviews...</div>
        ) : (
          <div className="space-y-4">
            {reviews?.map((review) => (
              <div key={review.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{review.profiles.full_name}</div>
                    <StarRating rating={review.rating} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-sm">{review.comment}</p>

                <div className="ml-6 space-y-2">
                  {review.review_replies?.map((reply) => (
                    <div key={reply.id} className="border-l-2 pl-4 py-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{reply.profiles.full_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(reply.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="text-sm">{reply.content}</p>
                    </div>
                  ))}

                  {currentUser && (
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Write a reply..."
                        value={replyContent[review.id] || ''}
                        onChange={(e) => setReplyContent(prev => ({
                          ...prev,
                          [review.id]: e.target.value
                        }))}
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSubmitReply(review.id)}
                        disabled={addReplyMutation.isPending}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};