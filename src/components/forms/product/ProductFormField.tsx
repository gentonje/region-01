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
import { ProductFormData } from "./validation";
import { ProductCategory } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { PRODUCT_CONSTANTS } from "@/constants/product";

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

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {name === "description" ? (
              <Textarea
                {...field}
                placeholder={placeholder}
                className="resize-none"
                onChange={(e) => {
                  field.onChange(e);
                  setFormData({ ...formData, [name]: e.target.value });
                }}
              />
            ) : name === "category" ? (
              isCategoriesLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <select
                  {...field}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-gray-900"
                  onChange={(e) => {
                    field.onChange(e);
                    setFormData({
                      ...formData,
                      [name]: e.target.value as ProductCategory,
                    });
                  }}
                >
                  <option value="">{PRODUCT_CONSTANTS.SELECT_CATEGORY}</option>
                  {categories?.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )
            ) : (
              <Input
                {...field}
                type={type}
                step={step}
                placeholder={placeholder}
                onChange={(e) => {
                  field.onChange(e);
                  setFormData({ ...formData, [name]: e.target.value });
                }}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};