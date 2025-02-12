
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

interface ProductFiltersProps {
  onSearchChange?: (search: string) => void;
  className?: string;
}

export const ProductFilters = ({ onSearchChange, className }: ProductFiltersProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

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

  return (
    <div className={`flex items-center gap-2 w-full max-w-sm mx-auto px-4 py-2 ${className || ''}`}>
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 text-foreground dark:text-primary-foreground"
        />
      </div>
    </div>
  );
};
