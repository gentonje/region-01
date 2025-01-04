import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SupportedCurrency } from "@/utils/currencyConverter";

interface CurrencySelectorProps {
  value: SupportedCurrency;
  onValueChange: (value: SupportedCurrency) => void;
}

export const CurrencySelector = ({ value, onValueChange }: CurrencySelectorProps) => {
  return (
    <Select value={value} onValueChange={(val) => onValueChange(val as SupportedCurrency)}>
      <SelectTrigger className="w-24">
        <SelectValue placeholder="Currency" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="SSP">SSP</SelectItem>
        <SelectItem value="USD">USD</SelectItem>
        <SelectItem value="KES">KES</SelectItem>
        <SelectItem value="UGX">UGX</SelectItem>
        <SelectItem value="RWF">RWF</SelectItem>
        <SelectItem value="ETB">ETB</SelectItem>
        <SelectItem value="ERN">ERN</SelectItem>
        <SelectItem value="DJF">DJF</SelectItem>
        <SelectItem value="TZS">TZS</SelectItem>
      </SelectContent>
    </Select>
  );
};