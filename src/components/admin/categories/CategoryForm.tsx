
import { Loader2 } from "lucide-react";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProductCategory } from "@/types/product";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Category {
  id: string;
  name: ProductCategory;
}

interface CategoryFormProps {
  editingCategory: Category | null;
  onSubmit: (e: React.FormEvent) => void;
  categoryName: ProductCategory | "";
  setCategoryName: (value: ProductCategory | "") => void;
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
  // List of available product categories
  const productCategories: ProductCategory[] = [
    "Electronics",
    "Clothing",
    "Home & Garden",
    "Books",
    "Sports & Outdoors",
    "Toys & Games",
    "Health & Beauty",
    "Automotive",
    "Food & Beverages",
    "Other"
  ];

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
            <Label htmlFor="category-select" className="text-right">
              Category Name
            </Label>
            <div className="col-span-3">
              <Select 
                value={categoryName} 
                onValueChange={(value) => setCategoryName(value as ProductCategory)}
              >
                <SelectTrigger id="category-select">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {productCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
            disabled={isPending || !categoryName}
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
