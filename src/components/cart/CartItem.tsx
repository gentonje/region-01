
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface CartItemProps {
  id: string;
  title: string;
  quantity: number;
  price: number;
  currency: string;
  onDelete: () => void;
}

export const CartItem = ({ id, title, quantity, price, currency, onDelete }: CartItemProps) => {
  const itemTotal = quantity * price;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-between items-center border-b pb-4"
    >
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">
          Quantity: {quantity} × {currency} {Math.round(price).toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <p className="font-medium">
          {currency} {Math.round(itemTotal).toLocaleString()}
        </p>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
