
import { useState, useEffect } from "react";
import { MessageSquare, Send, Star, User, Edit2 } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StarRating } from "./ProductHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "../ui/badge";

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
  const [isEditing, setIsEditing] = useState(false);
  const [existingReviewId, setExistingReviewId] = useState<string | null>(null);
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

  // Check if user has already reviewed this product and load their review for editing
  useEffect(() => {
    if (currentUser && reviews) {
      const userReview = reviews.find(review => review.user_id === currentUser.id);
      if (userReview) {
        setExistingReviewId(userReview.id);
        // Pre-fill the form with existing review data only if user is in editing mode
        if (isEditing) {
          setNewReview(userReview.comment || '');
          setSelectedRating(userReview.rating);
        }
      } else {
        setExistingReviewId(null);
      }
    }
  }, [currentUser, reviews, isEditing]);

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
        description: error instanceof Error ? error.message : "Failed to add review",
        variant: "destructive",
      });
    }
  });

  const updateReviewMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error("Must be logged in to update a review");
      if (!existingReviewId) throw new Error("No existing review to update");

      const { error } = await supabase
        .from('reviews')
        .update({
          rating: selectedRating,
          comment: newReview
        })
        .eq('id', existingReviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      setNewReview("");
      setSelectedRating(5);
      setIsEditing(false);
      toast({
        title: "Review updated",
        description: "Your review has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update review",
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
        description: error instanceof Error ? error.message : "Failed to add reply",
        variant: "destructive",
      });
    }
  });

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (existingReviewId && isEditing) {
      // Update existing review
      updateReviewMutation.mutate();
    } else if (!existingReviewId) {
      // Add new review
      addReviewMutation.mutate();
    }
  };

  const handleEditReview = () => {
    setIsEditing(true);
    const userReview = reviews?.find(review => review.user_id === currentUser?.id);
    if (userReview) {
      setNewReview(userReview.comment || '');
      setSelectedRating(userReview.rating);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewReview('');
    setSelectedRating(5);
  };

  const handleSubmitReply = async (reviewId: string) => {
    const content = replyContent[reviewId];
    if (!content?.trim()) return;
    
    addReplyMutation.mutate({ reviewId, content });
  };

  const canReview = currentUser && currentUser.id !== sellerId;
  const hasReviewed = existingReviewId !== null;

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  return (
    <div className="space-y-1 mt-1">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <MessageSquare className="mr-1 h-5 w-5" />
          Reviews & Comments
        </h3>
        <Badge variant="outline" className="text-xs">
          {reviews?.length || 0} {reviews?.length === 1 ? 'review' : 'reviews'}
        </Badge>
      </div>
      
      {canReview && (
        <div>
          {hasReviewed && !isEditing ? (
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-muted-foreground">
                You have already reviewed this product.
              </p>
              <Button 
                onClick={handleEditReview} 
                variant="outline" 
                size="sm"
                className="flex items-center"
              >
                <Edit2 className="mr-1 h-4 w-4" />
                Edit Your Review
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-1 bg-gray-50 dark:bg-gray-800/50 p-1 rounded-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">Your rating:</span>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={18}
                        className={`cursor-pointer ${
                          star <= selectedRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        }`}
                        onClick={() => setSelectedRating(star)}
                      />
                    ))}
                  </div>
                </div>
                {isEditing && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                )}
              </div>
              <Textarea
                placeholder="Write your review..."
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                className="resize-none bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={addReviewMutation.isPending || updateReviewMutation.isPending}
                  size="sm"
                  className="flex items-center"
                >
                  <Send className="mr-1 h-4 w-4" />
                  {hasReviewed && isEditing 
                    ? updateReviewMutation.isPending 
                      ? 'Updating...' 
                      : 'Update Review' 
                    : addReviewMutation.isPending 
                      ? 'Posting...' 
                      : 'Post Review'}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      <ScrollArea className="h-[320px] pr-1">
        <div className="space-y-1">
          {isLoadingReviews ? (
            <div className="flex items-center justify-center h-20">
              <p className="text-sm text-muted-foreground">Loading reviews...</p>
            </div>
          ) : reviews?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-20 py-1">
              <MessageSquare className="h-10 w-10 text-muted-foreground mb-1" />
              <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {reviews?.map((review) => (
                <div key={review.id} className="bg-white dark:bg-gray-800/30 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-1 space-y-1">
                    {/* Review header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={review.profiles.avatar_url} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-1">
                          <p className="text-sm font-medium">{review.profiles.full_name}</p>
                          <div className="flex items-center">
                            <StarRating rating={review.rating} />
                            <span className="text-xs text-muted-foreground ml-1">
                              {formatDate(review.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Review content */}
                    <p className="text-sm">{review.comment}</p>
                    
                    {/* Review replies */}
                    {review.review_replies?.length > 0 && (
                      <div className="ml-1 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-1">
                        {review.review_replies.map((reply) => (
                          <div key={reply.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-sm p-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={reply.profiles.avatar_url} />
                                  <AvatarFallback>
                                    <User className="h-3 w-3" />
                                  </AvatarFallback>
                                </Avatar>
                                <p className="font-medium text-xs ml-1">
                                  {reply.profiles.full_name}
                                </p>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(reply.created_at)}
                              </div>
                            </div>
                            <p className="text-xs mt-1">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply form */}
                    {currentUser && (
                      <div className="mt-1 pt-1 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex gap-1">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>
                              <User className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <Textarea
                            placeholder="Write a reply..."
                            value={replyContent[review.id] || ''}
                            onChange={(e) => setReplyContent(prev => ({
                              ...prev,
                              [review.id]: e.target.value
                            }))}
                            className="text-xs min-h-[40px] py-1 resize-none bg-gray-50 dark:bg-gray-800/50"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleSubmitReply(review.id)}
                            disabled={addReplyMutation.isPending}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
