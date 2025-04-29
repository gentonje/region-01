
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { Currency } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface CurrencySelectorProps {
  value: SupportedCurrency;
  onValueChange: (currency: SupportedCurrency) => void;
}

interface CurrencyData {
  code: string;
  name: string;
  symbol: string | null;
  rate: number;
  status: 'active' | 'inactive';
}

export const CurrencySelector = ({ value = "USD", onValueChange }: CurrencySelectorProps) => {
  const [fallbackCurrencies, setFallbackCurrencies] = useState<CurrencyData[]>([
    { code: "USD", name: "US Dollar", symbol: "$", rate: 1, status: 'active' },
    { code: "SSP", name: "South Sudanese Pound", symbol: "SSP", rate: 625, status: 'active' },
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
        
        return data as CurrencyData[];
      } catch (err) {
        console.error('Failed to fetch currencies:', err);
        return fallbackCurrencies;
      }
    },
    // Remove the onError property and handle errors within queryFn
    retry: 1,
    retryDelay: 1000,
    // Use onSettled which is supported in the current version
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
    console.log('Current selected currency:', value);
  }, [value]);

  return (
    <Select value={value} onValueChange={(val) => onValueChange(val as SupportedCurrency)}>
      <SelectTrigger className="w-[80px] px-2 h-8">
        <div className="flex items-center gap-2">
          <Currency className="h-4 w-4" />
          <SelectValue>{value}</SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {displayCurrencies.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            {currency.code} ({currency.symbol || currency.code})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
