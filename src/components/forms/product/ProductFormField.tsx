import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProductFormData } from "./validation";
import { ProductCategory } from "@/types/product";

interface ProductFormFieldProps {
  form: UseFormReturn<ProductFormData>;
  name: keyof ProductFormData;
  label: string;
  type?: string;
  step?: string;
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
}

export const ProductFormField = ({
  form,
  name,
  label,
  type = "text",
  step,
  formData,
  setFormData,
}: ProductFormFieldProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-gray-900 font-medium">{label}</FormLabel>
          <FormControl>
            {name === "category" ? (
              <select
                {...field}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-gray-900"
                onChange={(e) => {
                  field.onChange(e);
                  setFormData({ 
                    ...formData, 
                    [name]: e.target.value as ProductCategory 
                  });
                }}
              >
                <option value="">Select a category</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Home & Garden">Home & Garden</option>
                <option value="Books">Books</option>
                <option value="Sports & Outdoors">Sports & Outdoors</option>
                <option value="Toys & Games">Toys & Games</option>
                <option value="Health & Beauty">Health & Beauty</option>
                <option value="Automotive">Automotive</option>
                <option value="Food & Beverages">Food & Beverages</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <Input
                {...field}
                type={type}
                step={step}
                className="text-gray-900"
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