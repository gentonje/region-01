import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SupportedCurrency } from "@/utils/currencyConverter";
import { DollarSign } from "lucide-react";

interface CurrencySelectorProps {
  value: SupportedCurrency;
  onValueChange: (value: SupportedCurrency) => void;
}

export const CurrencySelector = ({ value, onValueChange }: CurrencySelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <DollarSign className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={(val) => onValueChange(val as SupportedCurrency)}>
        <SelectTrigger className="w-24">
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="SSP">SSP</SelectItem>
          <SelectItem value="KES">KES</SelectItem>
          <SelectItem value="UGX">UGX</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};