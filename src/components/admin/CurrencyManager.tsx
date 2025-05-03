
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DollarSign, Save } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { refreshCurrencyRates } from "@/utils/currencyConverter";

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string | null;
  rate: number;
  status: 'active' | 'inactive';
}

export const CurrencyManager = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingRates, setEditingRates] = useState<Record<string, string>>({});
  const [savingCurrencies, setSavingCurrencies] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const { data: currencies, isLoading } = useQuery({
    queryKey: ['currencies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('currencies')
        .select('*')
        .order('code');
      
      if (error) {
        toast.error('Failed to load currencies');
        throw error;
      }
      return data as Currency[];
    },
  });

  const updateRateMutation = useMutation({
    mutationFn: async ({ id, rate }: { id: string; rate: number }) => {
      setSavingCurrencies(prev => ({ ...prev, [id]: true }));
      const { error } = await supabase
        .from('currencies')
        .update({ rate, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: async (_, { id }) => {
      // Force refresh the cached currency rates
      await refreshCurrencyRates();
      
      // Then invalidate the query to refresh UI
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      toast.success('Currency rate updated successfully');
      setSavingCurrencies(prev => ({ ...prev, [id]: false }));
      
      // Only clear the editing state for this specific currency
      setEditingRates(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    },
    onError: (_, { id }) => {
      toast.error('Failed to update currency rate');
      setSavingCurrencies(prev => ({ ...prev, [id]: false }));
    },
  });

  const handleRateChange = (currencyId: string, value: string) => {
    // Prevent negative values
    if (value.startsWith('-')) return;
    
    // Update only the edited currency's rate, keeping others unchanged
    setEditingRates(prev => ({
      ...prev,
      [currencyId]: value,
    }));
  };

  const handleSaveRate = async (currency: Currency) => {
    const newRateString = editingRates[currency.id];
    if (!newRateString) {
      toast.error('No changes to save');
      return;
    }
    
    const newRate = parseFloat(newRateString);
    if (isNaN(newRate) || newRate <= 0) {
      toast.error('Please enter a valid positive number');
      return;
    }
    
    await updateRateMutation.mutateAsync({ id: currency.id, rate: newRate });
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div
        onClick={handleClick}
        className="relative flex cursor-pointer select-none items-center rounded-sm pl-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
      >
        <DollarSign className="mr-2 h-4 w-4" />
        <span>Currencies</span>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className={`${isMobile ? 'w-[95vw] max-w-none' : 'sm:max-w-[425px]'}`}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Currency Management</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] rounded-md border">
            <div className="p-4">
              <div className="min-w-full table">
                <div className="sticky top-0 bg-background border-b">
                  <div className="grid grid-cols-5 gap-2 p-2 text-sm font-medium">
                    <div className="col-span-1">Code</div>
                    <div className={`${isMobile ? 'hidden' : 'col-span-1'}`}>Name</div>
                    <div className="col-span-2">Rate</div>
                    <div className={`${isMobile ? 'hidden' : 'col-span-1'}`}>Status</div>
                  </div>
                </div>
                <div className="divide-y">
                  {currencies?.map((currency) => (
                    <div key={currency.id} className="grid grid-cols-5 gap-2 p-2 items-center text-sm">
                      <div className="col-span-1">{currency.code}</div>
                      <div className={`${isMobile ? 'hidden' : 'col-span-1'}`}>{currency.name}</div>
                      <div className="col-span-2 flex items-center gap-2">
                        <Input
                          type="number"
                          value={editingRates[currency.id] !== undefined ? editingRates[currency.id] : currency.rate}
                          onChange={(e) => handleRateChange(currency.id, e.target.value)}
                          className="w-24 h-8"
                          step="0.0001"
                          min="0"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveRate(currency);
                          }}
                          disabled={!editingRates[currency.id] || savingCurrencies[currency.id]}
                        >
                          {savingCurrencies[currency.id] ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className={`${isMobile ? 'hidden' : 'col-span-1'}`}>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          currency.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                        }`}>
                          {currency.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};
