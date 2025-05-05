
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
}

export const CountiesFilter = ({
  selectedCounty,
  onCountyChange,
}: CountiesFilterProps) => {
  const [counties, setCounties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounties = async () => {
      try {
        setLoading(true);
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
      } catch (error) {
        console.error("Failed to fetch counties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounties();
  }, []);

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
