import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProductFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
}

export const ProductFilters = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
}: ProductFiltersProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex gap-4 items-center">
      <Input
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-sm"
      />
      <Select
        value={selectedCategory}
        onValueChange={setSelectedCategory}
      >
        <SelectTrigger className={isMobile ? "w-[48px]" : "w-[180px]"}>
          {isMobile ? (
            <Filter className="h-4 w-4" />
          ) : (
            <SelectValue placeholder="Category" />
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="Electronics">Electronics</SelectItem>
          <SelectItem value="Clothing">Clothing</SelectItem>
          <SelectItem value="Home & Garden">Home & Garden</SelectItem>
          <SelectItem value="Books">Books</SelectItem>
          <SelectItem value="Sports & Outdoors">Sports & Outdoors</SelectItem>
          <SelectItem value="Toys & Games">Toys & Games</SelectItem>
          <SelectItem value="Health & Beauty">Health & Beauty</SelectItem>
          <SelectItem value="Automotive">Automotive</SelectItem>
          <SelectItem value="Food & Beverages">Food & Beverages</SelectItem>
          <SelectItem value="Other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};