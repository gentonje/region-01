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
  const queryClient = useQueryClient();

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
      const { error } = await supabase
        .from('currencies')
        .update({ rate, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      toast.success('Currency rate updated successfully');
    },
    onError: () => {
      toast.error('Failed to update currency rate');
    },
  });

  const handleRateChange = (currencyId: string, value: string) => {
    setEditingRates(prev => ({
      ...prev,
      [currencyId]: value,
    }));
  };

  const handleSaveRate = async (currency: Currency) => {
    const newRate = parseFloat(editingRates[currency.id] || String(currency.rate));
    if (isNaN(newRate)) {
      toast.error('Please enter a valid number');
      return;
    }
    await updateRateMutation.mutateAsync({ id: currency.id, rate: newRate });
    setEditingRates(prev => {
      const updated = { ...prev };
      delete updated[currency.id];
      return updated;
    });
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Currency Management</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px] rounded-md border">
            <div className="p-4">
              <table className="w-full">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b">
                    <th className="p-2 text-left">Code</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Rate</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currencies?.map((currency) => (
                    <tr key={currency.id} className="border-b">
                      <td className="p-2">{currency.code}</td>
                      <td className="p-2">{currency.name}</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={editingRates[currency.id] ?? currency.rate}
                          onChange={(e) => handleRateChange(currency.id, e.target.value)}
                          className="w-24 h-8"
                          step="0.01"
                        />
                      </td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          currency.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {currency.status}
                        </span>
                      </td>
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSaveRate(currency)}
                          disabled={!editingRates[currency.id]}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};