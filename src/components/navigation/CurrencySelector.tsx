import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SupportedCurrency } from "@/utils/currencyConverter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CurrencySelectorProps {
  onCurrencyChange?: (currency: SupportedCurrency) => void;
  currency: SupportedCurrency;
}

export const CurrencySelector = ({ onCurrencyChange, currency }: CurrencySelectorProps) => {
  if (!onCurrencyChange) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-all"
              >
                <DollarSign className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {["SSP", "USD", "KES", "UGX", "RWF", "ETB", "ERN", "DJF", "TZS"].map((code) => (
                <DropdownMenuItem 
                  key={code}
                  onClick={() => onCurrencyChange(code as SupportedCurrency)}
                >
                  {code}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>
          <p>Select Currency ({currency})</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};