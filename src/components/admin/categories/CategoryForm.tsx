
import { Loader2 } from "lucide-react";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Category {
  id: number;
  name: string;
}

interface CategoryFormProps {
  editingCategory: Category | null;
  onSubmit: (e: React.FormEvent) => void;
  categoryName: string;
  setCategoryName: (value: string) => void;
  isPending: boolean;
  onClose: () => void;
}

export const CategoryForm = ({
  editingCategory,
  onSubmit,
  categoryName,
  setCategoryName,
  isPending,
  onClose,
}: CategoryFormProps) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {editingCategory ? "Edit Category" : "Add New Category"}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4 mt-4">
        <div className="grid gap-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right">
              Category Name
            </label>
            <Input
              id="name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </DialogClose>
          <Button 
            type="submit" 
            disabled={isPending || !categoryName.trim()}
          >
            {isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {editingCategory ? "Update Category" : "Add Category"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};
