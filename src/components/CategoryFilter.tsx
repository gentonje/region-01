
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCategory } from "@/types/product";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({
  selectedCategory = "all",
  onCategoryChange,
}: CategoryFilterProps) => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("categories")
          .select("name")
          .order("name");

        if (error) {
          console.error("Error fetching categories:", error);
          return;
        }

        // Pre-defined categories if the table doesn't have data yet
        const productCategories: ProductCategory[] = [
          "Electronics",
          "Clothing",
          "Home & Garden",
          "Books",
          "Sports & Outdoors",
          "Toys & Games",
          "Health & Beauty",
          "Automotive",
          "Food & Beverages",
          "Other"
        ];
        
        setCategories(data?.map(c => c.name) || productCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="w-full max-w-xs">
      <Select
        value={selectedCategory}
        onValueChange={onCategoryChange}
        disabled={loading}
      >
        <SelectTrigger className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <SelectValue placeholder={loading ? "Loading categories..." : "Select Category"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
