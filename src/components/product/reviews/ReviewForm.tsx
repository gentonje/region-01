
import { useState } from "react";
import { Star, Send, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReviewFormProps {
  productId: string;
  sellerId: string;
  currentUser: any;
  existingReviewId: string | null;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
}

export const ReviewForm = ({
  productId,
  sellerId,
  currentUser,
  existingReviewId,
  isEditing,
  setIsEditing,
}: ReviewFormProps) => {
  const [newReview, setNewReview] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (existingReviewId && isEditing) {
      updateReviewMutation.mutate();
    } else if (!existingReviewId) {
      addReviewMutation.mutate();
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewReview('');
    setSelectedRating(5);
  };

  return (
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
          {existingReviewId && isEditing 
            ? updateReviewMutation.isPending 
              ? 'Updating...' 
              : 'Update Review' 
            : addReviewMutation.isPending 
              ? 'Posting...' 
              : 'Post Review'}
        </Button>
      </div>
    </form>
  );
};
