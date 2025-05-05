
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

interface ProductModifyActionsProps {
  productId: string;
  onDelete: (productId: string) => Promise<void>;
}

export const ProductModifyActions = ({ productId, onDelete }: ProductModifyActionsProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex space-x-6">
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigate(`/edit-product/${productId}`)}
        className="rounded-full h-10 w-10"
      >
        <Edit className="h-5 w-5" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="icon" className="rounded-full h-10 w-10">
            <Trash2 className="h-5 w-5" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => await onDelete(productId)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
