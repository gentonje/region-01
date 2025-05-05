
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCategory } from "@/types/product";
import { useForm } from "react-hook-form";
import { ProductFormData } from "./validation";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface County {
  name: string;
}

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
  const [counties, setCounties] = useState<County[]>([]);
  const [isLoadingCounties, setIsLoadingCounties] = useState<boolean>(false);

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

  // Fetch counties from Supabase
  useEffect(() => {
    const fetchCounties = async () => {
      setIsLoadingCounties(true);
      try {
        const { data, error } = await supabase
          .from('counties')
          .select('name')
          .order('name');

        if (error) {
          console.error('Error fetching counties:', error);
        } else {
          setCounties(data || []);
        }
      } catch (error) {
        console.error('Failed to fetch counties:', error);
      } finally {
        setIsLoadingCounties(false);
      }
    };

    fetchCounties();
  }, []);

  // Debug log for the county field
  useEffect(() => {
    if (name === 'county') {
      console.log('County value in field:', formData[name]);
    }
  }, [formData, name]);

  const handleValueChange = (value: string) => {
    console.log(`Setting ${name} to:`, value);
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
          disabled={isLoadingCounties}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingCounties ? "Loading counties..." : "Select a county"} />
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
