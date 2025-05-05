
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CountiesFilterProps {
  selectedCounty: string;
  onCountyChange: (county: string) => void;
  selectedCountry?: string;
}

export const CountiesFilter = ({
  selectedCounty,
  onCountyChange,
  selectedCountry = "all"
}: CountiesFilterProps) => {
  const [counties, setCounties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounties = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from("counties")
          .select("name, country")
          .order("name");
        
        if (selectedCountry && selectedCountry !== "all") {
          query = query.eq("country", selectedCountry);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching counties:", error);
          return;
        }

        // Extract unique counties
        const uniqueCounties = data.map(item => item.name);
        setCounties(uniqueCounties);
        
        // Reset selected county if it's not in the filtered list anymore
        if (selectedCounty !== "all" && !uniqueCounties.includes(selectedCounty)) {
          onCountyChange("all");
        }
      } catch (error) {
        console.error("Failed to fetch counties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounties();
  }, [selectedCountry, selectedCounty, onCountyChange]);

  return (
    <div className="w-full max-w-xs">
      <Select
        value={selectedCounty}
        onValueChange={onCountyChange}
        disabled={loading}
      >
        <SelectTrigger className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <SelectValue placeholder={loading ? "Loading counties..." : "Select County"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Counties</SelectItem>
          {counties.map((county) => (
            <SelectItem key={county} value={county}>
              {county}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
