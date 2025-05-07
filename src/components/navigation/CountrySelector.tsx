
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CountrySelectorProps {
  selectedCountry: string;
  onCountryChange: (country: string) => void;
}

interface Country {
  id: number;
  name: string;
  code: string;
}

export const CountrySelector = ({
  selectedCountry,
  onCountryChange,
}: CountrySelectorProps) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("countries")
          .select("id, name, code")
          .order("name");

        if (error) {
          console.error("Error fetching countries:", error);
          return;
        }

        setCountries(data || []);
        console.log("Fetched countries:", data);
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const handleCountryChange = (value: string) => {
    onCountryChange(value);
    
    // Navigate to home if not already there
    if (location.pathname !== "/home" && location.pathname !== "/products") {
      navigate("/products");
    }
  };

  const selectedCountryName = countries.find(
    (c) => c.id === parseInt(selectedCountry)
  )?.name || "Select Country";

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-5 w-5 text-blue-500" />
      <Select
        value={selectedCountry}
        onValueChange={handleCountryChange}
        disabled={loading}
      >
        <SelectTrigger className="min-w-[180px] h-9 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <SelectValue placeholder={loading ? "Loading..." : selectedCountryName} />
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.id} value={country.id.toString()}>
              <div className="flex items-center">
                <span className="mr-2">{country.name}</span>
                <span className="text-xs text-gray-500">({country.code})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
