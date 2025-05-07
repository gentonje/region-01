
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

  // Get flag emoji function
  const getFlagEmoji = (countryCode: string) => {
    // Convert country code to flag emoji (each letter is converted to a regional indicator symbol)
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    
    return String.fromCodePoint(...codePoints);
  };

  const handleCountryChange = (value: string) => {
    onCountryChange(value);
    
    // Navigate to home if not already there
    if (location.pathname !== "/home" && location.pathname !== "/products") {
      navigate("/products");
    }
  };

  const handleHomeNavigation = () => {
    navigate("/products");
  };

  const currentCountry = countries.find(
    (c) => c.id === parseInt(selectedCountry)
  );

  return (
    <div className="flex items-center gap-1">
      <Globe 
        className="h-4 w-4 text-blue-500 hidden sm:block cursor-pointer" 
        onClick={handleHomeNavigation}
      />
      <Select
        value={selectedCountry}
        onValueChange={handleCountryChange}
        disabled={loading}
      >
        <SelectTrigger className="min-w-[90px] max-w-[120px] h-8 px-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          {loading ? (
            "Loading..."
          ) : currentCountry ? (
            <div className="flex items-center space-x-1 truncate">
              <span className="text-base">{getFlagEmoji(currentCountry.code)}</span>
              <span className="truncate hidden sm:block">{currentCountry.name}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <span>🌍</span>
              <span className="truncate hidden sm:block">Select</span>
            </div>
          )}
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.id} value={country.id.toString()}>
              <div className="flex items-center">
                <span className="mr-2 text-base">{getFlagEmoji(country.code)}</span>
                <span>{country.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
