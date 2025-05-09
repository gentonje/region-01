
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Country {
  id: number;
  name: string;
  code: string;
}

interface CountrySelectorProps {
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  renderAsSelectItems?: boolean;
}

export const CountrySelector = ({
  selectedCountry = "all", // Default to "all"
  onCountryChange,
  renderAsSelectItems = true,
}: CountrySelectorProps) => {
  const [countryFlags, setCountryFlags] = useState<Record<string, JSX.Element>>({});

  const { data: countries, isLoading } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("countries")
          .select("id, name, code")
          .order("name");

        if (error) {
          console.error("Error fetching countries:", error);
          toast.error("Failed to load countries");
          return [];
        }

        console.log("Fetched countries:", data);
        return data as Country[];
      } catch (error) {
        console.error("Failed to fetch countries:", error);
        toast.error("Failed to load countries");
        return [];
      }
    },
  });

  useEffect(() => {
    // Map country codes to flag emojis
    const flags: Record<string, JSX.Element> = {};
    countries?.forEach((country) => {
      // Convert country code to flag emoji (each letter is converted to regional indicator symbol)
      const flagEmoji = String.fromCodePoint(...[...country.code.toUpperCase()].map(
        (char) => char.charCodeAt(0) + 127397
      ));
      flags[country.id.toString()] = (
        <span className="mr-2">{flagEmoji}</span>
      );
    });
    setCountryFlags(flags);
  }, [countries]);

  const handleCountryChange = (value: string) => {
    console.log("Country changed to:", value);
    onCountryChange(value);
  };

  if (renderAsSelectItems) {
    return (
      <>
        {countries?.map((country) => (
          <SelectItem key={country.id} value={country.id.toString()}>
            <div className="flex items-center">
              {countryFlags[country.id.toString()]}
              {country.name}
            </div>
          </SelectItem>
        ))}
      </>
    );
  }

  return (
    <Select
      value={selectedCountry}
      onValueChange={handleCountryChange}
      defaultValue="all"
    >
      <SelectTrigger className="w-[180px] h-10 sm:w-[220px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <SelectValue>
          {selectedCountry === "all" ? (
            <div className="flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              <span>All Countries</span>
            </div>
          ) : (
            <div className="flex items-center">
              {countryFlags[selectedCountry] || <span className="w-4 h-4 mr-2"></span>}
              {countries?.find(c => c.id.toString() === selectedCountry)?.name || "Loading..."}
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <SelectItem value="all">
          <div className="flex items-center">
            <Globe className="w-4 h-4 mr-2" />
            <span>All Countries</span>
          </div>
        </SelectItem>
        {countries?.map((country) => (
          <SelectItem key={country.id} value={country.id.toString()}>
            <div className="flex items-center">
              {countryFlags[country.id.toString()]}
              {country.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
