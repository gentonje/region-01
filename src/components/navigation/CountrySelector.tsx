
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Country } from "@/types/product";

interface CountrySelectorProps {
  selectedCountry: string;
  onCountryChange: (country: string) => void;
}

export const CountrySelector = ({
  selectedCountry,
  onCountryChange,
}: CountrySelectorProps) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="w-full max-w-xs">
      <Select
        value={selectedCountry}
        onValueChange={onCountryChange}
        disabled={loading}
      >
        <SelectTrigger className="w-full md:w-40 bg-transparent border-none focus:ring-0">
          <div className="flex items-center">
            {selectedCountry !== "all" && countries.find(c => c.id.toString() === selectedCountry) ? (
              <span className="mr-2 text-lg">
                {getFlagEmoji(countries.find(c => c.id.toString() === selectedCountry)?.code || "")}
              </span>
            ) : (
              <span className="mr-2">🌍</span>
            )}
            <SelectValue placeholder={loading ? "Loading..." : "Select Country"} />
          </div>
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.id} value={country.id.toString()}>
              <div className="flex items-center">
                <span className="mr-2">{getFlagEmoji(country.code)}</span>
                {country.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
