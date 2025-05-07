
import { useMutation } from "@tanstack/react-query";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CartEmpty } from "@/components/cart/CartEmpty";
import { CartList } from "@/components/cart/CartList";
import { CheckoutSection } from "@/components/cart/CheckoutSection";
import { useCart } from "@/hooks/useCart";

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, isLoading, totalAmount } = useCart();
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto px-1 py-8"
    >
      <BreadcrumbNav
        items={[
          { href: "/products", label: "Home" },
          { label: "Cart", isCurrent: true }
        ]}
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Button>
        </motion.div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading cart...</div>
      ) : cartItems?.length === 0 ? (
        <CartEmpty />
      ) : (
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4 border"
          >
            <h2 className="text-lg font-medium border-b pb-2">
              Cart Items ({cartItems?.length})
            </h2>
            <CartList items={cartItems} />
          </motion.div>

          <CheckoutSection 
            totalAmount={totalAmount} 
            isProcessing={false} 
          />
        </div>
      )}
    </motion.div>
  );
};

export default Cart;
