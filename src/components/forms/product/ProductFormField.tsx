
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCategory } from "@/types/product";
import { counties } from "@/data/counties";
import { useForm } from "react-hook-form";
import { ProductFormData } from "./validation";

interface ProductFormFieldProps {
  form: ReturnType<typeof useForm<ProductFormData>>;
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
  // List of available product categories
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

  const handleValueChange = (value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const renderField = () => {
    if (name === "description") {
      return (
        <Textarea
          value={formData[name] || ""}
          onChange={(e) => handleValueChange(e.target.value)}
          className="resize-none h-32"
        />
      );
    } else if (name === "category") {
      return (
        <Select
          value={formData[name] || ""}
          onValueChange={handleValueChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {productCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    } else if (name === "county") {
      return (
        <Select
          value={formData[name] || ""}
          onValueChange={handleValueChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a county" />
          </SelectTrigger>
          <SelectContent>
            {counties.map((county) => (
              <SelectItem key={county.name} value={county.name}>
                {county.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    } else {
      return (
        <Input
          type={type}
          step={step}
          value={formData[name] || ""}
          onChange={(e) => handleValueChange(e.target.value)}
          className="dark:bg-gray-800"
        />
      );
    }
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem className="space-y-2">
          <FormLabel>{label}</FormLabel>
          <FormControl>{renderField()}</FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
