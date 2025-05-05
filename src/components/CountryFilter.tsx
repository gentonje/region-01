
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CountryFilterProps {
  selectedCountry: string;
  onCountryChange: (country: string) => void;
}

export const CountryFilter = ({
  selectedCountry,
  onCountryChange,
}: CountryFilterProps) => {
  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("countries")
          .select("name")
          .order("name");

        if (error) {
          console.error("Error fetching countries:", error);
          return;
        }

        // Extract unique countries
        const uniqueCountries = data.map(item => item.name);
        setCountries(uniqueCountries);
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return (
    <div className="w-full max-w-xs">
      <Select
        value={selectedCountry}
        onValueChange={onCountryChange}
        disabled={loading}
      >
        <SelectTrigger className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <SelectValue placeholder={loading ? "Loading countries..." : "Select Country"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Countries</SelectItem>
          {countries.map((country) => (
            <SelectItem key={country} value={country}>
              {country}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
