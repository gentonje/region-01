
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Edit, Trash } from "lucide-react";

interface Category {
  id: number;
  name: string;
}

interface CategoryRowProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: number, name: string) => void;
  deleteIsLoading: boolean;
}

export const CategoryRow = ({ 
  category, 
  onEdit, 
  onDelete,
  deleteIsLoading
}: CategoryRowProps) => {
  return (
    <TableRow key={category.id}>
      <TableCell>{category.name}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(category)}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(category.id, category.name)}
            disabled={deleteIsLoading}
          >
            <Trash className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
