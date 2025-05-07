
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { District } from "@/types/districts";
import { Edit, Trash } from "lucide-react";

interface DistrictRowProps {
  district: District;
  onEdit: (district: District) => void;
  onDelete: (id: number, name: string) => void;
  deleteIsLoading: boolean;
}

export const DistrictRow = ({ 
  district, 
  onEdit, 
  onDelete,
  deleteIsLoading
}: DistrictRowProps) => {
  return (
    <TableRow key={district.id}>
      <TableCell>{district.name}</TableCell>
      <TableCell>{district.country_name}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(district)}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(district.id, district.name)}
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
