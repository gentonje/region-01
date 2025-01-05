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

export const CurrencySelector = ({ value, onValueChange }: CurrencySelectorProps) => {
  const { data: currencies, isLoading, error } = useQuery({
    queryKey: ['currencies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('currencies')
        .select('code, name, symbol, rate, status')
        .eq('status', 'active')
        .order('code');
      
      if (error) {
        console.error('Error fetching currencies:', error);
        toast.error('Failed to load currencies');
        throw error;
      }
      
      return data as CurrencyData[];
    }
  });

  if (isLoading) return null;
  if (error) return null;

  return (
    <Select value={value} onValueChange={(val) => onValueChange(val as SupportedCurrency)}>
      <SelectTrigger className="w-[80px] px-2 h-8">
        <div className="flex items-center gap-2">
          <Currency className="h-4 w-4" />
          <SelectValue>{value}</SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {currencies?.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            {currency.code} ({currency.symbol || currency.code})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};