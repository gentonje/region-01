
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
  selectedCountry?: string; // Add this prop
}

export const CountiesFilter = ({
  selectedCounty,
  onCountyChange,
  selectedCountry = "1", // Default to Kenya (id: 1)
}: CountiesFilterProps) => {
  const [counties, setCounties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounties = async () => {
      try {
        setLoading(true);
        // For now, we'll use the existing counties table structure
        // Later, we'll update this to filter by country_id
        const { data, error } = await supabase
          .from("counties")
          .select("name")
          .order("name");

        if (error) {
          console.error("Error fetching counties:", error);
          return;
        }

        // Extract unique counties
        const uniqueCounties = data.map(item => item.name);
        setCounties(uniqueCounties);
        
        // When database is updated, use this query instead:
        /*
        const { data, error } = await supabase
          .from("counties")
          .select("name")
          .eq("country_id", selectedCountry)
          .order("name");
        */
      } catch (error) {
        console.error("Failed to fetch counties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounties();
    
    // Reset county selection when country changes
    onCountyChange("all");
  }, [selectedCountry, onCountyChange]);

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
