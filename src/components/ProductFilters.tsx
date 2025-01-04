import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

interface ProductFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  onPriceRangeChange?: (min: number, max: number) => void;
  onSortChange?: (sort: string) => void;
}

export const ProductFilters = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onPriceRangeChange,
  onSortChange,
}: ProductFiltersProps) => {
  const isMobile = useIsMobile();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sort, setSort] = useState<string>("none");

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
    onPriceRangeChange?.(value[0], value[1]);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    onSortChange?.(value);
  };

  return (
    <div className="flex gap-4 items-center">
      <Input
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-sm"
      />
      
      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
        <SelectTrigger className={isMobile ? "w-[48px]" : "w-[180px]"}>
          {isMobile ? <Filter className="h-4 w-4" /> : <SelectValue placeholder="Category" />}
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

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="h-10 w-10">
            <span className="sr-only">Price filter</span>
            $
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Price Range</h4>
              <p className="text-sm text-muted-foreground">
                Between ${priceRange[0]} and ${priceRange[1]}
              </p>
            </div>
            <Slider
              min={0}
              max={1000}
              step={10}
              value={[priceRange[0], priceRange[1]]}
              onValueChange={handlePriceRangeChange}
              className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
            />
            <div className="space-y-2">
              <Label>Sort by price</Label>
              <Select value={sort} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No sorting</SelectItem>
                  <SelectItem value="asc">Price: Low to High</SelectItem>
                  <SelectItem value="desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};