
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
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [regionType, setRegionType] = useState("county");

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoading(true);
        console.log("Fetching regions for country ID:", selectedCountry);
        
        // Only fetch regions if a specific country is selected
        if (selectedCountry && selectedCountry !== "all") {
          const { data, error } = await supabase
            .from("regions")
            .select("id, name, country_id, region_type")
            .eq("country_id", Number(selectedCountry))
            .order("name");

          if (error) {
            console.error("Error fetching regions:", error);
            return;
          }

          console.log("Regions data:", data);
          setRegions(data || []);
          
          // Set region type based on first region
          if (data && data.length > 0) {
            setRegionType(data[0].region_type);
            console.log("Setting region type to:", data[0].region_type);
          }
        } else {
          setRegions([]);
        }
      } catch (error) {
        console.error("Failed to fetch regions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
    // Reset region selection when country changes
    onRegionChange("all");
  }, [selectedCountry, onRegionChange]);

  // First letter uppercase for the region type label
  const regionTypeLabel = regionType.charAt(0).toUpperCase() + regionType.slice(1);

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
                ? `Loading ${regionTypeLabel}s...`
                : `Select ${regionTypeLabel}`
          } />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800">
          <SelectItem value="all">All {regionTypeLabel}s</SelectItem>
          {regions.map((region) => (
            <SelectItem key={region.id} value={region.name}>
              {region.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
