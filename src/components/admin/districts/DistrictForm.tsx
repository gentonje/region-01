
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { District } from "@/types/districts";
import { Country } from "@/types/districts";

interface DistrictFormProps {
  editingDistrict: District | null;
  countries: Country[] | undefined;
  onSubmit: (e: React.FormEvent) => void;
  newDistrict: string;
  setNewDistrict: (value: string) => void;
  selectedCountry: string;
  setSelectedCountry: (value: string) => void;
  isPending: boolean;
  onClose: () => void;
}

export const DistrictForm = ({
  editingDistrict,
  countries,
  onSubmit,
  newDistrict,
  setNewDistrict,
  selectedCountry,
  setSelectedCountry,
  isPending,
  onClose,
}: DistrictFormProps) => {
  
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {editingDistrict ? "Edit District" : "Add New District"}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4 mt-4">
        <div className="grid gap-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="country" className="text-right">
              Country
            </label>
            <Select
              value={selectedCountry}
              onValueChange={setSelectedCountry}
              required
            >
              <SelectTrigger id="country" className="col-span-3">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {countries?.map((country) => (
                  <SelectItem key={country.id} value={country.id.toString()}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right">
              District Name
            </label>
            <Input
              id="name"
              value={newDistrict}
              onChange={(e) => setNewDistrict(e.target.value)}
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
            disabled={isPending || !newDistrict || !selectedCountry}
          >
            {isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {editingDistrict ? "Update District" : "Add District"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};
