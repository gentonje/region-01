
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Country } from "@/types/districts";

interface DistrictFiltersProps {
  filterCountry: string;
  setFilterCountry: (value: string) => void;
  countries: Country[] | undefined;
  isDialogOpen: boolean;
  setIsDialogOpen: (value: boolean) => void;
}

export const DistrictFilters = ({
  filterCountry,
  setFilterCountry,
  countries,
  isDialogOpen,
  setIsDialogOpen
}: DistrictFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
      <Select
        value={filterCountry}
        onValueChange={setFilterCountry}
      >
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Filter by country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Countries</SelectItem>
          {countries?.map((country) => (
            <SelectItem key={country.id} value={country.id.toString()}>
              {country.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add District
          </Button>
        </DialogTrigger>
      </Dialog>
    </div>
  );
};
