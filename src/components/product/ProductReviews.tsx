
import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Badge } from "../ui/badge";
import { useReviewManagement } from "@/hooks/useReviewManagement";
import { ReviewForm } from "./reviews/ReviewForm";
import { ReviewsList } from "./reviews/ReviewsList";
import { ReviewEditorControl } from "./reviews/ReviewEditorControl";

interface ProductReviewsProps {
  productId: string;
  sellerId: string;
}

export const ProductReviews = ({ productId, sellerId }: ProductReviewsProps) => {
  const {
    currentUser,
    reviews,
    isLoadingReviews,
    isEditing,
    setIsEditing,
    existingReviewId,
    handleEditReview,
    hasReviewed
  } = useReviewManagement(productId);

  const canReview = currentUser && currentUser.id !== sellerId;

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
          <ReviewEditorControl
            hasReviewed={hasReviewed}
            isEditing={isEditing}
            onEditClick={handleEditReview}
          />
          
          {(!hasReviewed || isEditing) && (
            <ReviewForm
              productId={productId}
              sellerId={sellerId}
              currentUser={currentUser}
              existingReviewId={existingReviewId}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
            />
          )}
        </div>
      )}

      <ReviewsList
        reviews={reviews}
        isLoading={isLoadingReviews}
        productId={productId}
        currentUser={currentUser}
      />
    </div>
  );
};
