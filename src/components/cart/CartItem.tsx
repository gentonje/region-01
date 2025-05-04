
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { useCartMutations } from "@/hooks/useCartMutations";

interface CartItemProps {
  id: string;
  title: string;
  quantity: number;
  price: number;
  currency: string;
  onDelete: () => void;
}

export const CartItem = ({ id, title, quantity, price, currency, onDelete }: CartItemProps) => {
  const { updateQuantityMutation } = useCartMutations();
  const itemTotal = quantity * price;
  
  const handleIncreaseQuantity = () => {
    updateQuantityMutation.mutate({ itemId: id, quantity: quantity + 1 });
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      updateQuantityMutation.mutate({ itemId: id, quantity: quantity - 1 });
    } else {
      onDelete();
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-between items-center border-b pb-4"
    >
      <div className="flex-grow">
        <h3 className="font-medium">{title || "Unnamed Product"}</h3>
        <div className="flex items-center mt-2 text-sm text-muted-foreground">
          <button 
            onClick={handleDecreaseQuantity}
            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="mx-2 w-6 text-center">{quantity}</span>
          <button 
            onClick={handleIncreaseQuantity}
            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            <Plus className="h-3 w-3" />
          </button>
          <span className="ml-2">× {currency} {Math.round(price).toLocaleString()}</span>
        </div>
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
