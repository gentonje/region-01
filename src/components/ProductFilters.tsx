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
  const [minPrice, setMinPrice] = useState<string>("0");
  const [maxPrice, setMaxPrice] = useState<string>("1000");
  const [sort, setSort] = useState<string>("none");

  const handlePriceRangeChange = (newMinPrice: string, newMaxPrice: string) => {
    const min = parseFloat(newMinPrice) || 0;
    const max = parseFloat(newMaxPrice) || 1000;
    onPriceRangeChange?.(min, max);
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
          <div className="grid gap-3 text-sm">
            <div className="space-y-1.5">
              <h4 className="font-medium leading-none text-sm">Price Range</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Min Price ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                      handlePriceRangeChange(e.target.value, maxPrice);
                    }}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Max Price ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                      handlePriceRangeChange(minPrice, e.target.value);
                    }}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Sort by price</Label>
              <Select value={sort} onValueChange={handleSortChange}>
                <SelectTrigger className="h-8 text-xs">
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