
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CartItemProps {
  id: string;
  title: string;
  quantity: number;
  price: number;
  currency: string;
  onDelete: () => void;
}

export const CartItem = ({ id, title, quantity, price, currency, onDelete }: CartItemProps) => {
  return (
    <div className="flex justify-between items-center border-b pb-4">
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">
          Quantity: {quantity}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <p className="font-medium">
          {currency} {Math.round(price * quantity).toLocaleString()}
        </p>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
