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
      <SelectTrigger className="w-[42px] px-2">
        <DollarSign className="h-4 w-4" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="SSP">SSP</SelectItem>
        <SelectItem value="KES">KES</SelectItem>
        <SelectItem value="UGX">UGX</SelectItem>
      </SelectContent>
    </Select>
  );
};