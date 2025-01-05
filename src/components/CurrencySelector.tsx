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
  onValueChange: (currency: SupportedCurrency) => void;
}

export const CurrencySelector = ({ value, onValueChange }: CurrencySelectorProps) => {
  return (
    <Select value={value} onValueChange={(val) => onValueChange(val as SupportedCurrency)}>
      <SelectTrigger className="w-[80px] px-2">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          <span>{value}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="SSP">SSP</SelectItem>
        <SelectItem value="KES">KES</SelectItem>
        <SelectItem value="UGX">UGX</SelectItem>
      </SelectContent>
    </Select>
  );
};