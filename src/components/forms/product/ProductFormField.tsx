
import React, { useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CountiesFilter } from "@/components/CountiesFilter";
import { CountrySelector } from "@/components/navigation/CountrySelector";
import { ProductCategory } from "@/types/product";

interface ProductFormFieldProps {
  form: any;
  name: string;
  label: string;
  type?: string;
  step?: string;
  formData: any;
  setFormData: (data: any) => void;
  disabled?: boolean;
}

const formatCategoryName = (category: string) => {
  return category;
};

const ProductFormField = ({ form, name, label, type = "text", step, formData, setFormData, disabled = false }: ProductFormFieldProps) => {
  const { field } = useController({ name, control: form.control });
  const [countryId, setCountryId] = useState<string>(formData.country || "1");
  
  // Handle form value changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'country' && value) {
      setCountryId(value);
    }
  };

  // Render different field types based on the name
  const renderField = () => {
    switch (name) {
      case "description":
        return (
          <Textarea
            {...field}
            name={name}
            placeholder={`Enter ${label.toLowerCase()}`}
            className="rounded-md border h-32"
            value={formData.description}
            onChange={handleChange}
            disabled={disabled}
          />
        );
      
      case "category":
        return (
          <Select
            value={formData.category}
            onValueChange={(value) => {
              setFormData({ ...formData, category: value });
            }}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ProductCategory).map((category) => (
                <SelectItem key={category} value={category}>
                  {formatCategoryName(category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case "county":
        return (
          <CountiesFilter
            selectedCountry={countryId}
            selectedCounty={formData.county || ""}
            onCountyChange={(county) => setFormData({ ...formData, county })}
          />
        );
      
      case "country":
        return (
          <Select
            value={formData.country}
            onValueChange={(value) => {
              setFormData({ ...formData, country: value, county: "" });
              setCountryId(value);
            }}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <CountrySelector 
                selectedCountry={formData.country}
                onCountryChange={() => {}}
              />
            </SelectContent>
          </Select>
        );

      case "validity_period":
        return (
          <Select
            value={formData.validity_period || "day"}
            onValueChange={(value) => {
              setFormData({ ...formData, validity_period: value as 'day' | 'week' | 'month' });
            }}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select validity period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">1 Day</SelectItem>
              <SelectItem value="week">1 Week</SelectItem>
              <SelectItem value="month">1 Month</SelectItem>
            </SelectContent>
          </Select>
        );
        
      default:
        return (
          <Input
            {...field}
            name={name}
            type={type}
            step={step}
            placeholder={`Enter ${label.toLowerCase()}`}
            className="rounded-md"
            value={formData[name as keyof typeof formData] || ""}
            onChange={handleChange}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <FormField
        control={form.control}
        name={name}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>{renderField()}</FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export { ProductFormField };
