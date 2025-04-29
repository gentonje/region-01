
import { useState } from "react";
import { User, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StarRating } from "../ProductHeader";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface ReviewReply {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
  review_replies: ReviewReply[];
}

interface ReviewItemProps {
  review: Review;
  productId: string;
  currentUser: any;
}

export const ReviewItem = ({ review, productId, currentUser }: ReviewItemProps) => {
  const [replyContent, setReplyContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  const addReplyMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error("Must be logged in to reply");
      if (!replyContent.trim()) return;

      const { error } = await supabase
        .from('review_replies')
        .insert({
          review_id: review.id,
          content: replyContent,
          user_id: currentUser.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      setReplyContent("");
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

  const handleSubmitReply = () => {
    if (!replyContent.trim()) return;
    addReplyMutation.mutate();
  };

  return (
    <div className="bg-white dark:bg-gray-800/30 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
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
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="text-xs min-h-[40px] py-1 resize-none bg-gray-50 dark:bg-gray-800/50"
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={handleSubmitReply}
                disabled={addReplyMutation.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
