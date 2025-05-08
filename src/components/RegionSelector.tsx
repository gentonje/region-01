
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Region } from "@/types/product";
import { toast } from "sonner";
import { MapPin } from "lucide-react";

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
  const previousCountry = useRef(selectedCountry);
  
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
            toast.error("Failed to load districts");
            return;
          }

          console.log("Districts data:", data);
          setDistricts(data || []);
        } else {
          setDistricts([]);
        }
      } catch (error) {
        console.error("Failed to fetch districts:", error);
        toast.error("Failed to load districts");
      } finally {
        setLoading(false);
      }
    };

    fetchDistricts();
    
    // Only reset region selection when country changes
    if (previousCountry.current !== selectedCountry) {
      onRegionChange("all");
      previousCountry.current = selectedCountry;
    }
  }, [selectedCountry, onRegionChange]);

  const renderTriggerContent = () => {
    if (selectedRegion === "all") {
      return (
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-2" />
          <span>All Districts</span>
        </div>
      );
    } else {
      return selectedRegion;
    }
  };

  const handleRegionChange = (value: string) => {
    console.log("Region changed to:", value);
    onRegionChange(value);
  };

  return (
    <div className="w-full max-w-xs">
      <Select
        value={selectedRegion}
        onValueChange={handleRegionChange}
        disabled={loading || !selectedCountry || selectedCountry === "all"}
      >
        <SelectTrigger className="w-full h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <SelectValue>
            {selectedCountry === "all" ? (
              "Select country first"
            ) : loading ? (
              "Loading districts..."
            ) : (
              renderTriggerContent()
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <SelectItem value="all">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              <span>All Districts</span>
            </div>
          </SelectItem>
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
