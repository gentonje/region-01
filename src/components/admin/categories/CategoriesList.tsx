
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryRow } from "./CategoryRow";
import { ProductCategory } from "@/types/product";

interface Category {
  id: string;
  name: ProductCategory;
}

interface CategoriesListProps {
  categories: Category[] | undefined;
  isLoading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (id: string, name: ProductCategory) => void;
  deleteIsLoading: boolean;
}

export const CategoriesList = ({
  categories,
  isLoading,
  onEdit,
  onDelete,
  deleteIsLoading,
}: CategoriesListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category Name</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories && categories.length > 0 ? (
            categories.map((category) => (
              <CategoryRow 
                key={category.id}
                category={category} 
                onEdit={onEdit}
                onDelete={onDelete}
                deleteIsLoading={deleteIsLoading}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} className="text-center py-8">
                No categories found. Add your first category!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
