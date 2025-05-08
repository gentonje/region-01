
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CountiesFilterProps {
  selectedCounty: string;
  onCountyChange: (county: string) => void;
  selectedCountry?: string; // Country ID
}

export const CountiesFilter = ({
  selectedCounty,
  onCountyChange,
  selectedCountry = "1", // Default to Kenya (id: 1)
}: CountiesFilterProps) => {
  const [districts, setDistricts] = useState<{id: number, name: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        setLoading(true);
        
        if (!selectedCountry || selectedCountry === "all") {
          setDistricts([]);
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

        console.log("Fetched districts:", data);
        setDistricts(data || []);
      } catch (error) {
        console.error("Failed to fetch districts:", error);
        toast.error("Failed to load districts");
      } finally {
        setLoading(false);
      }
    };

    fetchDistricts();
    
    // Reset county selection when country changes
    onCountyChange("all");
  }, [selectedCountry, onCountyChange]);

  return (
    <div className="w-full max-w-xs">
      <Select
        value={selectedCounty}
        onValueChange={(value) => {
          console.log("District changed to:", value);
          onCountyChange(value);
        }}
        disabled={loading || !selectedCountry || selectedCountry === "all"}
      >
        <SelectTrigger className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <SelectValue 
            placeholder={
              !selectedCountry || selectedCountry === "all" 
                ? "Select country first" 
                : loading 
                  ? "Loading districts..." 
                  : "Select district"
            } 
          />
        </SelectTrigger>
        <SelectContent className="z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
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
