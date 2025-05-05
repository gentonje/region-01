
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { ReviewItem, Review } from "./ReviewItem";

interface ReviewsListProps {
  reviews: Review[] | undefined;
  isLoading: boolean;
  productId: string;
  currentUser: any;
}

export const ReviewsList = ({ 
  reviews,
  isLoading,
  productId,
  currentUser
}: ReviewsListProps) => {
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-20">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2"></div>
        <p className="text-sm text-muted-foreground">Loading reviews...</p>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-20 py-1">
        <MessageSquare className="h-10 w-10 text-muted-foreground mb-1" />
        <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[280px] md:h-[400px] pr-1">
      <div className="space-y-1">
        {reviews.map((review) => (
          <ReviewItem 
            key={review.id} 
            review={review} 
            productId={productId} 
            currentUser={currentUser} 
          />
        ))}
      </div>
    </ScrollArea>
  );
};
