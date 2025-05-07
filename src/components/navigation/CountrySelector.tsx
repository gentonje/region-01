
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flag } from "lucide-react";
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
        // For now, hardcode the countries until we set up the database table
        const hardcodedCountries: Country[] = [
          { id: 1, name: "Kenya", code: "KE" },
          { id: 2, name: "Uganda", code: "UG" },
          { id: 3, name: "South Sudan", code: "SS" },
          { id: 4, name: "Ethiopia", code: "ET" },
          { id: 5, name: "Rwanda", code: "RW" }
        ];
        
        setCountries(hardcodedCountries);
        
        // Once the database table is set up, uncomment this:
        /*
        const { data, error } = await supabase
          .from("countries")
          .select("id, name, code")
          .order("name");

        if (error) {
          console.error("Error fetching countries:", error);
          return;
        }

        setCountries(data);
        */
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
        <SelectTrigger className="w-full md:w-40 bg-transparent border-none focus:ring-0">
          <div className="flex items-center">
            <Flag className="mr-2 h-4 w-4" />
            <SelectValue placeholder={loading ? "Loading..." : "Select Country"} />
          </div>
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.id} value={country.id.toString()}>
              {country.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
