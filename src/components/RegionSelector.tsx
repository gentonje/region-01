
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Region } from "@/types/product";

interface RegionSelectorProps {
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  selectedCountry: string;
}

export const RegionSelector = ({
  selectedRegion,
  onRegionChange,
  selectedCountry = "1", // Default to Kenya (id: 1)
}: RegionSelectorProps) => {
  const [districts, setDistricts] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        setLoading(true);
        console.log("Fetching districts for country ID:", selectedCountry);
        
        // Only fetch districts if a specific country is selected
        if (selectedCountry && selectedCountry !== "all") {
          const { data, error } = await supabase
            .from("districts")
            .select("id, name, country_id")
            .eq("country_id", Number(selectedCountry))
            .order("name");

          if (error) {
            console.error("Error fetching districts:", error);
            return;
          }

          console.log("Districts data:", data);
          setDistricts(data || []);
        } else {
          setDistricts([]);
        }
      } catch (error) {
        console.error("Failed to fetch districts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDistricts();
    // Reset region selection when country changes
    onRegionChange("all");
  }, [selectedCountry, onRegionChange]);

  return (
    <div className="w-full max-w-xs">
      <Select
        value={selectedRegion}
        onValueChange={onRegionChange}
        disabled={loading || !selectedCountry || selectedCountry === "all"}
      >
        <SelectTrigger className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <SelectValue placeholder={
            selectedCountry === "all" 
              ? "Select country first" 
              : loading
                ? "Loading districts..."
                : "Select district"
          } />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800">
          <SelectItem value="all">All Districts</SelectItem>
          {districts.map((district) => (
            <SelectItem key={district.id} value={district.name}>
              {district.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
