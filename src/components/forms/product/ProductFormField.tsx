
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCategory } from "@/types/product";
import { useForm } from "react-hook-form";
import { ProductFormData } from "./validation";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Country {
  id: number;
  name: string;
  code: string;
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
  const [districts, setDistricts] = useState<{id: number, name: string}[]>([]);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState<boolean>(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<string>(formData.country || "1");

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

  // Fetch countries
  useEffect(() => {
    if (name === 'country') {
      setIsLoadingCountries(true);
      const fetchCountries = async () => {
        try {
          const { data, error } = await supabase
            .from('countries')
            .select('id, name, code')
            .order('name');
  
          if (error) {
            console.error('Error fetching countries:', error);
          } else {
            setCountries(data || []);
          }
        } catch (error) {
          console.error('Failed to fetch countries:', error);
        } finally {
          setIsLoadingCountries(false);
        }
      };
      
      fetchCountries();
    }
  }, [name]);

  // Fetch districts when country changes
  useEffect(() => {
    if (name === 'county' && formData.country) {
      setIsLoadingDistricts(true);
      const fetchDistricts = async () => {
        try {
          const { data, error } = await supabase
            .from('districts')
            .select('id, name')
            .eq('country_id', Number(formData.country))
            .order('name');
  
          if (error) {
            console.error('Error fetching districts:', error);
          } else {
            setDistricts(data || []);
          }
        } catch (error) {
          console.error('Failed to fetch districts:', error);
        } finally {
          setIsLoadingDistricts(false);
        }
      };
      
      fetchDistricts();
    }
  }, [name, formData.country]);

  const handleValueChange = (value: string) => {
    console.log(`Setting ${name} to:`, value);
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // If country changes, reset county
    if (name === 'country') {
      setSelectedCountry(value);
      setFormData({
        ...formData,
        country: value,
        county: "", // Reset county when country changes
      });
    }
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
          disabled={isLoadingDistricts || !formData.country}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingDistricts ? "Loading districts..." : "Select district"} />
          </SelectTrigger>
          <SelectContent>
            {districts.map((district) => (
              <SelectItem key={district.id} value={district.name}>
                {district.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    } else if (name === "country") {
      return (
        <Select
          value={formData[name] || ""}
          onValueChange={handleValueChange}
          disabled={isLoadingCountries}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingCountries ? "Loading countries..." : "Select a country"} />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.id} value={country.id.toString()}>
                {country.name}
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
