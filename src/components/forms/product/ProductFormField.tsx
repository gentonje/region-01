
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProductFormData } from "@/types/product";
import { ProductCategory } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFormFieldProps {
  form: UseFormReturn<ProductFormData>;
  name: keyof ProductFormData;
  label: string;
  type?: string;
  step?: string;
  placeholder?: string;
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
}

export const ProductFormField = ({
  form,
  name,
  label,
  type = "text",
  step,
  placeholder,
  formData,
  setFormData,
}: ProductFormFieldProps) => {
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("name")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: counties, isLoading: isCountiesLoading } = useQuery({
    queryKey: ["counties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("counties")
        .select("name, state")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  // Define all available product categories as a fallback
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

  // Handle the county value safely, ensuring we're always working with strings for the Select component
  const getCountyValue = () => {
    const county = form.getValues().county;
    if (!county) return "_none";
    if (typeof county === 'object' && county !== null && 'name' in county) {
      return (county as {name: string}).name;
    }
    return String(county);
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-foreground dark:text-gray-200">{label}</FormLabel>
          <FormControl>
            {name === "description" ? (
              <Textarea
                {...field}
                placeholder={placeholder}
                className="resize-none bg-background dark:bg-gray-800 text-foreground dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500"
                onChange={(e) => {
                  field.onChange(e);
                  setFormData({ ...formData, [name]: e.target.value });
                }}
              />
            ) : name === "category" ? (
              isCategoriesLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setFormData({
                      ...formData,
                      [name]: value as ProductCategory,
                    });
                  }}
                >
                  <SelectTrigger className="h-10 w-full bg-background dark:bg-gray-800 text-foreground dark:text-gray-200 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-background dark:bg-gray-800 text-foreground dark:text-gray-200 border-gray-300 dark:border-gray-600">
                    {/* Use productCategories as fallback if API categories are empty */}
                    {categories && categories.length > 0 
                      ? categories.map((category) => (
                          <SelectItem key={category.name} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))
                      : productCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))
                    }
                  </SelectContent>
                </Select>
              )
            ) : name === "county" ? (
              isCountiesLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={getCountyValue()}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setFormData({
                      ...formData,
                      [name]: value,
                    });
                  }}
                >
                  <SelectTrigger className="h-10 w-full bg-background dark:bg-gray-800 text-foreground dark:text-gray-200 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Select a county" />
                  </SelectTrigger>
                  <SelectContent className="bg-background dark:bg-gray-800 text-foreground dark:text-gray-200 border-gray-300 dark:border-gray-600">
                    <SelectItem value="_none">Select a county</SelectItem>
                    {counties?.map((county) => (
                      <SelectItem key={county.name} value={county.name}>
                        {county.name} {county.state ? `(${county.state})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
            ) : (
              <Input
                {...field}
                type={type}
                step={step}
                placeholder={placeholder}
                className="bg-background dark:bg-gray-800 text-foreground dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500"
                onChange={(e) => {
                  field.onChange(e);
                  setFormData({ ...formData, [name]: e.target.value });
                }}
              />
            )}
          </FormControl>
          <FormMessage className="text-red-500 dark:text-red-400" />
        </FormItem>
      )}
    />
  );
};
