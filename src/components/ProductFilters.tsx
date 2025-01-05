import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { useMediaQuery } from "@/hooks/useDeviceInfo";

interface ProductFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onPriceRangeChange?: (min: number, max: number) => void;
  onSortChange?: (sort: string) => void;
}

export const ProductFilters = ({
  onPriceRangeChange,
  onSortChange,
}: ProductFiltersProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const FilterContent = () => (
    <div className="space-y-4">
      {onSortChange && (
        <div>
          <Select onValueChange={(value) => {
            if (value === 'price_asc' && onPriceRangeChange) {
              onPriceRangeChange(0, 1000);
            } else if (value === 'price_desc' && onPriceRangeChange) {
              onPriceRangeChange(1000, 0);
            }
            onSortChange(value);
          }}>
            <SelectTrigger id="sort" className="mt-1">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );

  return isMobile ? (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="fixed top-20 right-4 z-50 rounded-full shadow-lg h-12 w-12 bg-background/80 backdrop-blur-sm border-primary/50 hover:border-primary transition-all duration-300 ring-2 ring-primary/20 hover:ring-primary/40"
        >
          <SlidersHorizontal className="h-6 w-6 text-primary" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            Apply filters to refine your search
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 pb-20">
          <FilterContent />
        </div>
      </SheetContent>
    </Sheet>
  ) : (
    <div className="sticky top-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 py-4 border-b">
      <FilterContent />
    </div>
  );
};
