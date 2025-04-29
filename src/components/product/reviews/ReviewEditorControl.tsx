
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";

interface ReviewEditorControlProps {
  hasReviewed: boolean;
  isEditing: boolean;
  onEditClick: () => void;
}

export const ReviewEditorControl = ({ 
  hasReviewed, 
  isEditing, 
  onEditClick 
}: ReviewEditorControlProps) => {
  if (!hasReviewed || isEditing) {
    return null;
  }

  return (
    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md border border-gray-200 dark:border-gray-700">
      <p className="text-sm text-muted-foreground">
        You have already reviewed this product.
      </p>
      <Button 
        onClick={onEditClick} 
        variant="outline" 
        size="sm"
        className="flex items-center"
      >
        <Edit2 className="mr-1 h-4 w-4" />
        Edit Your Review
      </Button>
    </div>
  );
};
