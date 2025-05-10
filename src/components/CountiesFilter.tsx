
import { useEffect, useState, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MapPin } from "lucide-react";

interface CountiesFilterProps {
  selectedCounty: string;
  onCountyChange: (county: string) => void;
  selectedCountry?: string; // Country ID
  showAllOption?: boolean; // New prop to control "All Districts" option
}

export const CountiesFilter = ({
  selectedCounty,
  onCountyChange,
  selectedCountry = "1", // Default to Kenya (id: 1)
  showAllOption = true, // Default to showing "All Districts" option
}: CountiesFilterProps) => {
  const [districts, setDistricts] = useState<{id: number, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const previousCountry = useRef(selectedCountry);

  useEffect(() => {
    const fetchDistricts = async () => {
      // Skip if the country hasn't changed to prevent unnecessary fetches
      if (previousCountry.current === selectedCountry && districts.length > 0) return;
      
      try {
        setLoading(true);
        
        // Skip the fetch if the country is "all", but don't disable the control
        if (selectedCountry === "all") {
          setDistricts([]);
          setLoading(false);
          previousCountry.current = selectedCountry;
          return;
        }
          
        // Use districts table for all countries
        const { data, error } = await supabase
          .from("districts")
          .select("id, name")
          .eq("country_id", Number(selectedCountry))
          .order("name");

        if (error) {
          console.error("Error fetching districts:", error);
          toast.error("Failed to load districts");
          return;
        }

        console.log(`Fetched ${data?.length || 0} districts for country ${selectedCountry}`);
        setDistricts(data || []);
        previousCountry.current = selectedCountry;
          
        // Auto-select first district if we have districts and all option is disabled
        if (!showAllOption && data && data.length > 0 && (!selectedCounty || selectedCounty === "all")) {
          onCountyChange(data[0].name);
        }
      } catch (error) {
        console.error("Failed to fetch districts:", error);
        toast.error("Failed to load districts");
      } finally {
        setLoading(false);
      }
    };

    fetchDistricts();
    
    // Reset county selection when country changes
    if (previousCountry.current !== selectedCountry) {
      console.log("Country changed from", previousCountry.current, "to", selectedCountry, "- resetting county");
      onCountyChange(showAllOption ? "all" : "");
    }
  }, [selectedCountry, onCountyChange, selectedCounty, showAllOption, districts.length]);

  // Memoize the trigger content to prevent unnecessary renders
  const triggerContent = useMemo(() => {
    if (selectedCounty === "all" || !selectedCounty) {
      return (
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-2" />
          <span>All Districts</span>
        </div>
      );
    } else {
      return selectedCounty;
    }
  }, [selectedCounty]);

  const handleDistrictChange = (value: string) => {
    console.log("District changed to:", value);
    onCountyChange(value);
  };

  return (
    <div className="w-full">
      <Select
        value={selectedCounty || (showAllOption ? "all" : "")}
        onValueChange={handleDistrictChange}
        // Only disable when explicitly undefined, not when "all"
        disabled={loading || selectedCountry === undefined}
      >
        <SelectTrigger className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <SelectValue>
            {selectedCountry === undefined ? (
              "Select country first"
            ) : loading ? (
              "Loading districts..."
            ) : (
              triggerContent
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          {showAllOption && (
            <SelectItem value="all">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>All Districts</span>
              </div>
            </SelectItem>
          )}
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
