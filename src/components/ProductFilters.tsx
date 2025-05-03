
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { southSudanCounties, getAllCounties } from "@/data/southSudanCounties";

interface ProductFiltersProps {
  onSearchChange?: (search: string) => void;
  onCountyChange?: (county: string) => void;
  className?: string;
}

export const ProductFilters = ({ 
  onSearchChange, 
  onCountyChange, 
  className 
}: ProductFiltersProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCounty, setSelectedCounty] = useState(searchParams.get("county") || "");
  const counties = getAllCounties();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search) {
        searchParams.set("search", search);
      } else {
        searchParams.delete("search");
      }
      setSearchParams(searchParams);
      onSearchChange?.(search);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, searchParams, setSearchParams, onSearchChange]);

  const handleCountyChange = (value: string) => {
    setSelectedCounty(value);
    if (value) {
      searchParams.set("county", value);
    } else {
      searchParams.delete("county");
    }
    setSearchParams(searchParams);
    onCountyChange?.(value);
  };

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full max-w-md mx-auto px-4 py-2 ${className || ''}`}>
      <div className="relative flex-1 w-full">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 text-foreground dark:text-primary-foreground w-full"
        />
      </div>
      
      <div className="w-full sm:w-40">
        <Select value={selectedCounty} onValueChange={handleCountyChange}>
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="County" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Counties</SelectItem>
            {counties.map(county => (
              <SelectItem key={county.id} value={county.id}>
                {county.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
