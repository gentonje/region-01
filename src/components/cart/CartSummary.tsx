
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface CartSummaryProps {
  currency: string;
  totalAmount: number;
  selectedPaymentMethod: string;
  onPaymentMethodChange: (value: string) => void;
  onCheckout: () => void;
  isLoading: boolean;
}

export const CartSummary = ({
  currency,
  totalAmount,
  selectedPaymentMethod,
  onPaymentMethodChange,
  onCheckout,
  isLoading,
}: CartSummaryProps) => {
  return (
    <div className="space-y-1 m-1 p-1">
      <div>
        <label className="block text-sm font-medium mb-1">
          Payment Method
        </label>
        <Select
          value={selectedPaymentMethod}
          onValueChange={onPaymentMethodChange}
        >
          <SelectTrigger className="p-1">
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stripe">Credit Card (Stripe)</SelectItem>
            <SelectItem value="paypal">PayPal</SelectItem>
            <SelectItem value="mpesa">M-Pesa</SelectItem>
            <SelectItem value="mtn_momo">MTN Mobile Money</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="pt-1 border-t">
        <motion.p 
          className="flex justify-between mb-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span>Total</span>
          <motion.span 
            className="font-bold"
            key={totalAmount}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {currency} {Math.round(totalAmount).toLocaleString()}
          </motion.span>
        </motion.p>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            className="w-full p-1 bg-violet-600 hover:bg-violet-700"
            onClick={onCheckout}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Proceed to Checkout"
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
