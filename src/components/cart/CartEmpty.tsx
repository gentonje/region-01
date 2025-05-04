
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function CartEmpty() {
  const navigate = useNavigate();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-8 space-y-4"
    >
      <ShoppingBag className="h-16 w-16 mx-auto text-gray-400" />
      <h2 className="text-xl font-medium">Your cart is empty</h2>
      <p className="text-gray-500">
        Looks like you haven't added anything to your cart yet.
      </p>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button onClick={() => navigate("/products")}>Start Shopping</Button>
      </motion.div>
    </motion.div>
  );
}
