
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface EmptyProductsListProps {
  isProfileComplete: boolean;
}

export const EmptyProductsList = ({ isProfileComplete }: EmptyProductsListProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 dark:bg-gray-800 dark:border-gray-700 space-y-1">
      <h3 className="text-lg font-medium">No products found</h3>
      <p className="text-muted-foreground">You haven't created any products yet.</p>
      {!isProfileComplete && (
        <Button 
          onClick={() => navigate("/edit-profile")} 
          className="flex items-center gap-1 mt-2"
          variant="secondary"
        >
          Complete Your Profile First
        </Button>
      )}
    </div>
  );
};
