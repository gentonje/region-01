
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface CurrencySelectorProps {
  value: SupportedCurrency;
  onValueChange: (currency: SupportedCurrency) => void;
  variant?: "default" | "compact";
}

interface CurrencyData {
  code: string;
  name: string;
  symbol: string | null;
  rate: number;
  status: 'active' | 'inactive';
}

export const CurrencySelector = ({ 
  value = "USD", 
  onValueChange,
  variant = "default"
}: CurrencySelectorProps) => {
  // We'll use these as fallback only if the query fails
  const [fallbackCurrencies, setFallbackCurrencies] = useState<CurrencyData[]>([
    { code: "USD", name: "US Dollar", symbol: "$", rate: 1, status: 'active' },
    { code: "KES", name: "Kenyan Shilling", symbol: "KSh", rate: 130, status: 'active' },
    { code: "SSP", name: "South Sudanese Pound", symbol: "SSP", rate: 650, status: 'active' },
    { code: "RWF", name: "Rwandan Franc", symbol: "RF", rate: 1200, status: 'active' },
  ]);

  const { data: currencies, isLoading, error } = useQuery({
    queryKey: ['currencies'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('currencies')
          .select('code, name, symbol, rate, status')
          .eq('status', 'active')
          .order('code');
        
        if (error) {
          console.error('Error fetching currencies:', error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          return fallbackCurrencies;
        }
        
        console.log('Fetched currencies:', data);
        return data as CurrencyData[];
      } catch (err) {
        console.error('Failed to fetch currencies:', err);
        return fallbackCurrencies;
      }
    },
    retry: 1,
    retryDelay: 1000,
    meta: {
      onError: (error: Error) => {
        console.error('Query error fetching currencies:', error);
        toast.error('Failed to load currencies, using defaults');
      }
    }
  });

  // Ensure we always have some currencies to display
  const displayCurrencies = currencies?.length ? currencies : fallbackCurrencies;

  // Log when currency changes (helpful for debugging)
  useEffect(() => {
    console.log('Changing currency to:', value);
  }, [value]);

  return (
    <Select value={value} onValueChange={(val) => onValueChange(val as SupportedCurrency)}>
      <SelectTrigger 
        className={
          variant === "compact" 
            ? "w-[60px] px-1 h-6 text-xs bg-emerald-500/20 border-emerald-500/40" 
            : "w-[80px] px-2 h-8"
        }
      >
        <div className="flex items-center gap-1">
          {variant === "default" && <DollarSign className="h-4 w-4" />}
          <SelectValue>{value}</SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        {displayCurrencies.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            {currency.code} ({currency.symbol || currency.code})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
