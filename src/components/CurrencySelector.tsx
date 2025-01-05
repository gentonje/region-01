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

interface CurrencySelectorProps {
  value: SupportedCurrency;
  onValueChange: (currency: SupportedCurrency) => void;
}

interface CurrencyData {
  code: string;
  name: string;
  symbol: string | null;
}

export const CurrencySelector = ({ value, onValueChange }: CurrencySelectorProps) => {
  const { data: currencies, isLoading } = useQuery({
    queryKey: ['currencies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('currencies')
        .select('code, name, symbol')
        .eq('status', 'active')
        .order('code');
      
      if (error) throw error;
      return data as CurrencyData[];
    }
  });

  if (isLoading) return null;

  return (
    <Select value={value} onValueChange={(val) => onValueChange(val as SupportedCurrency)}>
      <SelectTrigger className="w-[80px] px-2">
        <div className="flex items-center gap-2">
          <Currency className="h-4 w-4" />
          <SelectValue>{value}</SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {currencies?.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            {currency.code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};