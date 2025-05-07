
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DistrictRow } from "./DistrictRow";
import { District } from "@/types/districts";

interface DistrictsListProps {
  districts: District[] | undefined;
  isLoading: boolean;
  onEdit: (district: District) => void;
  onDelete: (id: number, name: string) => void;
  deleteIsLoading: boolean;
}

export const DistrictsList = ({
  districts,
  isLoading,
  onEdit,
  onDelete,
  deleteIsLoading,
}: DistrictsListProps) => {
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
            <TableHead>District Name</TableHead>
            <TableHead>Country</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {districts && districts.length > 0 ? (
            districts.map((district) => (
              <DistrictRow 
                key={district.id}
                district={district} 
                onEdit={onEdit}
                onDelete={onDelete}
                deleteIsLoading={deleteIsLoading}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8">
                No districts found. Add your first district!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
